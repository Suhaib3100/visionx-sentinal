import { registerAs } from '@nestjs/config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';

export default registerAs(
  'database',
  (): TypeOrmModuleOptions => ({
    type: 'postgres',
    host: process.env.DATABASE_HOST || 'localhost',
    port: parseInt(process.env.DATABASE_PORT || '5432', 10),
    username: process.env.DATABASE_USER || 'visionx',
    password: process.env.DATABASE_PASSWORD || 'visionx_dev_password',
    database: process.env.DATABASE_NAME || 'visionx_eval',
    entities: [__dirname + '/../**/*.entity{.ts,.js}'],
    migrations: [__dirname + '/../database/migrations/*{.ts,.js}'],
    synchronize: process.env.NODE_ENV === 'development',
    logging: process.env.NODE_ENV === 'development',
    migrationsRun: false,
    ssl: process.env.DATABASE_SSL === 'true' || process.env.NODE_ENV === 'production' 
      ? { rejectUnauthorized: false } 
      : false,
  })
);
