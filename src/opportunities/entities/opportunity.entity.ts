import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { ApiProperty } from '@nestjs/swagger';

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
    description: 'The location of the opportunity',
    example: '123 Main St, Anytown',
  })
  @Column()
  location: string;

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

  @ApiProperty({ description: 'The NGO that posted this opportunity' })
  @ManyToOne(() => User, (user) => user.opportunities)
  @JoinColumn({ name: 'ngoId' })
  ngo: User;

  @Column()
  ngoId: number;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;
}
