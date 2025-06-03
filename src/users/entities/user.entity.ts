import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Opportunity } from '../../opportunities/entities/opportunity.entity';

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

  @ApiProperty({ description: 'The name of the user', example: 'John Doe' })
  @Column({ nullable: true })
  name?: string;

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
    enum: ['volunteer', 'ngo'],
    example: 'volunteer',
  })
  @Column({ type: 'enum', enum: ['volunteer', 'ngo'], default: 'volunteer' })
  role: 'volunteer' | 'ngo';

  @ApiProperty({
    description: 'About section for the user/NGO',
    example: 'I am a volunteer passionate about...',
    nullable: true,
  })
  @Column({ type: 'text', nullable: true })
  about?: string;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;

  @OneToMany(() => Opportunity, (opportunity) => opportunity.ngo)
  opportunities: Opportunity[];
}
