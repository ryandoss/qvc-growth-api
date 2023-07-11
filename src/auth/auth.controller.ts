import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiTags,
} from '@nestjs/swagger';
import { GetCurrentUser, GetCurrentUserId } from 'src/common/decorators';
import { Public } from 'src/common/decorators/public.decorator';
import { CreateUserRequestDto } from 'src/users/dto/createUserRequest.dto';
import { UserResponseDto } from 'src/users/dto/userResponse.dto';
import { UserTransformer } from 'src/users/users.transformer';

import { AuthService } from './auth.service';
import { LoginRequestDto } from './dto/loginRequest.dto';
import { TokensResponseDto } from './dto/tokenResponse.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { RefreshAuthGuard } from './guards/refresh-auth.guard';

@ApiTags('Auth')
@Public()
@Controller('auth')
export class AuthController {
  constructor(
    private readonly auth: AuthService,
    private readonly userTransformer: UserTransformer,
  ) {}

  @Public()
  @UseGuards(RefreshAuthGuard)
  @ApiOkResponse({
    description: 'Successfully refreshed tokens.',
    type: TokensResponseDto,
  })
  @HttpCode(HttpStatus.OK)
  @Post('refresh')
  async refreshToken(
    @GetCurrentUserId() userId: string,
    @GetCurrentUser('refreshToken') refreshToken: string,
  ): Promise<TokensResponseDto> {
    return this.auth.refreshToken(userId, refreshToken);
  }

  @ApiBearerAuth('refreshToken')
  @ApiOkResponse({
    description: 'Successfully got user',
    type: UserResponseDto,
  })
  @UseGuards(RefreshAuthGuard)
  @Get('me')
  async user(
    @GetCurrentUserId() userId: string,
    @GetCurrentUser('refreshToken') refreshToken: string,
  ): Promise<UserResponseDto> {
    const user = await this.auth.validateWithRefreshToken(userId, refreshToken);
    return this.userTransformer.transform(user);
  }

  @Post('signup')
  @ApiCreatedResponse({
    description: 'The user has been successfully created.',
    type: TokensResponseDto,
  })
  @HttpCode(HttpStatus.CREATED)
  async signup(@Body() dto: CreateUserRequestDto): Promise<TokensResponseDto> {
    return await this.auth.createUser(dto);
  }

  @Post('login')
  @ApiOkResponse({
    description: 'The user has been successfully logged in.',
    type: TokensResponseDto,
  })
  @HttpCode(HttpStatus.OK)
  async login(@Body() dto: LoginRequestDto): Promise<TokensResponseDto> {
    return await this.auth.login(dto.email.toLowerCase(), dto.password);
  }

  @Public()
  @ApiOkResponse({
    description: 'Successfully Logged Out.',
  })
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @Post('logout')
  async logOut(@GetCurrentUserId() userId: string): Promise<boolean> {
    return await this.auth.logout(userId);
  }
}
