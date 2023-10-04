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
@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    PassportModule.register({
      defaultStrategy: 'jwt',
      property: 'user',
      session: false,
    }),
    JwtModule.register({}),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtAccessTokenStrategy, JwtRefreshTokenStrategy],
})
export class AuthModule {}
