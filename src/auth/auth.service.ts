import { Injectable } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { User } from '../users/entities/user.entity';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async validateGoogleUser(
    profile: any,
  ): Promise<{ user: User; isNewUser: boolean }> {
    const { email, name, picture } = profile;
    const existingUser = await this.usersService.findUserByEmail(email);

    if (existingUser) {
      return { user: existingUser, isNewUser: false };
    }

    const newUser = await this.usersService.createUser({
      email,
      name,
      picture,
      googleId: profile.id,
    });
    return { user: newUser, isNewUser: true };
  }

  async validateFacebookUser(
    profile: any,
  ): Promise<{ user: User; isNewUser: boolean }> {
    const { email, name } = profile;
    const picture = profile.picture?.data?.url;
    const facebookId = profile.id;

    const existingUser = await this.usersService.findUserByEmail(email);

    if (existingUser) {
      return { user: existingUser, isNewUser: false };
    }

    const newUser = await this.usersService.createUser({
      email,
      name,
      picture,
      facebookId,
    });
    return { user: newUser, isNewUser: true };
  }

  generateJwt(payload: any): string {
    return this.jwtService.sign(payload, {
      secret: this.configService.get('JWT_SECRET'),
      expiresIn: '1h',
    });
  }
}
