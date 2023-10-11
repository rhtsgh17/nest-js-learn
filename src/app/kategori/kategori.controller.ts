import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { KategoriService } from './kategori.service';
import { CreateKategoriDto, findAllKategori } from './kategori.dto';
import { JwtGuard } from '../auth/auth.guart';
import { Pagination } from '../../utils/decorator/page.decorator';

@UseGuards(JwtGuard) //  implementasikan global guard pada semua endpont kategori memerlukan authentikasi saat request
@Controller('kategori')
export class KategoriController {
  constructor(private kategoriService: KategoriService) {}

  @Post('create')
  async create(@Body() payload: CreateKategoriDto) {
    return this.kategoriService.create(payload);
  }

  @Get('list')
  async getAllCategory(@Pagination() query: findAllKategori) {
    //gunakan custom decorator yang pernah kita buat
    return this.kategoriService.getAllCategory(query);
  }
}
