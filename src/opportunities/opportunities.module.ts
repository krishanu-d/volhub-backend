import { forwardRef, Module } from '@nestjs/common';
import { OpportunitiesService } from './opportunities.service';
import { OpportunitiesController } from './opportunities.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Opportunity } from './entities/opportunity.entity';
import { ApplicationsModule } from 'src/applications/applications.module';
import { RabbitMQService } from 'src/rabbitmq/rabbitmq.service';
import { AppModule } from 'src/app.module';
@Module({
  imports: [
    TypeOrmModule.forFeature([Opportunity, RabbitMQService]),
    ApplicationsModule,
    forwardRef(() => AppModule),
  ],
  controllers: [OpportunitiesController],
  providers: [OpportunitiesService],
  exports: [OpportunitiesService],
})
export class OpportunitiesModule {}
