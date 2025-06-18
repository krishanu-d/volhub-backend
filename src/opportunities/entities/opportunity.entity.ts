import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany, // <-- NEW: Make sure OneToMany is imported
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { ApiProperty, ApiHideProperty } from '@nestjs/swagger'; // <-- NEW: Import ApiHideProperty
import { Application } from '../../applications/entities/application.entity'; // <-- NEW: Import Application entity
import { OpportunityCategory } from 'src/enums';

@Entity('opportunities')
export class Opportunity {
  @ApiProperty({ description: 'The unique ID of the opportunity', example: 1 })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({
    description: 'The title of the opportunity',
    example: 'Help at the local shelter',
  })
  @Column()
  title: string;

  @ApiProperty({
    description: 'A brief description of the opportunity',
    example: 'We need volunteers to help feed and care for animals.',
  })
  @Column({ type: 'text' })
  description: string;

  @ApiProperty({
    description: 'Latitude of the opportunity',
    example: 37.7749,
    nullable: true,
  })
  @Column({ type: 'float', nullable: true })
  latitude?: number;

  @ApiProperty({
    description: 'Longitude of the opportunity',
    example: -122.4194,
    nullable: true,
  })
  @Column({ type: 'float', nullable: true })
  longitude?: number;

  @ApiProperty({
    description: 'Place name of the opportunity',
    example: 'San Francisco, CA',
    nullable: true,
  })
  @Column({ nullable: true })
  placeName?: string;

  @ApiProperty({
    description: 'The start date of the opportunity',
    example: '2025-06-15T10:00:00.000Z',
  })
  @Column({ type: 'timestamp' })
  startDate: Date;

  @ApiProperty({
    description: 'The end date of the opportunity',
    example: '2025-06-15T16:00:00.000Z',
    nullable: true,
  })
  @Column({ type: 'timestamp', nullable: true })
  endDate?: Date;

  @ApiProperty({
    description: 'The NGO that posted this opportunity',
    type: () => User,
  })
  @ManyToOne(() => User, (user) => user.opportunities)
  @JoinColumn({ name: 'ngoId' })
  ngo: User;

  @Column()
  ngoId: number; // Foreign key to User (NGO)

  @ApiProperty({
    description: 'Array of image URLs for the opportunity',
    example: ['http://example.com/image1.jpg', 'http://example.com/image2.png'],
    nullable: true,
    isArray: true,
  })
  @Column({ type: 'json', nullable: true })
  images?: string[];

  @ApiProperty({
    description: 'The category of the opportunity',
    enum: OpportunityCategory,
    example: [OpportunityCategory.EDUCATION, OpportunityCategory.ENVIRONMENT],
    isArray: true,
    nullable: false,
  })
  @Column({
    type: 'enum',
    enum: OpportunityCategory,
    array: true,
    nullable: false,
  })
  categories: OpportunityCategory[]; // Make sure the type matches your enum

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;

  // <-- NEW: Relationship to Applications -->
  @ApiProperty({ type: () => Application })
  @OneToMany(() => Application, (application) => application.opportunity, {
    lazy: true,
  })
  @ApiHideProperty() // Hide from Swagger schema to prevent circular issues
  applications: Application[]; // Applications made for this opportunity
}
