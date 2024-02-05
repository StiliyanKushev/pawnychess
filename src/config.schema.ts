import { databaseConfigSchema } from 'database/config/database.config';
import { jwtConfigSchema } from 'iam/config/jwt.config';
import Joi from 'joi';
import { loggingConfigSchema } from 'logging/config/logging.config';
import { redisConfigSchema } from 'redis/config/redis.config';
import { swaggerConfigSchema } from 'swagger-setup/config/swagger.config';

/**
 * This is an all in one validation schema for the entire
 * process environment that is to be applied on boot.
 */
export const configSchema = Joi.object({
  ...jwtConfigSchema,
  ...redisConfigSchema,
  ...loggingConfigSchema,
  ...swaggerConfigSchema,
  ...databaseConfigSchema,

  /**
   * Include additional core validations
   */
  ENVIRONMENT: Joi.string().pattern(/^development|production$/),
});
