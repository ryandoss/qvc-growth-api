import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { User } from '@prisma/client';
import { PasswordService } from 'src/auth/password.service';
import { ChangePasswordRequestDto } from './dto/changePasswordRequest.dto';
import { UpdateUserRequestDto } from './dto/updateUserRequest.dto';
import { UserRepository } from './users.repository';

@Injectable()
export class UsersService {
  constructor(
    private passwordService: PasswordService,
    private repository: UserRepository,
  ) {}

  async getAllUsers(): Promise<User[]> {
    try {
      return await this.repository.getUsers({});
    } catch (err) {
      throw new InternalServerErrorException(`Could not get User Resources.`);
    }
  }

  async getUniqueUser(userId: string): Promise<User> {
    try {
      return await this.repository.getUniqueUser({
        where: { id: userId },
      });
    } catch (err) {
      throw new NotFoundException(`User Resource ${userId} was not found.`);
    }
  }

  async updateUserById(
    userId: string,
    newUserData: UpdateUserRequestDto,
  ): Promise<User> {
    return await this.repository.updateUser({
      data: newUserData,
      where: {
        id: userId,
      },
    });
  }

  async deleteUserById(userId: string): Promise<void> {
    try {
      await this.repository.deleteUser({
        where: { id: userId },
      });
    } catch (err) {
      throw new InternalServerErrorException(`Could not delete User`);
    }
  }

  async changeUserPassword(
    userId: string,
    changePassword: ChangePasswordRequestDto,
  ): Promise<User> {
    const user = await this.repository.getUniqueUser({ where: { id: userId } });

    if (!user) {
      throw new NotFoundException('No user found by that id');
    }

    if (
      !(await this.passwordService.validatePassword(
        changePassword.oldPassword,
        user.password,
      ))
    ) {
      throw new BadRequestException('Invalid password');
    }

    const hashedPassword = await this.passwordService.hashPassword(
      changePassword.newPassword,
    );

    return await this.repository.updateUser({
      data: {
        password: hashedPassword,
      },
      where: { id: userId },
    });
  }
}
