import { SetMetadata } from '@nestjs/common';
import { UserRole } from 'src/users/dto/update-user.dto';

export const Roles = (...roles: UserRole[]) => SetMetadata('roles', roles);
