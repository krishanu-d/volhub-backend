import { Controller, Get, Req, Res, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthGuard } from '@nestjs/passport';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Get('google')
  @UseGuards(AuthGuard('google'))
  async googleAuth() {}

  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  async googleAuthRedirect(@Req() req, @Res() res) {
    if (req.user) {
      const { user, isNewUser } = await this.authService.validateGoogleUser(
        req.user,
      );
      const jwt = this.authService.generateJwt({
        sub: user.id,
        email: user.email,
      });
      return res.send({ access_token: jwt, isNewUser, user });
    } else {
      return 'Google login failed';
    }
  }

  @Get('facebook')
  @UseGuards(AuthGuard('facebook'))
  async facebookAuth() {}

  @Get('facebook/callback')
  @UseGuards(AuthGuard('facebook'))
  async facebookAuthRedirect(@Req() req, @Res() res) {
    if (req.user) {
      const { user, isNewUser } = await this.authService.validateFacebookUser(
        req.user,
      );
      const jwt = this.authService.generateJwt({
        sub: user.id,
        email: user.email,
      });
      return res.send({ access_token: jwt, isNewUser, user });
    } else {
      return 'Facebook login failed';
    }
  }
}
