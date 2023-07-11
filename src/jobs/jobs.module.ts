import { Module } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { PrismaService } from 'src/prisma/prisma.service';

import { JobsController } from './jobs.controller';
import { JobRepository } from './jobs.repository';
import { JobsService } from './jobs.service';
import { JobsTransformer } from './jobs.transformer';

@Module({
  imports: [],
  providers: [
    JobsService,
    JobsTransformer,
    JwtAuthGuard,
    RolesGuard,
    PrismaService,
    JobRepository,
  ],
  controllers: [JobsController],
})
export class JobsModule {}
