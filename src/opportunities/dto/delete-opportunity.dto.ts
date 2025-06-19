import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class DeleteOpportunityDto {
  @ApiProperty({
    description: 'The ID of the opportunity to delete',
    example: 1,
  })
  @IsNotEmpty()
  @IsNumber()
  opportunityId: number;

  @ApiProperty({
    description: 'The reason for deleting the opportunity',
    example: 'Duplicate entry or no longer valid',
    required: true,
  })
  @IsNotEmpty()
  @IsString()
  reason: string;
}
