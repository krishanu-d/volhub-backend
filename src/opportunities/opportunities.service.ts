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
import { FindOpportunitiesQueryDto } from './dto/find-opportunities-query.dto';

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

  async findAll(query: FindOpportunitiesQueryDto): Promise<Opportunity[]> {
    const {
      keyword,
      startDate,
      endDate,
      latitude,
      longitude,
      radiusKm,
      ngoName,
    } = query;

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

    // Default ordering (most recent first)
    queryBuilder.orderBy('opportunity.createdAt', 'DESC');

    // Execute the initial query to get opportunities that match non-location filters
    // We fetch them all first because location filtering is done in memory for now.
    let opportunities = await queryBuilder.getMany();

    // 4. Location-based filtering (still in-memory for now)
    // This part happens AFTER the database query results are fetched
    if (
      latitude !== undefined &&
      longitude !== undefined &&
      radiusKm !== undefined
    ) {
      if (radiusKm < 0) {
        throw new BadRequestException('Radius must be a non-negative number.');
      }

      const R = 6371; // Earth's radius in kilometers (for Haversine formula)

      opportunities = opportunities.filter((opportunity) => {
        // Check if opportunity has valid coordinates before calculation
        if (opportunity.latitude == null || opportunity.longitude == null) {
          return false; // Exclude opportunities without defined coordinates
        }

        // Convert search origin coordinates (from query parameters) to radians
        const lat1 = latitude * (Math.PI / 180);
        const lon1 = longitude * (Math.PI / 180);

        // Convert opportunity coordinates (from database) to radians
        // Use '!' non-null assertion operator because we just checked for null/undefined
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
    }

    return opportunities;
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
