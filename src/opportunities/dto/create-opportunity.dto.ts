import {
  IsNotEmpty,
  IsString,
  IsDateString,
  IsOptional,
  IsNumber,
  IsArray,
  IsEnum,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { OpportunityCategory } from 'src/enums';

export class CreateOpportunityDto {
  @ApiProperty({ example: 'Help at the park cleanup' })
  @IsNotEmpty()
  @IsString()
  title: string;

  @ApiProperty({ example: 'Join us to clean up our local park!' })
  @IsNotEmpty()
  @IsString()
  description: string;

  @ApiProperty({ example: 37.7749, required: false })
  @IsOptional()
  @IsNumber()
  latitude?: number;

  @ApiProperty({ example: -122.4194, required: false })
  @IsOptional()
  @IsNumber()
  longitude?: number;

  @ApiProperty({ example: 'Golden Gate Park', required: false })
  @IsOptional()
  @IsString()
  placeName?: string;

  @ApiProperty({ example: '2025-07-01T09:00:00.000Z' })
  @IsNotEmpty()
  @IsDateString()
  startDate: Date;

  @ApiProperty({ example: '2025-07-01T12:00:00.000Z', required: false })
  @IsOptional()
  @IsDateString()
  endDate?: Date;

  @ApiProperty({
    description: 'The ID of the NGO posting the opportunity',
    example: 3,
  })
  @IsNotEmpty()
  @IsNumber()
  ngoId: number;

  @ApiProperty({
    description: 'Array of image URLs for the opportunity',
    example: ['http://example.com/image1.jpg'],
    required: false,
    isArray: true,
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  images?: string[];

  @ApiProperty({
    description: 'Categories for the opportunity',
    enum: OpportunityCategory,
    isArray: true,
    example: [OpportunityCategory.ENVIRONMENT, OpportunityCategory.EDUCATION],
  })
  @IsArray() // It's an array
  @IsEnum(OpportunityCategory, { each: true }) // Each item in the array must be an enum
  categories: OpportunityCategory[]; // Type it as an array
}
