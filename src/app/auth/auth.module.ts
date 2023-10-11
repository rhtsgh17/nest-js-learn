import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './auth.entity';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { jwt_config } from 'src/config/jwt.config';
import { JwtAccessTokenStrategy } from './jwtAccessTokenstrategi';

import { JwtRefreshTokenStrategy } from './jwtRefreshTokenstrategi';
// import { JwtStrategy } from './jwt.strategy';
import { ResetPassword } from './reset_password.entity';

import { MailModule } from '../mail/mail.module';
@Module({
  imports: [
    TypeOrmModule.forFeature([User, ResetPassword]),
    PassportModule.register({
      defaultStrategy: 'jwt',
      property: 'user',
      session: false,
    }),
    JwtModule.register({}),
    MailModule,
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    JwtAccessTokenStrategy,
    JwtRefreshTokenStrategy,
    // JwtStrategy,
  ],
})
export class AuthModule {}
