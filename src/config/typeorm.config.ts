import { TypeOrmModuleOptions } from '@nestjs/typeorm';
export const typeOrmConfig: TypeOrmModuleOptions = {
  type: 'mysql',
  host: 'localhost',
  // port: 3307, //port default 3306 lihat xampp
  port: 3306, //port default 3306 lihat xampp
  username: 'root', // username default xampp root
  // password: 'root', // password default xampp string kosong
  password: '', // password default xampp string kosong
  database: 'belajar_nest_js',
  entities: ['dist/**/*.entity{.ts,.js}'],
  synchronize: true,
  logging: true,
};
