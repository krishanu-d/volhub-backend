import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { UserRole } from 'src/enums';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(
      'roles',
      [context.getHandler(), context.getClass()],
    );

    // If no roles are specified, the route is public (or relies on other guards)
    if (!requiredRoles) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user; // Assuming JwtAuthGuard has already populated req.user

    // If no user is authenticated, deny access (JwtAuthGuard should handle this too, but as a fallback)
    if (!user) {
      throw new ForbiddenException(
        'You must be authenticated to access this resource.',
      );
    }

    // Check if the user's role is included in the requiredRoles array
    const hasRequiredRole = requiredRoles.some((role) => user.role === role);

    if (!hasRequiredRole) {
      throw new ForbiddenException(
        'You do not have the necessary role to access this resource.',
      );
    }

    return true;
  }
}
