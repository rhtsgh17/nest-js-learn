import {
  HttpException,
  HttpStatus,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { compare, hash } from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { jwt_config } from 'src/config/jwt.config';
import { User } from './auth.entity';
import { LoginDto, RegisterDto } from './auth.dto';
import { ResponseSuccess } from 'src/interface/response';
import { jwtPayload } from './auth.interface';
import BaseResponse from 'src/utils/response/base.response';

@Injectable()
export class AuthService extends BaseResponse {
  constructor(
    @InjectRepository(User) private readonly authRepository: Repository<User>,
    private jwtService: JwtService,
  ) {
    super();
  }

  private generateJWT(
    payload: jwtPayload,
    expiresIn: string | number,
    secret: string,
  ) {
    return this.jwtService.sign(payload, {
      secret: secret,
      expiresIn: expiresIn,
    });
  }

  async register(payload: RegisterDto): Promise<ResponseSuccess> {
    const checkUser = await this.authRepository.findOne({
      where: {
        email: payload.email,
      },
    });

    if (checkUser) {
      throw new HttpException('User already registered', HttpStatus.FOUND);
    }

    payload.password = await hash(payload.password, 12);
    await this.authRepository.save(payload);

    return this._success('Register berhasil', payload);
  }

  async login(payload: LoginDto): Promise<ResponseSuccess> {
    const checkUserExists = await this.authRepository.findOne({
      where: {
        email: payload.email,
      },
      select: {
        id: true,
        nama: true,
        email: true,
        password: true,
        role: true,
        avatar: true,
        refresh_token: true,
      },
    });

    if (!checkUserExists) {
      throw new HttpException(
        'User tidak ditemukan',
        HttpStatus.UNPROCESSABLE_ENTITY,
      );
    }

    const checkPassword = await compare(
      payload.password,
      checkUserExists.password,
    );

    if (checkPassword) {
      const jwtPayload: jwtPayload = {
        id: checkUserExists.id,
        nama: checkUserExists.nama,
        email: checkUserExists.email,
        role: checkUserExists.role,
        avatar: checkUserExists.avatar,
      };

      const access_token = await this.generateJWT(
        jwtPayload,
        '1d',
        jwt_config.access_token_secret,
      );
      const refresh_token = await this.generateJWT(
        jwtPayload,
        '7d',
        jwt_config.refresh_token_secret,
      );

      await this.authRepository.update(
        { id: checkUserExists.id },
        { refresh_token },
      );

      return this._success('Login Success', {
        ...checkUserExists,
        access_token,
        refresh_token,
      });
    } else {
      throw new HttpException(
        'Email and password do not match',
        HttpStatus.UNPROCESSABLE_ENTITY,
      );
    }
  }

  async refreshToken(id: number, token: string): Promise<ResponseSuccess> {
    const checkUserExists = await this.authRepository.findOne({
      where: {
        id: id,
        refresh_token: token,
      },
      select: {
        id: true,
        nama: true,
        email: true,
        password: true,
        refresh_token: true,
      },
    });

    console.log('user', checkUserExists);
    if (checkUserExists === null) {
      throw new UnauthorizedException();
    }

    const jwtPayload: jwtPayload = {
      id: checkUserExists.id,
      nama: checkUserExists.nama,
      email: checkUserExists.email,
      role: '',
      avatar: '',
    };

    const access_token = await this.generateJWT(
      jwtPayload,
      '1d',
      jwt_config.access_token_secret,
    );

    const refresh_token = await this.generateJWT(
      jwtPayload,
      '7d',
      jwt_config.refresh_token_secret,
    );

    await this.authRepository.save({
      refresh_token: refresh_token,
      id: checkUserExists.id,
    });

    return this._success('Success', {
      ...checkUserExists,
      access_token: access_token,
      refresh_token: refresh_token,
    });
  }
}
