import {
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Book } from './book.entity';
import { Between, Like, Repository } from 'typeorm';
import { ResponsePagination, ResponseSuccess } from 'src/interface/response';
import { FindBookDto, UpdateBookDto } from './book.dto';
import BaseResponse from 'src/utils/response/base.response';

@Injectable()
export class BookService extends BaseResponse {
  constructor(
    @InjectRepository(Book) private readonly bookRepository: Repository<Book>,
  ) {
    super();
  }

  async getAllBook(query: FindBookDto): Promise<ResponsePagination> {
    const { page, pageSize, limit, title, author, from_year, to_year } = query;
    console.log('query.service', query);

    const filter: {
      [key: string]: any;
    } = {};

    if (title) {
      filter.title = Like(`%${title}%`);
    }
    if (author) {
      filter.author = Like(`%${author}%`);
    }

    if (from_year && to_year) {
      filter.year = Between(from_year, to_year);
    }

    if (from_year && !!to_year === false) {
      filter.year = Between(from_year, from_year);
    }

    console.log('filter', filter);

    const [result, total] = await Promise.all([
      this.bookRepository.find({
        where: filter,
        skip: limit,
        take: pageSize,
      }),
      this.bookRepository.count({
        where: filter,
      }),
    ]);

    return this._pagination('Buku ditemukan', result, total, page, pageSize);
    // return {
    //   status: 'Success',
    //   message: 'List Buku ditemukan',
    //   pagination: {
    //     total,
    //     page,
    //     pageSize,
    //   },
    //   data: result,
    // };
  }

  async createBook(payload: any) {
    try {
      const book = await this.bookRepository.save(payload);

      return this._success('Berhasil menambah buku', book);
    } catch (err) {
      throw new HttpException('ada kesalah', HttpStatus.BAD_REQUEST);
    }
  }

  async getDetailBook(id: number): Promise<ResponseSuccess> {
    try {
      const book = await this.bookRepository.findOne({
        where: {
          id,
        },
      });

      console.log(book);

      if (book === null) {
        throw new NotFoundException(`buku dengan ID: ${id}. Tidak ditemukan`);
        // throw new HttpException(
        //   `buku dengan ID: ${id}. Tidak ditemukan`,
        //   HttpStatus.NOT_FOUND,
        // );
      }

      return this._success('Detail buku ditemukan', book);
    } catch (err) {
      return err;
      // throw new HttpException('ada kesalah', HttpStatus.BAD_REQUEST);
    }
  }

  async updateBook(
    id: number,
    updateBookDto: UpdateBookDto,
  ): Promise<ResponseSuccess> {
    const check = await this.bookRepository.findOne({
      where: {
        id,
      },
    });

    if (!check)
      throw new NotFoundException(`Buku dengan id ${id} tidak ditemukan`);

    const update = await this.bookRepository.save({ ...updateBookDto, id: id });
    return this._success('Buku berhasil diupdate', update);
  }

  async deleteBook(id: number): Promise<ResponseSuccess> {
    const check = await this.bookRepository.findOne({
      where: {
        id,
      },
    });

    if (!check)
      throw new NotFoundException(`Buku dengan id ${id} tidak ditemukan`);
    await this.bookRepository.delete(id);
    return this._success('Buku berhasil dihapus');
  }
}
