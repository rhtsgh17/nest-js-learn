import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
} from '@nestjs/common';
import { BookService } from './book.service';
import { CreateBookDto, FindBookDto, UpdateBookDto } from './book.dto';
import { Pagination } from 'src/utils/decorator/page.decorator';

@Controller('book')
export class BookController {
  constructor(private bookService: BookService) {}

  @Get('list')
  getAllBook(@Pagination() query: FindBookDto) {
    // console.log('query.controller', query);
    return this.bookService.getAllBook(query);
  }
  @Get('detail/:id')
  getBook(@Param('id') id: string) {
    return this.bookService.getDetailBook(+id);
    return this.bookService.getDetailBook(Number(id));
  }

  @Post('create')
  createBook(@Body() payload: CreateBookDto) {
    return this.bookService.createBook(payload);
    // return payload;
  }

  @Put('update/:id')
  updateBook(@Param('id') id: string, @Body() payload: UpdateBookDto) {
    return this.bookService.updateBook(+id, payload);
  }

  @Delete('delete/:id')
  deleteBook(@Param('id') id: string) {
    return this.bookService.deleteBook(+id);
  }
}
