import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy, StrategyOptions } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { UsersService } from 'src/users/users.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly configService: ConfigService,
    private readonly usersService: UsersService, // If you're fetching the user here
  ) {
    const jwtSecret = configService.get<string>('JWT_SECRET');

    if (!jwtSecret) {
      throw new Error('JWT_SECRET environment variable is not defined');
    }

    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: jwtSecret,
      passReqToCallback: false,
    });
  }

  async validate(payload: any) {
    // Option 1: If payload itself contains the role (less common for JWTs directly)
    // return { id: payload.sub, email: payload.email, role: payload.role };

    // Option 2: Fetch user from DB to get the role (more robust)
    const user = await this.usersService.findUserById(payload.sub);
    if (!user) {
      return null; // User not found
    }
    return { id: user.id, email: user.email, role: user.role }; // Ensure 'role' is returned
  }
}
