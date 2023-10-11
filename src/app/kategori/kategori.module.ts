import { Module } from '@nestjs/common';
import { KategoriService } from './kategori.service';
import { KategoriController } from './kategori.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Kategori } from './kategori.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Kategori])],
  providers: [KategoriService],
  controllers: [KategoriController],
})
export class KategoriModule {}
