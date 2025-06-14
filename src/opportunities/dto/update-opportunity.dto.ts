import {
  IsOptional,
  IsString,
  IsDateString,
  IsNumber,
  IsArray,
  IsEnum,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { OpportunityCategory } from 'src/enums';

export class UpdateOpportunityDto {
  @ApiProperty({ example: 'Help plant trees', required: false })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiProperty({
    example: 'Plant trees in the community garden',
    required: false,
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ example: 37.7749, required: false })
  @IsOptional()
  @IsNumber()
  latitude?: number;

  @ApiProperty({ example: -122.4194, required: false })
  @IsOptional()
  @IsNumber()
  longitude?: number;

  @ApiProperty({ example: 'Community Garden', required: false })
  @IsOptional()
  @IsString()
  placeName?: string;

  @ApiProperty({ example: '2025-07-15T10:00:00.000Z', required: false })
  @IsOptional()
  @IsDateString()
  startDate?: Date;

  @ApiProperty({ example: '2025-07-15T14:00:00.000Z', required: false })
  @IsOptional()
  @IsDateString()
  endDate?: Date;

  @ApiProperty({
    description: 'The ID of the NGO posting the opportunity',
    example: 3,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  ngoId?: number;

  @ApiProperty({
    description: 'Array of image URLs for the opportunity',
    example: ['http://example.com/updated_image.png'],
    required: false,
    isArray: true,
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  images?: string[];

  @ApiProperty({
    description: 'Categories for the opportunity',
    enum: [OpportunityCategory.ENVIRONMENT, OpportunityCategory.EDUCATION],
    isArray: true,
    required: false,
  })
  @IsOptional()
  @IsArray() // It's an array
  @IsEnum(OpportunityCategory, { each: true }) // Each item in the array must be an enum
  categories: OpportunityCategory[]; // Type it as an array
}
