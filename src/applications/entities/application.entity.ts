import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity'; // Import User entity
import { Opportunity } from '../../opportunities/entities/opportunity.entity'; // Import Opportunity entity
import { ApiProperty } from '@nestjs/swagger';
import { ApplicationStatus } from 'src/enums';

@Entity('applications')
export class Application {
  @ApiProperty({ description: 'Unique identifier for the application' })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ description: 'The ID of the volunteer who applied' })
  @Column()
  volunteerId: number; // Foreign key to User (Volunteer)

  @ApiProperty({ description: 'The ID of the opportunity applied for' })
  @Column()
  opportunityId: number; // Foreign key to Opportunity

  @ApiProperty({
    description: 'The current status of the application',
    enum: ApplicationStatus,
    example: ApplicationStatus.PENDING,
  })
  @Column({
    type: 'enum',
    enum: ApplicationStatus,
    default: ApplicationStatus.PENDING,
  })
  status: ApplicationStatus;

  @ApiProperty({
    description: 'Optional message from the volunteer',
    nullable: true,
  })
  @Column({ type: 'text', nullable: true })
  message?: string;

  @ApiProperty({ description: 'Timestamp when the application was created' })
  @CreateDateColumn({ type: 'timestamp with time zone' })
  applicationDate: Date;

  @ApiProperty({
    description: 'Timestamp when the application was last updated',
  })
  @UpdateDateColumn({ type: 'timestamp with time zone' })
  updatedAt: Date;

  // --- Relationships ---

  @ApiProperty({
    type: () => User,
    description: 'The volunteer who submitted the application',
  })
  @ManyToOne(() => User, (user) => user.applications)
  @JoinColumn({ name: 'volunteerId' }) // Specify the foreign key column
  volunteer: User;

  @ApiProperty({
    type: () => Opportunity,
    description: 'The opportunity this application is for',
  })
  @ManyToOne(() => Opportunity, (opportunity) => opportunity.applications, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'opportunityId' }) // Specify the foreign key column
  opportunity: Opportunity;
}
