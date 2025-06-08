// src/opportunities/dto/find-opportunities-query.dto.ts

import {
  IsOptional,
  IsString,
  IsNumber,
  IsDateString,
  Min,
  IsIn,
} from 'class-validator'; // <-- NEW: IsIn
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

// Define possible fields to order by
export enum OpportunityOrderBy {
  CREATED_AT = 'createdAt',
  START_DATE = 'startDate',
  END_DATE = 'endDate',
  TITLE = 'title',
}

export enum OrderDirection {
  ASC = 'ASC',
  DESC = 'DESC',
}

export class FindOpportunitiesQueryDto {
  @ApiProperty({
    description: 'Keyword to search in title or description',
    required: false,
  })
  @IsOptional()
  @IsString()
  keyword?: string;

  @ApiProperty({
    description:
      'Filter opportunities starting from this date (ISO 8601 format)',
    required: false,
    example: '2025-07-01T00:00:00.000Z',
  })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiProperty({
    description: 'Filter opportunities ending by this date (ISO 8601 format)',
    required: false,
    example: '2025-08-31T23:59:59.999Z',
  })
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @ApiProperty({
    description: 'Latitude of the search origin (for proximity search)',
    required: false,
    example: 21.2514,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  latitude?: number;

  @ApiProperty({
    description: 'Longitude of the search origin (for proximity search)',
    required: false,
    example: 81.6296,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  longitude?: number;

  @ApiProperty({
    description:
      'Radius in kilometers for proximity search (requires latitude and longitude)',
    required: false,
    example: 50,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  radiusKm?: number;

  @ApiProperty({
    description: 'Search by the name of the NGO that posted the opportunity',
    required: false,
  })
  @IsOptional()
  @IsString()
  ngoName?: string;

  @ApiProperty({
    description: 'Page number for pagination',
    required: false,
    default: 1,
    example: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  page?: number = 1; // Default to page 1

  @ApiProperty({
    description: 'Number of items per page for pagination',
    required: false,
    default: 10,
    example: 10,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  limit?: number = 10; // Default to 10 items per page

  @ApiProperty({
    description: 'Field to sort opportunities by',
    enum: OpportunityOrderBy,
    required: false,
    default: OpportunityOrderBy.CREATED_AT,
    example: OpportunityOrderBy.CREATED_AT,
  })
  @IsOptional()
  @IsIn(Object.values(OpportunityOrderBy)) // Validate against enum values
  orderBy?: OpportunityOrderBy = OpportunityOrderBy.CREATED_AT; // Default sort by createdAt

  @ApiProperty({
    description: 'Sort order direction (ASC or DESC)',
    enum: OrderDirection,
    required: false,
    default: OrderDirection.DESC,
    example: OrderDirection.DESC,
  })
  @IsOptional()
  @IsIn(Object.values(OrderDirection)) // Validate against enum values
  orderDirection?: OrderDirection = OrderDirection.DESC; // Default sort descending
}
