import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsOptional, IsString, Min } from 'class-validator';

export class CreateApplicationDto {
  @ApiProperty({
    description: 'The ID of the opportunity the volunteer is applying for',
    example: 1,
  })
  @IsInt()
  @Min(1) // Ensure it's a positive integer
  opportunityId: number;

  @ApiProperty({
    description: 'An optional message from the volunteer to the NGO.',
    required: false,
    example:
      'I am very enthusiastic about this opportunity and ready to contribute!',
  })
  @IsOptional()
  @IsString()
  message?: string;

  // volunteerId will be provided by the controller from req.user.id, not from the request body
}
