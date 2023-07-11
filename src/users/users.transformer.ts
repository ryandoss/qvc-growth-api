import { Injectable } from '@nestjs/common';
import { User } from '@prisma/client';
import { UserResponseDto } from './dto/userResponse.dto';
@Injectable()
export class UserTransformer {
  public transform(user: User): UserResponseDto {
    const userResponse: UserResponseDto = new UserResponseDto({
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      role: user.role,
    });

    return userResponse;
  }

  public transformAllUsers(users: User[]): UserResponseDto[] {
    return users?.map((user) => this.transform(user));
  }
}
