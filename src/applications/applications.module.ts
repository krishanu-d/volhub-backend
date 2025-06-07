import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Application } from './entities/application.entity'; // Import your Application entity
import { Opportunity } from '../opportunities/entities/opportunity.entity'; // Import Opportunity for potential service use
import { User } from '../users/entities/user.entity'; // Import User for potential service use
import { ApplicationsService } from './applications.service';
import { ApplicationsController } from './applications.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([Application, Opportunity, User]), // Register Application, Opportunity, and User entities for this module
  ],
  providers: [ApplicationsService],
  controllers: [ApplicationsController],
  exports: [ApplicationsService, TypeOrmModule], // Export service if other modules need to inject it, and TypeOrmModule if entities are used elsewhere
})
export class ApplicationsModule {}
