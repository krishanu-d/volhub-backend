import { IsOptional, IsString, IsUrl, IsNumber, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger'; // Import ApiProperty

export enum UserRole {
  VOLUNTEER = 'volunteer',
  NGO = 'ngo',
}

export class UpdateUserDto {
  @ApiProperty({ description: 'The name of the user', required: false })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({ description: "The user's location name", required: false })
  @IsOptional()
  @IsString()
  placeName?: string;

  @ApiProperty({
    description: "The latitude of the user's location",
    required: false,
    example: 21.2514,
  })
  @IsOptional()
  @IsNumber()
  latitude?: number;

  @ApiProperty({
    description: "The longitude of the user's location",
    required: false,
    example: 81.6296,
  })
  @IsOptional()
  @IsNumber()
  longitude?: number;

  @ApiProperty({
    description: 'Contact information of the user',
    required: false,
  })
  @IsOptional()
  @IsString()
  contactInfo?: string;

  @IsOptional()
  @IsEnum(UserRole)
  role?: UserRole;

  @IsOptional()
  @IsString()
  about?: string;

  @ApiProperty({
    description: "URL to the user's profile picture",
    required: false,
  })
  @IsOptional()
  @IsString()
  @IsUrl()
  picture?: string;
}
