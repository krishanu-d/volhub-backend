import { SetMetadata } from '@nestjs/common';
import { UserRole } from 'src/enums';

export const Roles = (...roles: UserRole[]) => SetMetadata('roles', roles);
