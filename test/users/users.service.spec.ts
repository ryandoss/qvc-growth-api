import {
  BadRequestException,
  INestApplication,
  InternalServerErrorException,
  NotFoundException,
  ValidationPipe,
} from '@nestjs/common';
import { TestingModule, Test } from '@nestjs/testing';
import { User } from '@prisma/client';
import { PrismaService } from '../../src/prisma/prisma.service';
import { AppModule } from 'src/app.module';
import { TokensResponseDto } from 'src/auth/dto/tokenResponse.dto';
import { useContainer } from 'class-validator';
import { UsersService } from 'src/users/users.service';
import { PasswordService } from 'src/auth/password.service';
import { UserRepository } from 'src/users/users.repository';
import { UpdateUserRequestDto } from 'src/users/dto/updateUserRequest.dto';
import { ChangePasswordRequestDto } from 'src/users/dto/changePasswordRequest.dto';

describe('UserService', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let userService: UsersService;

  let user1: User;
  let user2: User;
  jest.setTimeout(10000);

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    prisma = app.get<PrismaService>(PrismaService);

    useContainer(app.select(AppModule), { fallbackOnErrors: true });
    app.useGlobalPipes(new ValidationPipe({ whitelist: true }));

    userService = app.get<UsersService>(UsersService);

    await app.init();
    await prisma.cleanDb();
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(async () => {
    user1 = await prisma.user.create({
      data: {
        email: 'lisa@simpson.com',
        firstName: 'Lisa',
        lastName: 'Simpson',
        password:
          '$2b$10$EpRnTzVlqHNP0.fUbXUwSOyuiXe/QLSUG6xNekdHgTGmrpHEfIoxm', // secret42
        role: 'USER',
        ownedJobs: {
          create: {
            title: 'Join us for Prisma Day 2019 in Berlin',
            description: 'https://www.prisma.io/day/',
            published: true,
          },
        },
      },
    });

    user2 = await prisma.user.create({
      data: {
        email: 'bart@simpson.com',
        firstName: 'Bart',
        lastName: 'Simpson',
        role: 'ADMIN',
        password:
          '$2b$10$EpRnTzVlqHNP0.fUbXUwSOyuiXe/QLSUG6xNekdHgTGmrpHEfIoxm', // secret42
        ownedJobs: {
          create: [
            {
              title: 'Subscribe to GraphQL Weekly for community news',
              description: 'https://graphqlweekly.com/',
              published: true,
            },
            {
              title: 'Follow Prisma on Twitter',
              description: 'https://twitter.com/prisma',
              published: false,
            },
          ],
        },
      },
    });
  });

  afterEach(async () => {
    await prisma.cleanDb();
  });

  describe('getAllUsers', () => {
    test('should get all users', async () => {
      const users = await userService.getAllUsers();
      expect(users.length).toBe(2);
      expect(users).toContainEqual(user1);
      expect(users).toContainEqual(user2);
    });
  });

  describe('getUniqueUser', () => {
    test('should get user by id', async () => {
      const user = await userService.getUniqueUser(user1.id);
      expect(user).toMatchObject(user1);
    });

    test('should throw if user cannot be find by id', async () => {
      await prisma.cleanDb();
      const nonExistentUser = '1';
      await expect(async () => {
        await userService.getUniqueUser(nonExistentUser);
      }).rejects.toThrow(
        new NotFoundException(
          `User Resource ${nonExistentUser} was not found.`,
        ),
      );
    });
  });

  describe('updateUserById', () => {
    test('should update user', async () => {
      const updateUserRequest: UpdateUserRequestDto = {
        role: 'ADMIN',
        email: 'homer@example.com',
        firstName: 'Homer',
      };
      const updatedUser = await userService.updateUserById(
        user1.id,
        updateUserRequest,
      );
      expect(updatedUser).toMatchObject({
        ...user1,
        ...updateUserRequest,
        updatedAt: updatedUser.updatedAt,
      });
    });
  });

  describe('deleteUserById', () => {
    test('should delete user by id', async () => {
      await userService.deleteUserById(user1.id);
      await expect(async () => {
        await userService.getUniqueUser(user1.id);
      }).rejects.toThrow(
        new NotFoundException(`User Resource ${user1.id} was not found.`),
      );
    });

    test('should throw if cannot delete user', async () => {
      await prisma.cleanDb();
      const nonExistentUser = '1';
      await expect(async () => {
        await userService.deleteUserById(user1.id);
      }).rejects.toThrow(
        new InternalServerErrorException(`Could not delete User`),
      );
    });
  });

  describe('changeUserPassword', () => {
    const changePasswordRequest: ChangePasswordRequestDto = {
      oldPassword: 'wrongPassword',
      newPassword: 'Lisa123456',
    };
    test('should throw if password is incorrect', async () => {
      await expect(async () => {
        await userService.changeUserPassword(user1.id, changePasswordRequest);
      }).rejects.toThrow(new BadRequestException('Invalid password'));
    });

    test('should throw if user cannot be found', async () => {
      await expect(async () => {
        await userService.changeUserPassword('1', changePasswordRequest);
      }).rejects.toThrow(new NotFoundException('No User found'));
    });
  });
});
