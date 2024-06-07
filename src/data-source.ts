// data-source.ts
import { DataSource } from 'typeorm';
import { User } from '../src/auth/entities/user.entity';  // Adjust the path based on your project structure

export const AppDataSource = new DataSource({
  type: 'mysql',  // or your database type
  host: 'localhost',
  port: 3306,
  username: 'root',
  password: '',
  database: 'auth_db',
  entities: [User],
  migrations: ['src/migrations/*.ts'],
  synchronize: false,
});
