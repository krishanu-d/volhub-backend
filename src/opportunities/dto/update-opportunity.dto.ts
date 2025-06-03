import { IsOptional, IsString, IsDateString, IsNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

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

  @ApiProperty({ example: 'Community Garden', required: false })
  @IsOptional()
  @IsString()
  location?: string;

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
}
