import { Controller, Get, UseGuards, Req, Res } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Get('google')
  @UseGuards(AuthGuard('google'))
  async googleAuth(@Req() req) {
    // Initiates the Google OAuth flow
  }

  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  async googleAuthRedirect(@Req() req, @Res() res) {
    if (req.user) {
      const jwt = this.authService.generateJwt({
        sub: req.user.id,
        email: req.user.email,
        role: req.user.role,
      });
      // You would typically redirect back to the mobile app with the JWT,
      // perhaps as a query parameter or in the response body.
      return { token: jwt }; // For now, we'll just return it as JSON
    } else {
      return { error: 'Google login failed' };
    }
  }
}
