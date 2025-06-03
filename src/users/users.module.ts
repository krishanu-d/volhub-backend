import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User])], // Import TypeOrmModule for the User entity
  providers: [UsersService],
  controllers: [UsersController],
  exports: [UsersService], // Export UsersService so AuthModule can use it
})
export class UsersModule {}
