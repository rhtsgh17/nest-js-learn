import { OmitType, PickType } from '@nestjs/mapped-types';
import { Type } from 'class-transformer';
import {
  IsInt,
  IsNotEmpty,
  IsOptional,
  Length,
  Max,
  Min,
} from 'class-validator';
import { PageRequestDto } from 'src/utils/dto/page.dto';

export class BookDto {
  id: number;

  @IsNotEmpty()
  @Length(4, 25)
  title: string;

  @IsNotEmpty()
  description: string;

  @IsNotEmpty()
  author: string;

  @IsInt()
  @Min(2000)
  @Max(2024)
  year: number;
}

export class FindBookDto extends PageRequestDto {
  @IsOptional()
  title: string;

  @IsOptional()
  author: string;

  @IsOptional()
  @IsInt()
  @Type(() => Number)
  from_year: number;

  @IsOptional()
  @IsInt()
  @Type(() => Number)
  to_year: number;
}
export class CreateBookDto extends OmitType(BookDto, ['id']) {}
export class UpdateBookDto extends PickType(BookDto, [
  'title',
  'author',
  'description',
  'year',
]) {}
