import { registerAs } from '@nestjs/config';

export default registerAs('logging', () => {
  return {
    minimumLevel: process.env.MINIMUM_LOG_LEVEL ?? 'info',
  };
});
