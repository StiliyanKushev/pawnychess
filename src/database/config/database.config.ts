import { registerAs } from '@nestjs/config';

export default registerAs('database', () => {
  return {
    host: process.env.POSTGRES_HOST,
    port: parseInt(process.env.POSTGRES_PORT || '5432', 10),
    username: process.env.POSTGRES_USERNAME,
    password: process.env.POSTGRES_PASSWORD,
    database: process.env.POSTGRES_DATABASE,
    development: process.env.ENVIRONMENT?.toLowerCase() == 'development',
  };
});
