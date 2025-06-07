import {
  Controller,
  Get,
  UseGuards,
  Req,
  Patch,
  Body,
  ValidationPipe,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @UseGuards(JwtAuthGuard)
  @Get('me')
  async getProfile(@Req() req): Promise<User> {
    return this.usersService.findUserById(req.user.sub);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('me')
  async updateUser(
    @Req() req,
    @Body(new ValidationPipe()) updateUserDto: UpdateUserDto,
  ): Promise<User> {
    console.log('req.user:', req.user);
    console.log(req.user.sub);
    return this.usersService.updateUser(req.user.id, updateUserDto); // Use req.user.sub and the generic update method
  }
}
