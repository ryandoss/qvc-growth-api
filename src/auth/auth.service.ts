import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Prisma, Role, User } from '@prisma/client';
import { CreateUserRequestDto } from 'src/users/dto/createUserRequest.dto';
import { UserRepository } from '../users/users.repository';
import { TokensResponseDto } from './dto/tokenResponse.dto';
import { PasswordService } from './password.service';
import { JwtPayload } from './types';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly userRepository: UserRepository,
    private readonly passwordService: PasswordService,
    private readonly configService: ConfigService,
  ) {}

  async verifyPassword(
    plainTextPassword: string,
    hashedPassword: string,
  ): Promise<void> {
    const passwordValid = await this.passwordService.validatePassword(
      plainTextPassword,
      hashedPassword,
    );

    if (!passwordValid) {
      throw new HttpException(
        'Wrong credentials provided',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async createUser(payload: CreateUserRequestDto): Promise<TokensResponseDto> {
    const hashedPassword = await this.passwordService.hashPassword(
      payload.password,
    );

    try {
      const user = await this.userRepository.createUser({
        data: {
          ...payload,
          password: hashedPassword,
        },
      });

      const tokens = await this.generateTokens({
        userId: user.id,
        email: user.email,
        role: user.role,
      });
      await this.updateRefreshTokenHash(user.id, tokens.refreshToken);

      return tokens;
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new ConflictException(`Email ${payload.email} already used.`);
      }
      throw error;
    }
  }

  async login(email: string, password: string): Promise<TokensResponseDto> {
    const user = await this.userRepository.getUniqueUser({ where: { email } });

    if (!user) {
      throw new NotFoundException(`No user found for email: ${email}`);
    }

    const passwordValid = await this.passwordService.validatePassword(
      password,
      user.password,
    );

    if (!passwordValid) {
      throw new BadRequestException('Invalid password');
    }

    const tokens = await this.generateTokens({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    await this.updateRefreshTokenHash(user.id, tokens.refreshToken);

    return tokens;
  }

  async logout(userId: string): Promise<boolean> {
    await this.userRepository.updateUsersByParams({
      where: {
        id: userId,
        refreshTokenHash: {
          not: null,
        },
      },
      data: {
        refreshTokenHash: null,
      },
    });
    return true;
  }

  async validateWithRefreshToken(
    userId: string,
    refreshToken: string,
  ): Promise<User> {
    const user = await this.userRepository.getUniqueUser({
      where: {
        id: userId,
      },
    });
    if (!user || !user.refreshTokenHash) {
      throw new NotFoundException(`No user found`);
    }

    const refreshTokenMatches = await this.passwordService.validatePassword(
      refreshToken,
      user.refreshTokenHash,
    );
    if (!refreshTokenMatches) throw new ForbiddenException('Access Denied');
    const tokens = await this.generateTokens({
      userId,
      email: user.email,
      role: user.role,
    });
    await this.updateRefreshTokenHash(user.id, tokens.refreshToken);

    return user;
  }

  async updateRefreshTokenHash(userId: string, rt: string): Promise<void> {
    const refreshTokenHash = await this.passwordService.hashPassword(rt);
    await this.userRepository.updateUser({
      where: {
        id: userId,
      },
      data: {
        refreshTokenHash,
      },
    });
  }

  async generateTokens({
    userId,
    email,
    role,
  }: {
    userId: string;
    email: string;
    role: Role;
  }): Promise<TokensResponseDto> {
    const jwtPayload: JwtPayload = {
      sub: userId,
      email: email,
      role: role,
    };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(jwtPayload, {
        secret: this.configService.get<string>('JWT_ACCESS_SECRET'),
        expiresIn: '15m',
      }),
      this.jwtService.signAsync(jwtPayload, {
        secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
        expiresIn: '7d',
      }),
    ]);

    return {
      accessToken,
      refreshToken,
    };
  }

  async refreshToken(
    userId: string,
    token: string,
  ): Promise<TokensResponseDto> {
    try {
      const user = await this.userRepository.getUniqueUser({
        where: {
          id: userId,
        },
      });
      if (!user || !user.refreshTokenHash)
        throw new ForbiddenException('Access Denied');

      const refreshTokenHashMatches =
        await this.passwordService.validatePassword(
          token,
          user.refreshTokenHash,
        );
      if (!refreshTokenHashMatches)
        throw new ForbiddenException('Access Denied');

      const tokens = await this.generateTokens({
        userId: user.id,
        email: user.email,
        role: user.role,
      });
      await this.updateRefreshTokenHash(user.id, tokens.refreshToken);

      return tokens;
    } catch (e) {
      throw new UnauthorizedException();
    }
  }
}

export type Decode = {
  [index: string]: any;
};
