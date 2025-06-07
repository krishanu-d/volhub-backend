import {
  IsOptional,
  IsString,
  IsNumber,
  IsDateString,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

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

  // NEW: Search by NGO Name
  @ApiProperty({
    description: 'Search by the name of the NGO that posted the opportunity',
    required: false,
  })
  @IsOptional()
  @IsString()
  ngoName?: string; // Add this line
}
