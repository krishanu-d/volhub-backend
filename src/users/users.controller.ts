import {
  Controller,
  Get,
  UseGuards,
  Req,
  Patch,
  Body,
  ValidationPipe,
  Param,
  HttpStatus,
  Post, // Added Post import in case you have a create method later
} from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { UpdateUserDto } from './dto/update-user.dto'; // This DTO should NOT have 'role'
import { User } from './entities/user.entity';
import {
  ApiOkResponse,
  ApiResponse,
  ApiBearerAuth,
  ApiTags,
  ApiCreatedResponse,
} from '@nestjs/swagger'; // Added ApiBearerAuth, ApiTags
import { AuthService } from 'src/auth/auth.service';
import { CompleteInitialProfileDto } from './dto/complete-initial-user.dto';
import { CreateUserDto } from './dto/create-user.dto';

@ApiTags('users') // Tag for Swagger documentation
@ApiBearerAuth() // Indicates that these endpoints require a Bearer token (JWT)
@Controller('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly authService: AuthService, // Injected AuthService to re-issue JWT
  ) {}

  // POST /users - For creating a new user (e.g., direct signup, or admin creating)
  @Post()
  @ApiCreatedResponse({
    description: 'The user has been successfully created.',
    type: User,
  })
  async create(
    @Body(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
    createUserDto: CreateUserDto,
  ): Promise<User> {
    return this.usersService.createUser(createUserDto);
  }

  // GET /users/me - gets the user's own profile.
  @UseGuards(JwtAuthGuard)
  @Get('me')
  @ApiOkResponse({
    description: "The authenticated user's profile.",
    type: User,
  })
  async getProfile(@Req() req): Promise<User> {
    // Assuming req.user.id is populated by your JwtAuthGuard
    return this.usersService.findUserById(req.user.id);
  }

  // GET /users/:id - gets the profile of a user according to :id
  @Get(':id')
  @ApiOkResponse({ description: 'A user profile by ID.', type: User })
  findOne(@Param('id') id: string) {
    // Assuming findOneById accepts a number, hence +id
    return this.usersService.findUserById(+id);
  }

  // PATCH /users/me/complete-profile - after initial signup the user then fills out their profile.
  // This is the first time they set their role, so it is important to note that
  // once the role is set, it cannot be changed.
  @Patch('me/complete-profile')
  @UseGuards(JwtAuthGuard)
  @ApiOkResponse({
    description:
      'User profile completed, and new JWT issued with updated role.',
    type: User,
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Role cannot be changed after initial setup.',
  })
  async completeProfile(
    @Req() req,
    @Body(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        skipMissingProperties: true,
      }),
    )
    completeInitialProfileDto: CompleteInitialProfileDto,
  ): Promise<{ user: User; accessToken: string }> {
    const updatedUser = await this.usersService.completeInitialProfile(
      req.user.id,
      completeInitialProfileDto,
    );

    // After successful role update, re-issue JWT with the new role
    const newAccessToken = await this.authService.generateJwt({
      sub: updatedUser.id,
      email: updatedUser.email,
      role: updatedUser.role, // Ensure the role is included in the JWT payload
    });

    return { user: updatedUser, accessToken: newAccessToken };
  }

  // PATCH /users/me - generic profile update api, this does not let the user update the role, once they have selected it.
  @UseGuards(JwtAuthGuard)
  @Patch('me')
  @ApiOkResponse({
    description:
      "The authenticated user's profile has been successfully updated (role excluded).",
    type: User,
  })
  async updateUser(
    @Req() req,
    @Body(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        skipMissingProperties: true,
      }),
    ) // Using UpdateUserDto, which should NOT contain 'role'
    updateUserDto: UpdateUserDto,
  ): Promise<User> {
    console.log('req.user:', req.user);
    console.log(req.user.id);
    return this.usersService.updateUser(req.user.id, updateUserDto);
  }
}
