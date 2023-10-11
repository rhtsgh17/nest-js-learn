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
import { LoginDto, RegisterDto, ResetPasswordDto } from './auth.dto';
import { ResponseSuccess } from 'src/interface/response';
import { jwtPayload } from './auth.interface';
import BaseResponse from 'src/utils/response/base.response';
import { MailService } from '../mail/mail.service'; // import mail service
import { ResetPassword } from './reset_password.entity'; // import reset password
import { randomBytes } from 'crypto'; // import cypto untuk membuat token dari random string
@Injectable()
export class AuthService extends BaseResponse {
  generateJWT: any;
  constructor(
    @InjectRepository(User) private readonly authRepository: Repository<User>,
    @InjectRepository(ResetPassword)
    private readonly resetPasswordRepository: Repository<ResetPassword>, // inject repository reset password
    private jwtService: JwtService,
    private mailService: MailService,
  ) {
    super();
  }

  async forgotPassword(email: string): Promise<ResponseSuccess> {
    const user = await this.authRepository.findOne({
      where: {
        email: email,
      },
    });

    if (!user) {
      throw new HttpException(
        'Email tidak ditemukan',
        HttpStatus.UNPROCESSABLE_ENTITY,
      );
    }
    const token = randomBytes(32).toString('hex'); // membuat token
    const link = `http://localhost:5002/auth/reset-password/${user.id}/${token}`; //membuat link untuk reset password
    await this.mailService.sendForgotPassword({
      email: email,
      name: user.nama,
      link: link,
    });

    const payload = {
      user: {
        id: user.id,
      },
      token: token,
    };

    await this.resetPasswordRepository.save(payload); // menyimpan token dan id ke tabel reset password

    return this._success('Silahkan Cek Email');
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

      const access_token = this.jwtService.sign(jwtPayload, {
        expiresIn: '1d',
        secret: jwt_config.access_token_secret,
      });

      const refresh_token = await this.jwtService.sign(jwtPayload, {
        expiresIn: '7d',
        secret: jwt_config.refresh_token_secret,
      });

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

    const access_token = this.jwtService.sign(jwtPayload, {
      expiresIn: '1d',
      secret: jwt_config.access_token_secret,
    });
    const refresh_token = await this.jwtService.sign(jwtPayload, {
      expiresIn: '7d',
      secret: jwt_config.refresh_token_secret,
    });

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
  async resetPassword(
    user_id: number,
    token: string,
    payload: ResetPasswordDto,
  ): Promise<ResponseSuccess> {
    const userToken = await this.resetPasswordRepository.findOne({
      //cek apakah user_id dan token yang sah pada tabel reset password
      where: {
        token: token,
        user: {
          id: user_id,
        },
      },
    });

    if (!userToken) {
      throw new HttpException(
        'Token tidak valid',
        HttpStatus.UNPROCESSABLE_ENTITY, // jika tidak sah , berikan pesan token tidak valid
      );
    }

    payload.new_password = await hash(payload.new_password, 12); //hash password
    await this.authRepository.save({
      // ubah password lama dengan password baru
      password: payload.new_password,
      id: user_id,
    });
    await this.resetPasswordRepository.delete({
      // hapus semua token pada tabel reset password yang mempunyai user_id yang dikirim, agar tidak bisa digunakan kembali
      user: {
        id: user_id,
      },
    });

    return this._success('Reset Passwod Berhasil, Silahkan login ulang');
  }
}
