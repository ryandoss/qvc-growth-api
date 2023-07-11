import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { SecurityConfig } from 'src/common/configs/config.interface';
import { PrismaService } from 'src/prisma/prisma.service';
import { UserTransformer } from 'src/users/users.transformer';

import { UserRepository } from '../users/users.repository';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { RefreshAuthGuard } from './guards/refresh-auth.guard';
import { RolesGuard } from './guards/roles.guard';
import { PasswordService } from './password.service';
import { JwtStrategy } from './strategies/jwt.strategy';
import { RefreshStrategy } from './strategies/refresh.strategy';

@Module({
  imports: [
    PassportModule.register({}),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => {
        const securityConfig = configService.get<SecurityConfig>('security');
        return {
          secret: configService.get<string>('JWT_ACCESS_SECRET'),
          signOptions: {
            expiresIn: securityConfig?.expiresIn,
          },
        };
      },
    }),
  ],
  providers: [
    PrismaService,
    AuthService,
    JwtStrategy,
    JwtAuthGuard,
    RefreshAuthGuard,
    RefreshStrategy,
    RolesGuard,
    PasswordService,
    UserRepository,
    UserTransformer,
  ],
  exports: [JwtAuthGuard],
  controllers: [AuthController],
})
export class AuthModule {}
