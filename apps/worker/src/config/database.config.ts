import { registerAs } from '@nestjs/config';

export default registerAs('database', () => ({
  host: process.env.DATABASE_HOST || process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DATABASE_PORT || process.env.DB_PORT || '5432', 10),
  username: process.env.DATABASE_USER || process.env.DB_USERNAME || 'postgres',
  password: process.env.DATABASE_PASSWORD || process.env.DB_PASSWORD || 'postgres',
  database: process.env.DATABASE_NAME || process.env.DB_NAME || 'visionx_eval',
  synchronize: process.env.DB_SYNC === 'true',
  ssl: process.env.DATABASE_SSL === 'true' ? { rejectUnauthorized: false } : false,
}));
