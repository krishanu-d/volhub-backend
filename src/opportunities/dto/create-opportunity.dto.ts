import {
  IsNotEmpty,
  IsString,
  IsDateString,
  IsOptional,
  IsNumber,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateOpportunityDto {
  @ApiProperty({ example: 'Help at the park cleanup' })
  @IsNotEmpty()
  @IsString()
  title: string;

  @ApiProperty({ example: 'Join us to clean up our local park!' })
  @IsNotEmpty()
  @IsString()
  description: string;

  @ApiProperty({ example: 'Central Park' })
  @IsNotEmpty()
  @IsString()
  location: string;

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
}
