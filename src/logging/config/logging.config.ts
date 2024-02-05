import { registerAs } from '@nestjs/config';
import Joi from 'joi';

export default registerAs('logging', () => {
  return {
    minimumLevel: process.env.MINIMUM_LOG_LEVEL ?? 'info',
  };
});

export const loggingConfigSchema = {
  MINIMUM_LOG_LEVEL: Joi.string().pattern(
    /^trace|debug|info|warn|error|fatal|$/,
  ),
};
