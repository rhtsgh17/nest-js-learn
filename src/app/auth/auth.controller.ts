import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto, RegisterDto } from './auth.dto';
import { JwtGuard, JwtGuardRefreshToken } from './auth.guart';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  async register(@Body() payload: RegisterDto) {
    return this.authService.register(payload);
  }

  @Post('login')
  async login(@Body() payload: LoginDto) {
    return this.authService.login(payload);
  }
  @UseGuards(JwtGuard)
  @Get('profile')
  async getProfile(@Req() req) {
    return req.user;
  }
  @UseGuards(JwtGuardRefreshToken)
  @Get('refresh-token')
  async refrestToken(@Req() req) {
    const token = req.headers.authorization.split(' ')(1);
    const id = req.headers.id;
    return 'ok';
  }
}
