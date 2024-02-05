import { registerAs } from '@nestjs/config';
import Joi from 'joi';

export default registerAs('redis', () => {
  return {
    host: process.env.REDIS_HOST,
    port: parseInt(process.env.REDIS_PORT ?? '6379', 10),
  };
});

export const redisConfigSchema = {
  REDIS_HOST: Joi.string().required(),
  REDIS_PORT: Joi.string().pattern(/^\d+$/),
};
