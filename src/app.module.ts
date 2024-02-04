import { Module, ValidationPipe } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_PIPE } from '@nestjs/core';
import { AppService } from './app.service';
import { DatabaseModule } from './database/database.module';
import { IamModule } from './iam/iam.module';
import { UsersModule } from './users/users.module';

@Module({
  imports: [
    ConfigModule.forRoot(),
    DatabaseModule.forRoot(),
    UsersModule,
    IamModule,
  ],
  providers: [
    /**
     * register transforming validation pipe globally
     */
    {
      provide: APP_PIPE,
      useValue: new ValidationPipe({
        transform: true,
        forbidUnknownValues: true,
        forbidNonWhitelisted: true,
        whitelist: true,
      }),
    },
    AppService,
  ],
})
export class AppModule {}
