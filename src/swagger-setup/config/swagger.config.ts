import { registerAs } from '@nestjs/config';

export default registerAs('swagger', () => {
  return {
    title: process.env.SWAGGER_TITLE || 'Unknown title',
    description: process.env.SWAGGER_DESCRIPTION || 'Unknown Description',
    version: process.env.SWAGGER_VERSION || 'Unknown Version',
  };
});

// no need to make them required as swagger won't be used in e2e for instance.
export const swaggerConfigSchema = {};
