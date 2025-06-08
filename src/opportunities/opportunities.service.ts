import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Opportunity } from './entities/opportunity.entity';
import { CreateOpportunityDto } from './dto/create-opportunity.dto';
import { UpdateOpportunityDto } from './dto/update-opportunity.dto';
import {
  FindOpportunitiesQueryDto,
  OpportunityOrderBy,
  OrderDirection,
} from './dto/find-opportunities-query.dto';

@Injectable()
export class OpportunitiesService {
  constructor(
    @InjectRepository(Opportunity)
    private opportunitiesRepository: Repository<Opportunity>,
  ) {}

  async create(
    createOpportunityDto: CreateOpportunityDto,
  ): Promise<Opportunity> {
    const opportunity =
      this.opportunitiesRepository.create(createOpportunityDto);
    return this.opportunitiesRepository.save(opportunity);
  }

  async findAll(
    query: FindOpportunitiesQueryDto,
  ): Promise<{ data: Opportunity[]; total: number }> {
    // <-- UPDATED RETURN TYPE
    const {
      keyword,
      startDate,
      endDate,
      latitude,
      longitude,
      radiusKm,
      ngoName,
      page = 1, // Default values for pagination
      limit = 10, // Default values for pagination
      orderBy = OpportunityOrderBy.CREATED_AT, // Default values for sorting
      orderDirection = OrderDirection.DESC, // Default values for sorting
    } = query;

    // Calculate skip based on page and limit
    const skip = (page - 1) * limit;

    // Initialize QueryBuilder
    const queryBuilder =
      this.opportunitiesRepository.createQueryBuilder('opportunity');

    // Always join with NGO to allow fetching NGO details or filtering by NGO name
    queryBuilder.leftJoinAndSelect('opportunity.ngo', 'ngo');

    // 1. Keyword search (in title or description)
    if (keyword) {
      queryBuilder.andWhere(
        '(opportunity.title ILIKE :keyword OR opportunity.description ILIKE :keyword)',
        { keyword: `%${keyword}%` },
      );
    }

    // 2. Date filtering
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

    // 3. NGO Name search
    if (ngoName) {
      queryBuilder.andWhere('ngo.name ILIKE :ngoName', {
        ngoName: `%${ngoName}%`,
      });
    }

    // --- APPLY SORTING ---
    // Ensure the orderBy field exists on the opportunity entity or the joined entity (e.g., ngo.name)
    // For joined relations, you might need to specify 'ngo.name' explicitly.
    // orderBy directly maps to opportunity fields.
    queryBuilder.orderBy(`opportunity.${orderBy}`, orderDirection);

    // First, get the total count of opportunities *before* applying pagination limits
    const totalOpportunities = await queryBuilder.getCount();

    // Now, apply pagination for the data we return
    queryBuilder.offset(skip).limit(limit);

    // Execute the query to get the paginated opportunities
    let opportunities = await queryBuilder.getMany();

    // 4. Location-based filtering (still in-memory for now)
    // This part happens AFTER the database query results are fetched
    // IMPORTANT: If you have a large number of opportunities, moving this to the database
    // with PostGIS would be essential for performance, as in-memory filtering bypasses DB pagination.
    // For now, it will apply to the 'limit' number of opportunities fetched.
    if (
      latitude !== undefined &&
      longitude !== undefined &&
      radiusKm !== undefined
    ) {
      if (radiusKm < 0) {
        throw new BadRequestException('Radius must be a non-negative number.');
      }

      const R = 6371; // Earth's radius in kilometers (for Haversine formula)

      // Convert search origin coordinates (from query parameters) to radians
      const lat1 = latitude * (Math.PI / 180);
      const lon1 = longitude * (Math.PI / 180);

      opportunities = opportunities.filter((opportunity) => {
        // Check if opportunity has valid coordinates before calculation
        if (opportunity.latitude == null || opportunity.longitude == null) {
          return false; // Exclude opportunities without defined coordinates
        }

        // Convert opportunity coordinates (from database) to radians
        const lat2 = opportunity.latitude! * (Math.PI / 180);
        const lon2 = opportunity.longitude! * (Math.PI / 180);

        // Haversine formula calculation
        const dLat = lat2 - lat1;
        const dLon = lon2 - lon1;

        const a =
          Math.sin(dLat / 2) * Math.sin(dLat / 2) +
          Math.cos(lat1) *
            Math.cos(lat2) *
            Math.sin(dLon / 2) *
            Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

        const distance = R * c; // Distance in kilometers

        return distance <= radiusKm;
      });

      // NOTE: If location filtering significantly reduces the number of results,
      // and you need accurate pagination/total count *after* location filtering,
      // you would need to adjust the logic to apply location filtering in the database
      // or filter first and then paginate, which is less efficient.
      // For now, totalOpportunities is the count before in-memory location filtering.
    }

    return {
      data: opportunities,
      total: totalOpportunities, // This total is BEFORE in-memory location filtering.
      // A more robust solution would integrate location filtering into the DB query.
    };
  }

  async findOne(id: number): Promise<Opportunity> {
    const opportunity = await this.opportunitiesRepository.findOne({
      where: { id },
      relations: ['ngo'],
    });
    if (!opportunity) {
      throw new NotFoundException(`Opportunity with ID ${id} not found`);
    }
    return opportunity;
  }

  async update(
    id: number,
    updateOpportunityDto: UpdateOpportunityDto,
    userId: number,
  ): Promise<Opportunity> {
    const opportunity = await this.opportunitiesRepository.findOne({
      where: { id },
    });

    if (!opportunity) {
      throw new NotFoundException(`Opportunity with ID ${id} not found`);
    }

    // Check if the authenticated user is the NGO who posted this opportunity
    if (opportunity.ngoId !== userId) {
      throw new ForbiddenException(
        'You are not authorized to update this opportunity.',
      );
    }

    await this.opportunitiesRepository.update(id, updateOpportunityDto);
    return this.findOne(id); // Return the updated opportunity
  }

  // Modified remove method to include userId for ownership check
  async remove(id: number, userId: number): Promise<void> {
    const opportunity = await this.opportunitiesRepository.findOne({
      where: { id },
    });

    if (!opportunity) {
      throw new NotFoundException(`Opportunity with ID ${id} not found`);
    }

    // Check if the authenticated user is the NGO who posted this opportunity
    if (opportunity.ngoId !== userId) {
      throw new ForbiddenException(
        'You are not authorized to delete this opportunity.',
      );
    }

    await this.opportunitiesRepository.delete(id);
  }

  async findRecent(limit: number = 10): Promise<Opportunity[]> {
    return this.opportunitiesRepository.find({
      relations: ['ngo'],
      order: { createdAt: 'DESC' },
      take: limit,
    });
  }
}
