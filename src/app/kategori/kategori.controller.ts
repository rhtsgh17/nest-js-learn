import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { KategoriService } from './kategori.service';
import {
  CreateKategoriDto,
  findAllKategori,
  UpdateKategoriDto,
} from './kategori.dto';
import { JwtGuard } from '../auth/auth.guart';
import { Pagination } from '../../utils/decorator/page.decorator';
import { Kategori } from './kategori.entity';

@UseGuards(JwtGuard) //  implementasikan global guard pada semua endpont kategori memerlukan authentikasi saat request
@Controller('kategori')
export class KategoriController {
  constructor(private kategoriService: KategoriService) {}

  @Post('create')
  async create(@Body() payload: CreateKategoriDto) {
    return this.kategoriService.create(payload);
  }
  @Post('createBulk')
  async createBull(@Body() payload: CreateKategoriDto[]) {
    return this.kategoriService.createBulk(payload);
  }

  @Get('list')
  async getAllCategory(@Pagination() query: findAllKategori) {
    //gunakan custom decorator yang pernah kita buat
    return this.kategoriService.getAllCategory(query);
  }
  @Get('detail/:id')
  async findOne(@Param('id') id: string): Promise<Kategori> {
    return this.kategoriService.findOne(+id);
  }
  @Put('update/:id')
  UpdatekategoriDto(
    @Param('id') id: string,
    @Body() payload: UpdateKategoriDto,
  ) {
    return this.kategoriService.updateKategori(+id, payload);
  }
  @Delete('delete/:id')
  async delete(@Param('id') id: number) {
    return this.kategoriService.delete(id);
  }
}
