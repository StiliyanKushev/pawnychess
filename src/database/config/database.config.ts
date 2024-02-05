import { registerAs } from '@nestjs/config';
import Joi from 'joi';

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

export const databaseConfigSchema = {
  POSTGRES_HOST: Joi.string().required(),
  POSTGRES_PORT: Joi.string().pattern(/^\d+$/),
  POSTGRES_USERNAME: Joi.string().required(),
  POSTGRES_PASSWORD: Joi.string().required(),
  POSTGRES_DATABASE: Joi.string().required(),
};
