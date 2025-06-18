// src/applications/applications.module.ts

import { forwardRef, Module } from '@nestjs/common';
import { ApplicationsService } from './applications.service';
import { ApplicationsController } from './applications.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Application } from './entities/application.entity';
import { User } from 'src/users/entities/user.entity'; // <-- Ensure User entity is imported
import { Opportunity } from 'src/opportunities/entities/opportunity.entity'; // <-- Ensure Opportunity entity is imported
import { AppModule } from 'src/app.module';
@Module({
  imports: [
    TypeOrmModule.forFeature([Application, User, Opportunity]), // Make sure all repositories used in ApplicationsService are provided
    forwardRef(() => AppModule),
  ],
  controllers: [ApplicationsController],
  providers: [ApplicationsService],
  exports: [ApplicationsService, TypeOrmModule], // <-- IMPORTANT: Export ApplicationsService here
})
export class ApplicationsModule {}
