import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Opportunity } from './entities/opportunity.entity';
import { CreateOpportunityDto } from './dto/create-opportunity.dto';
import { UpdateOpportunityDto } from './dto/update-opportunity.dto';

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

  async findAll(): Promise<Opportunity[]> {
    return this.opportunitiesRepository.find({ relations: ['ngo'] });
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
  ): Promise<Opportunity> {
    await this.opportunitiesRepository.update(id, updateOpportunityDto);
    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    const result = await this.opportunitiesRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Opportunity with ID ${id} not found`);
    }
  }

  async findRecent(limit: number = 10): Promise<Opportunity[]> {
    return this.opportunitiesRepository.find({
      relations: ['ngo'],
      order: { createdAt: 'DESC' },
      take: limit,
    });
  }
}
