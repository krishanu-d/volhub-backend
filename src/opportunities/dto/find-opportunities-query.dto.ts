import {
  IsOptional,
  IsEnum,
  IsArray,
  IsInt,
  Min,
  Max,
  IsString,
  IsNumber,
  IsLatitude,
  IsLongitude,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer'; // For transforming query params to numbers
import { OpportunityCategory, OpportunitySortBy, SortOrder } from 'src/enums';

export class FindOpportunitiesQueryDto {
  @ApiProperty({
    description: 'Filter opportunities by one or more categories',
    type: [String],
    enum: OpportunityCategory,
    example: [OpportunityCategory.EDUCATION, OpportunityCategory.ENVIRONMENT],
    required: false,
    nullable: true,
  })
  @IsOptional()
  @IsArray()
  @IsEnum(OpportunityCategory, { each: true })
  categories?: OpportunityCategory[];

  @ApiProperty({
    description: 'Search term for title or description',
    example: 'volunteer',
    required: false,
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiProperty({
    description: 'Start date for opportunities (ISO 8601)',
    example: '2025-01-01',
    required: false,
  })
  @IsOptional()
  @IsString()
  startDate?: string;

  @ApiProperty({
    description: 'End date for opportunities (ISO 8601)',
    example: '2025-12-31',
    required: false,
  })
  @IsOptional()
  @IsString()
  endDate?: string;

  @ApiProperty({
    description: 'Filter by NGO name',
    example: 'Helping Hands',
    required: false,
  })
  @IsOptional()
  @IsString()
  ngoName?: string;

  @ApiProperty({
    description: 'Latitude for location-based search',
    example: 12.9716,
    required: false,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @IsLatitude()
  latitude?: number;

  @ApiProperty({
    description: 'Longitude for location-based search',
    example: 77.5946,
    required: false,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @IsLongitude()
  longitude?: number;

  @ApiProperty({
    description: 'Radius in kilometers for location-based search',
    example: 50,
    required: false,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  radiusKm?: number;

  @ApiProperty({
    description: 'Page number for pagination',
    example: 1,
    required: false,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiProperty({
    description: 'Number of items per page',
    example: 10,
    required: false,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 10;

  @ApiProperty({
    description: 'Field to sort opportunities by',
    enum: OpportunitySortBy,
    example: OpportunitySortBy.CREATED_AT,
    required: false,
  })
  @IsOptional()
  @IsEnum(OpportunitySortBy)
  sortBy?: OpportunitySortBy = OpportunitySortBy.CREATED_AT;

  @ApiProperty({
    description: 'Sort order (ASC or DESC)',
    enum: SortOrder,
    example: SortOrder.DESC,
    required: false,
  })
  @IsOptional()
  @IsEnum(SortOrder)
  sortOrder?: SortOrder = SortOrder.DESC;
}
