// src/users/entities/user.entity.ts

import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany, // Make sure OneToMany is imported
} from 'typeorm';
import { ApiProperty, ApiHideProperty } from '@nestjs/swagger';
import { Opportunity } from '../../opportunities/entities/opportunity.entity';
import { Application } from '../../applications/entities/application.entity'; // <-- NEW: Import Application entity
import { UserRole } from '../dto/update-user.dto';

@Entity('users')
export class User {
  @ApiProperty({ description: 'The unique ID of the user', example: 1 })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({
    description: 'The email address of the user',
    example: 'user@example.com',
  })
  @Column({ unique: true })
  email: string;

  @ApiProperty({
    description: 'The name of the user',
    example: 'John Doe',
    nullable: true,
  })
  @Column({ nullable: true })
  name?: string;

  @ApiProperty({
    description: 'Contact information of the user',
    nullable: true,
  })
  @Column({ nullable: true })
  contactInfo?: string;

  @ApiProperty({
    description: 'The profile picture URL',
    example: 'http://example.com/picture.jpg',
    nullable: true,
  })
  @Column({ nullable: true })
  picture?: string;

  @ApiProperty({
    description: 'The Google ID of the user',
    example: '12345',
    nullable: true,
  })
  @Column({ nullable: true })
  googleId?: string;

  @ApiProperty({
    description: 'The Facebook ID of the user',
    example: '67890',
    nullable: true,
  })
  @Column({ nullable: true })
  facebookId?: string;

  @ApiProperty({
    description: 'The role of the user',
    enum: UserRole, // Use the imported UserRole enum directly here
    example: UserRole.VOLUNTEER, // Example using the enum value
  })
  @Column({ type: 'enum', enum: UserRole, default: UserRole.VOLUNTEER }) // Use the imported enum here
  role: UserRole; // Use the imported enum type

  @ApiProperty({
    description: 'About section for the user/NGO',
    example: 'I am a volunteer passionate about...',
    nullable: true,
  })
  @Column({ type: 'text', nullable: true })
  about?: string;

  @ApiProperty({
    description: 'Latitude of the user',
    example: 37.7749,
    nullable: true,
  })
  @Column({ type: 'float', nullable: true })
  latitude?: number;

  @ApiProperty({
    description: 'Longitude of the user',
    example: -122.4194,
    nullable: true,
  })
  @Column({ type: 'float', nullable: true })
  longitude?: number;

  @ApiProperty({
    description: 'Place name of the user',
    example: 'San Francisco, CA',
    nullable: true,
  })
  @Column({ nullable: true })
  placeName?: string;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;

  // Existing relationship for NGOs to opportunities
  @ApiProperty({ type: () => Opportunity })
  @OneToMany(() => Opportunity, (opportunity) => opportunity.ngo, {
    lazy: true,
  })
  @ApiHideProperty()
  opportunities: Opportunity[]; // Opportunities posted by this NGO

  // <-- NEW: Relationship for Volunteers to applications -->
  @ApiProperty({ type: () => Application })
  @OneToMany(() => Application, (application) => application.volunteer, {
    lazy: true,
  })
  @ApiHideProperty() // Hide from Swagger schema to prevent circular issues
  applications: Application[]; // Applications made by this volunteer
}
