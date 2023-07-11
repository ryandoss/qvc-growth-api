import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { AuthModule } from 'src/auth/auth.module';
import config from 'src/common/configs/config';
import { JobsModule } from 'src/jobs/jobs.module';
import { UsersModule } from 'src/users/users.module';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { RolesGuard } from './auth/guards/roles.guard';
import { PrismaModule } from './prisma/prisma.module';
import { PrismaService } from './prisma/prisma.service';

@Module({
  imports: [
    AuthModule,
    UsersModule,
    JobsModule,
    ConfigModule.forRoot({ isGlobal: true, load: [config] }),
    PrismaModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    AppController,
    PrismaService,
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
  ],
})
export class AppModule {}
