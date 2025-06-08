import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { UpdateUserDto } from './dto/update-user.dto';
import { CompleteInitialProfileDto } from './dto/complete-initial-user.dto';

@Injectable()
export class UsersService {
  // Removed 'public' here
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
  ) {}

  async findOne(id: number): Promise<User | undefined> {
    const user = await this.usersRepository.findOne({ where: { id } });
    return user === null ? undefined : user;
  }

  async findUserByEmail(email: string): Promise<User | undefined> {
    const user = await this.usersRepository.findOne({ where: { email } });
    return user === null ? undefined : user;
  }

  async createUser(userData: Partial<User>): Promise<User> {
    const newUser = this.usersRepository.create(userData);
    return this.usersRepository.save(newUser);
  }

  async findUserById(id: number): Promise<User> {
    const user = await this.usersRepository.findOneBy({ id });
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    return user;
  }

  async completeInitialProfile(
    id: number,
    completeInitialProfileDto: CompleteInitialProfileDto,
  ): Promise<User> {
    const userToUpdate = await this.usersRepository.findOne({ where: { id } });

    if (!userToUpdate) {
      throw new NotFoundException(`User with ID ${id} not found.`);
    }

    // IMPORTANT ADJUSTMENT: Allow setting role ONLY if it's currently NULL
    if (userToUpdate.role !== null) {
      // If role is NOT null (meaning it's already set)
      throw new ForbiddenException(
        'User role has already been set and cannot be changed via initial profile completion.',
      );
    }

    userToUpdate.role = completeInitialProfileDto.role;

    const { role, ...restOfDto } = completeInitialProfileDto; // Destructure role out to avoid double assignment/ensure it's not set again by Object.assign
    Object.assign(userToUpdate, restOfDto);

    // Prevent direct updates to OAuth IDs
    if ('googleId' in completeInitialProfileDto)
      delete (userToUpdate as any).googleId;
    if ('facebookId' in completeInitialProfileDto)
      delete (userToUpdate as any).facebookId;

    return this.usersRepository.save(userToUpdate);
  }

  async updateUser(id: number, updateUserDto: UpdateUserDto): Promise<User> {
    const user = await this.findUserById(id); // Ensure the user exists
    await this.usersRepository.update(id, updateUserDto);
    return this.findUserById(id); // Return the updated user
  }
}
