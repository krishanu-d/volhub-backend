import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ReturningStatementNotSupportedError } from 'typeorm';
import { Opportunity } from './entities/opportunity.entity';
import { CreateOpportunityDto } from './dto/create-opportunity.dto';
import { UpdateOpportunityDto } from './dto/update-opportunity.dto';
import { FindOpportunitiesQueryDto } from './dto/find-opportunities-query.dto';
import {
  OpportunityCategory,
  OpportunityOrderBy,
  OpportunitySortBy,
  OrderDirection,
  RabbitMQEventType,
  RabbitMQRoutingKey,
  SortOrder,
} from 'src/enums';
import { User } from 'src/users/entities/user.entity';
import { RabbitMQService } from 'src/rabbitmq/rabbitmq.service';

@Injectable()
export class OpportunitiesService {
  private readonly logger = new Logger(OpportunitiesService.name);
  constructor(
    @InjectRepository(Opportunity)
    private opportunitiesRepository: Repository<Opportunity>,
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    private readonly rabbitMQService: RabbitMQService, // Inject the RabbitMQService
  ) {}

  async create(
    createOpportunityDto: CreateOpportunityDto,
  ): Promise<Opportunity> {
    const opportunity =
      this.opportunitiesRepository.create(createOpportunityDto);
    const savedOpportunity =
      await this.opportunitiesRepository.save(opportunity);

    // --- Publish Notification Event: New Opportunity Created ---
    try {
      // The Go service will handle finding relevant volunteers based on categories/subscriptions
      await this.rabbitMQService.publish(
        RabbitMQRoutingKey.OPPORTUNITY_CREATED, // Routing key for new opportunities
        {
          type: RabbitMQEventType.OPPORTUNITY_CREATED,
          opportunityId: savedOpportunity.id,
          opportunityTitle: savedOpportunity.title,
          opportunityCategories: savedOpportunity.categories, // Include categories for matching
          opportunityLatitude: savedOpportunity.latitude,
          opportunityLongitude: savedOpportunity.longitude,
          ngoId: savedOpportunity.ngo.id,
          ngoName: savedOpportunity.ngo.name,
        },
      );
    } catch (error) {
      this.logger.error(
        `Failed to publish NEW_OPPORTUNITY event for Opportunity ID ${savedOpportunity.id}: ${error.message}`,
      );
    }

    return savedOpportunity;
  }

  async findAll(
    query: FindOpportunitiesQueryDto,
    userId?: number,
  ): Promise<{ data: Opportunity[]; total: number }> {
    const {
      categories: queryCategories,
      search,
      startDate,
      endDate,
      latitude: queryLatitude,
      longitude: queryLongitude,
      radiusKm: queryRadiusKm,
      ngoName,
      page = 1,
      limit = 10,
      sortBy = OpportunitySortBy.CREATED_AT,
      sortOrder = SortOrder.DESC,
    } = query;

    const skip = (page - 1) * limit;

    // Fetch the full user profile if an authenticated user is present
    let fullUserProfile: User | undefined | null;
    if (userId) {
      // Select only necessary fields (categories, latitude, longitude)
      fullUserProfile = await this.usersRepository.findOne({
        where: { id: userId },
        select: ['id', 'categories', 'latitude', 'longitude'],
      });
    }

    const queryBuilder =
      this.opportunitiesRepository.createQueryBuilder('opportunity');
    queryBuilder.leftJoinAndSelect('opportunity.ngo', 'ngo');

    // --- 1. Determine Effective Categories for Filtering ---
    let effectiveCategories: OpportunityCategory[] | undefined;
    if (queryCategories && queryCategories.length > 0) {
      effectiveCategories = queryCategories;
    } else if (
      fullUserProfile &&
      fullUserProfile.categories &&
      fullUserProfile.categories.length > 0
    ) {
      effectiveCategories = fullUserProfile.categories;
    }

    if (effectiveCategories && effectiveCategories.length > 0) {
      // Construct the PostgreSQL array literal string
      // For example, ['education', 'health'] becomes '{"education","health"}'
      const pgArrayLiteral =
        '{' + effectiveCategories.map((c) => `"${c}"`).join(',') + '}';
      console.log('pgArrayLiteral:', pgArrayLiteral);
      // Use the '&&' (overlaps) operator with the explicitly cast string literal
      queryBuilder.andWhere(
        'opportunity.categories && :pgArrayLiteral::opportunities_categories_enum[]', // <--- CORRECTED LINE
        { pgArrayLiteral: pgArrayLiteral }, // Pass the constructed string literal
      );
    }

    // --- 2. Determine Effective Location for Filtering and Sorting ---
    let effectiveLatitude: number | undefined;
    let effectiveLongitude: number | number | undefined;
    let effectiveRadiusKm: number | undefined; // This will hold the effective radius

    // Priority 1: Location provided in query parameters
    if (
      queryLatitude !== undefined &&
      queryLongitude !== undefined &&
      queryRadiusKm !== undefined
    ) {
      effectiveLatitude = queryLatitude;
      effectiveLongitude = queryLongitude;
      effectiveRadiusKm = queryRadiusKm;
    }
    // Priority 2: User's saved location (for personalized view)
    else if (
      fullUserProfile &&
      fullUserProfile.latitude !== undefined &&
      fullUserProfile.longitude !== undefined
    ) {
      effectiveLatitude = fullUserProfile.latitude;
      effectiveLongitude = fullUserProfile.longitude;
      // Default to 20km if user's location is used and no radius is in query
      effectiveRadiusKm = 20;
    }
    // If no location (neither query nor user profile) then effectiveLocation will remain undefined

    // --- 3. Apply Location-based Filtering and Sorting (Database-side Haversine) ---
    if (
      effectiveLatitude !== undefined &&
      effectiveLongitude !== undefined &&
      effectiveRadiusKm !== undefined
    ) {
      if (effectiveRadiusKm < 0) {
        throw new BadRequestException('Radius must be a non-negative number.');
      }

      // Add distance calculation to SELECT clause to use for ORDER BY
      queryBuilder.addSelect(
        `
        (6371 * acos(
            cos(radians(:effectiveLatitude)) * cos(radians(opportunity.latitude)) *
            cos(radians(opportunity.longitude) - radians(:effectiveLongitude)) +
            sin(radians(:effectiveLatitude)) * sin(radians(opportunity.latitude))
        ))`,
        'distance', // Alias for the calculated distance
      );

      // Apply location filter (distance <= radius)
      queryBuilder.andWhere(
        `
        (6371 * acos(
            cos(radians(:effectiveLatitude)) * cos(radians(opportunity.latitude)) *
            cos(radians(opportunity.longitude) - radians(:effectiveLongitude)) +
            sin(radians(:effectiveLatitude)) * sin(radians(opportunity.latitude))
        )) <= :effectiveRadiusKm
        `,
        {
          effectiveLatitude,
          effectiveLongitude,
          effectiveRadiusKm,
        },
      );

      // Primary sort by distance
      queryBuilder.orderBy('distance', SortOrder.ASC);
      // Secondary sort: by creation date for opportunities at similar distances
      queryBuilder.addOrderBy('opportunity.createdAt', SortOrder.DESC);
    } else {
      // --- Fallback Sorting (if no effective location for filtering/sorting) ---
      if (sortBy === OpportunitySortBy.NGO_NAME) {
        queryBuilder.orderBy(`ngo.name`, sortOrder);
      } else {
        queryBuilder.orderBy(`opportunity.${sortBy}`, sortOrder);
      }
    }

    // --- 4. Apply Other Filters (Search, Date, NGO Name) ---
    if (search) {
      queryBuilder.andWhere(
        '(opportunity.title ILIKE :search OR opportunity.description ILIKE :search)',
        { search: `%${search}%` },
      );
    }

    if (startDate && endDate) {
      queryBuilder.andWhere(
        'opportunity.startDate BETWEEN :startDate AND :endDate',
        {
          startDate: new Date(startDate),
          endDate: new Date(endDate),
        },
      );
    } else if (startDate) {
      queryBuilder.andWhere('opportunity.startDate >= :startDate', {
        startDate: new Date(startDate),
      });
    } else if (endDate) {
      queryBuilder.andWhere('opportunity.endDate <= :endDate', {
        endDate: new Date(endDate),
      });
    }

    if (ngoName) {
      queryBuilder.andWhere('ngo.name ILIKE :ngoName', {
        ngoName: `%${ngoName}%`,
      });
    }

    // Get total count before pagination
    const totalOpportunities = await queryBuilder.getCount();

    // Apply pagination
    queryBuilder.offset(skip).limit(limit);

    // Execute query and get both entities and raw results (for 'distance' field)
    const opportunities = await queryBuilder.getRawAndEntities();

    // Map raw distance to entities for easier access
    const mappedOpportunities = opportunities.entities.map((opp) => {
      const rawData = opportunities.raw.find(
        (r) => r.opportunity_id === opp.id,
      );
      return { ...opp, distance: rawData ? rawData.distance : null };
    });

    return {
      data: mappedOpportunities,
      total: totalOpportunities,
    };
  }

  async findRecent(limit: number = 10): Promise<Opportunity[]> {
    return this.opportunitiesRepository.find({
      relations: ['ngo'],
      order: { createdAt: 'DESC' },
      take: limit,
    });
  }

  async findOne(id: number): Promise<Opportunity> {
    const opportunity = await this.opportunitiesRepository.findOne({
      where: { id },
      relations: ['ngo'],
    });

    if (!opportunity) {
      throw new NotFoundException(`Opportunity with ID ${id} not found.`);
    }
    return opportunity;
  }

  async update(
    id: number,
    updateOpportunityDto: UpdateOpportunityDto,
    ngoUser: User,
  ): Promise<Opportunity> {
    const opportunity = await this.opportunitiesRepository.findOne({
      where: { id },
      relations: ['ngo'],
    });

    if (!opportunity) {
      throw new NotFoundException(`Opportunity with ID ${id} not found.`);
    }

    if (opportunity.ngo.id !== ngoUser.id) {
      throw new BadRequestException(
        'You are not authorized to update this opportunity.',
      );
    }

    Object.assign(opportunity, updateOpportunityDto);
    const updatedOpportunity =
      await this.opportunitiesRepository.save(opportunity);

    // --- Publish Notification Event: Opportunity Updated ---
    try {
      // The Go service will handle finding relevant volunteers based on categories/subscriptions
      await this.rabbitMQService.publish(
        RabbitMQRoutingKey.OPPORTUNITY_UPDATED, // Routing key for updated opportunities
        {
          type: RabbitMQEventType.OPPORTUNITY_UPDATED,
          opportunityId: updatedOpportunity.id,
          opportunityTitle: updatedOpportunity.title,
          opportunityCategories: updatedOpportunity.categories, // Include categories for matching
          opportunityLatitude: updatedOpportunity.latitude,
          opportunityLongitude: updatedOpportunity.longitude,
          ngoId: updatedOpportunity.ngo.id,
          ngoName: updatedOpportunity.ngo.name,
        },
      );
    } catch (error) {
      this.logger.error(
        `Failed to publish UPDATE_OPPORTUNITY event for Opportunity ID ${updatedOpportunity.id}: ${error.message}`,
      );
    }

    return updatedOpportunity;
  }

  async remove(id: number, ngoUser: User): Promise<void> {
    const opportunity = await this.opportunitiesRepository.findOne({
      where: { id },
      relations: ['ngo'],
    });

    if (!opportunity) {
      throw new NotFoundException(`Opportunity with ID ${id} not found.`);
    }

    if (opportunity.ngo.id !== ngoUser.id) {
      throw new BadRequestException(
        'You are not authorized to delete this opportunity.',
      );
    }

    // --- Publish Notification Event: Opportunity Deleted ---
    try {
      // The Go service will handle finding relevant volunteers based on categories/subscriptions
      await this.rabbitMQService.publish(
        RabbitMQRoutingKey.OPPORTUNITY_DELETED, // Routing key for new opportunities
        {
          type: RabbitMQEventType.OPPORTUNITY_DELETED,
          opportunityId: opportunity.id,
          opportunityTitle: opportunity.title,
          opportunityCategories: opportunity.categories, // Include categories for matching
          opportunityLatitude: opportunity.latitude,
          opportunityLongitude: opportunity.longitude,
          ngoId: opportunity.ngo.id,
          ngoName: opportunity.ngo.name,
        },
      );
    } catch (error) {
      this.logger.error(
        `Failed to publish DELETE_OPPORTUNITY event for Opportunity ID ${opportunity.id}: ${error.message}`,
      );
    }

    await this.opportunitiesRepository.delete(id);
  }
}
