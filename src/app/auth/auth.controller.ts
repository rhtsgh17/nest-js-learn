import { Body, Controller, Get, Param, Post, Req, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto, RegisterDto, ResetPasswordDto } from './auth.dto';
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
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const token = req.headers.authorization.split(' ')(1);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const id = req.headers.id;
    return 'ok';
  }

  @Post('lupa-password')
  async forgotPassowrd(@Body('email') email: string) {
    console.log('email', email);
    return this.authService.forgotPassword(email);
  }
  // const link = `http://localhost:5002/auth/reset-password/${user.id}/${token}`;

  @Post('reset-password/:user_id/:token') // url yang dibuat pada endpont harus sama dengan ketika kita membuat link pada service forgotPassword
  async resetPassword(
    @Param('user_id') user_id: string,
    @Param('token') token: string,
    @Body() payload: ResetPasswordDto,
  ) {
    return this.authService.resetPassword(+user_id, token, payload);
  }
}
