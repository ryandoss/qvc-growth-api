import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { GetCurrentUserId } from 'src/common/decorators';
import { Roles } from 'src/common/decorators/roles.decorator';

import { UserResponseDto } from './dto/userResponse.dto';
import { UserTransformer } from './users.transformer';
import { UsersService } from './users.service';
import { ChangePasswordRequestDto } from './dto/changePasswordRequest.dto';
import { UpdateUserRequestDto } from './dto/updateUserRequest.dto';

@ApiTags('users')
@ApiBearerAuth('accessToken')
@UseGuards(JwtAuthGuard, RolesGuard)
@UseInterceptors(ClassSerializerInterceptor)
@Controller('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly userTransformer: UserTransformer,
  ) {}
  @ApiOperation({ summary: `update user's password` })
  @ApiResponse({
    status: 200,
    description: 'Updated password',
    type: UserResponseDto,
  })
  @ApiQuery({ name: 'role', enum: Role })
  @Patch(':id/password')
  async changePassword(
    @Param('id') userId: string,
    @Body() dto: ChangePasswordRequestDto,
  ): Promise<UserResponseDto> {
    const user = await this.usersService.changeUserPassword(userId, dto);
    return this.userTransformer.transform(user);
  }

  @Roles(Role.USER, Role.USER)
  @ApiOperation({ summary: 'update user by Id' })
  @ApiResponse({
    status: 200,
    description: 'Updated',
    type: UserResponseDto,
  })
  @ApiQuery({ name: 'role', enum: Role })
  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  async updateUser(
    @GetCurrentUserId() userId: string,
    @Body() dto: UpdateUserRequestDto,
  ): Promise<UserResponseDto> {
    const user = await this.usersService.updateUserById(userId, dto);
    return this.userTransformer.transform(user);
  }

  @ApiOperation({ summary: 'Get all users' })
  @ApiResponse({
    status: 200,
    description: 'Get All Users',
    type: UserResponseDto,
    isArray: true,
  })
  @Get()
  async getAllUsers(): Promise<UserResponseDto[]> {
    const allUsers = await this.usersService.getAllUsers();
    return this.userTransformer.transformAllUsers(allUsers);
  }

  @ApiOperation({ summary: 'Delete user by id' })
  @ApiResponse({
    status: 204,
    description: 'Deleted',
  })
  @Delete(':id')
  async deleteUserById(@Param('id') userId: string): Promise<void> {
    return await this.usersService.deleteUserById(userId);
  }
}
