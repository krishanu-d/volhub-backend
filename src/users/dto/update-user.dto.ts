import {
  IsOptional,
  IsString,
  IsUrl,
  IsNumber,
  IsEnum,
  IsArray,
  IsBoolean,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger'; // Import ApiProperty
import { OpportunityCategory } from 'src/enums';

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

  @ApiProperty({
    description:
      'Categories the user is interested in (Volunteer) or focuses on (NGO)',
    type: [String],
    enum: OpportunityCategory,
    example: [OpportunityCategory.EDUCATION, OpportunityCategory.ENVIRONMENT],
    required: false,
    nullable: true,
  })
  @IsOptional() // This property is optional during initial user creation
  @IsArray()
  @IsEnum(OpportunityCategory, { each: true }) // Validates each item in the array against the enum
  categories?: OpportunityCategory[] | null;

  @ApiProperty({
    description: 'Whether the user wants to receive push notifications',
    required: false,
    default: true,
  })
  @IsOptional()
  @IsBoolean()
  receivePushNotifications?: boolean;

  @ApiProperty({
    description: 'Whether the user wants to receive email notifications',
    required: false,
    default: true,
  })
  @IsOptional()
  @IsBoolean()
  receiveEmailNotifications?: boolean;
}
