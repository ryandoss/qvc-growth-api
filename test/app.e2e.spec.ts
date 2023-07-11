import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { Job, User } from '@prisma/client';
import { LoginRequestDto } from 'src/auth/dto/loginRequest.dto';

import { TokensResponseDto } from 'src/auth/dto/tokenResponse.dto';
import { CreateJobRequestDto } from 'src/jobs/dto/createJobRequest.dto';
import { PublishJobRequestDto } from 'src/jobs/dto/publishJobRequest.dto';
import { UpdateJobRequestDto } from 'src/jobs/dto/updateJobRequest.dto';
import { ChangePasswordRequestDto } from 'src/users/dto/changePasswordRequest.dto';
import { CreateUserRequestDto } from 'src/users/dto/createUserRequest.dto';
import { UpdateUserRequestDto } from 'src/users/dto/updateUserRequest.dto';

import * as request from 'supertest';

import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';

describe('App e2e', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let tokens: TokensResponseDto;
  let user: User;
  jest.setTimeout(10000);

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    await app.init();

    prisma = app.get<PrismaService>(PrismaService);
    await prisma.cleanDb();
  });

  afterAll(() => {
    void app.close();
  });

  describe('Auth', () => {
    const signUpDto: CreateUserRequestDto = {
      email: 'foo@bar.com',
      password: '12345678',
      firstName: 'John',
      lastName: 'Doe',
      role: 'USER',
    };
    const signinDto: LoginRequestDto = {
      email: 'foo@bar.com',
      password: '12345678',
    };

    describe('Signup', () => {
      it('should throw if email, first name, and last name is empty', async () => {
        return request(app.getHttpServer())
          .post('/auth/signup')
          .send({
            password: signUpDto.password,
          })
          .expect(400);
      });
      it('should throw if password is empty', async () => {
        return request(app.getHttpServer())
          .post('/auth/signup')
          .send({
            firstName: signUpDto.firstName,
            lastName: signUpDto.lastName,
            email: signUpDto.email,
          })
          .expect(400);
      });
      it('should throw if no body was provided', async () => {
        return request(app.getHttpServer()).post('/auth/signup').expect(400);
      });
      it('Should sign up', async () => {
        return request(app.getHttpServer())
          .post('/auth/signup')
          .send(signUpDto)
          .expect(201)
          .expect(({ body }: { body: TokensResponseDto }) => {
            expect(body.accessToken).toBeTruthy();
            expect(body.refreshToken).toBeTruthy();
          });
      });
    });

    describe('Signin', () => {
      it('should throw if email is empty', async () => {
        return request(app.getHttpServer())
          .post('/auth/login')
          .send({
            password: signinDto.password,
          })
          .expect(400);
      });
      it('should throw if password is empty', async () => {
        return request(app.getHttpServer())
          .post('/auth/login')
          .send({
            email: signinDto.email,
          })
          .expect(400);
      });
      it('should throw if no body was provided', async () => {
        return request(app.getHttpServer()).post('/auth/login').expect(400);
      });
      it('Should sign in', async () => {
        return request(app.getHttpServer())
          .post('/auth/login')
          .send(signinDto)
          .expect(200)
          .expect(({ body }: { body: TokensResponseDto }) => {
            expect(body.accessToken).toBeTruthy();
            expect(body.refreshToken).toBeTruthy();
            tokens = body;
          });
      });
    });

    it('should refresh tokens', async () => {
      // wait for 1 second
      await new Promise((resolve) => {
        setTimeout(() => {
          resolve(true);
        }, 1000);
      });

      return request(app.getHttpServer())
        .post('/auth/refresh')
        .auth(tokens.refreshToken, {
          type: 'bearer',
        })
        .expect(200)
        .expect(({ body }: { body: TokensResponseDto }) => {
          expect(body.accessToken).toBeTruthy();
          expect(body.refreshToken).toBeTruthy();

          expect(body.refreshToken).not.toBe(tokens.accessToken);
          expect(body.refreshToken).not.toBe(tokens.refreshToken);
        });
    });

    it('should get current user', async () => {
      return request(app.getHttpServer())
        .get('/auth/me')
        .auth(tokens.refreshToken, {
          type: 'bearer',
        })
        .expect(200)
        .expect(({ body }: { body: User }) => {
          expect(body.firstName).toBeTruthy();
          expect(body.lastName).toBeTruthy();
          expect(body.email).toBeTruthy();
          expect(body.id).toBeTruthy();
          expect(body.password).toBeFalsy();
          expect(body.refreshTokenHash).toBeFalsy();
          user = body;
        });
    });

    it('should logout', () => {
      return request(app.getHttpServer())
        .post('/auth/logout')
        .auth(tokens.accessToken, {
          type: 'bearer',
        })
        .expect(200);
    });

    it('Should sign in', async () => {
      return request(app.getHttpServer())
        .post('/auth/login')
        .send(signinDto)
        .expect(200)
        .expect(({ body }: { body: TokensResponseDto }) => {
          expect(body.accessToken).toBeTruthy();
          expect(body.refreshToken).toBeTruthy();
          tokens = body;
        });
    });
  });
  describe('User', () => {
    describe('Edit user', () => {
      it('should edit current user', async () => {
        const dto: UpdateUserRequestDto = {
          firstName: 'Johnathan',
          lastName: 'Doseph',
          email: 'johathan@gmail.com',
          role: 'ADMIN',
        };
        return request(app.getHttpServer())
          .patch(`/users/${user.id}`)
          .auth(tokens.accessToken, {
            type: 'bearer',
          })
          .send(dto)
          .expect(200)
          .expect(({ body }: { body: User }) => {
            expect(body.firstName).toEqual('Johnathan');
            expect(body.lastName).toEqual('Doseph');
            expect(body.email).toEqual('johathan@gmail.com');
            expect(body.role).toEqual('ADMIN');
          });
      });
      it('should change password', async () => {
        const changePasswordDto: ChangePasswordRequestDto = {
          oldPassword: '12345678',
          newPassword: 'abcdefgh',
        };
        return request(app.getHttpServer())
          .patch(`/users/${user.id}/password`)
          .auth(tokens.accessToken, {
            type: 'bearer',
          })
          .send(changePasswordDto)
          .expect(200);
      });
    });
  });
  describe('job', () => {
    let job: Job;
    describe('Get empty job', () => {
      it('should get empty job', async () => {
        return request(app.getHttpServer())
          .get('/jobs')
          .auth(tokens.accessToken, {
            type: 'bearer',
          })
          .expect(200)
          .expect(({ body }: { body: Job }) => {
            expect(body).toEqual([]);
          });
      });
    });
    describe('Create job', () => {
      const dto: CreateJobRequestDto = {
        title: 'test job',
        description: 'A description of the first test job',
        published: false,
      };
      it('should create job', async () => {
        return request(app.getHttpServer())
          .post('/jobs')
          .auth(tokens.accessToken, {
            type: 'bearer',
          })
          .send(dto)
          .expect(201)
          .expect(({ body }: { body: Job }) => {
            expect(body.title).toBeTruthy();
            expect(body.description).toBeTruthy();
            job = body;
          });
      });
    });
    describe('Get jobs', () => {
      it('should get jobs', async () => {
        return request(app.getHttpServer())
          .get('/jobs')
          .auth(tokens.accessToken, {
            type: 'bearer',
          })
          .expect(200)
          .expect(({ body }: { body: Job[] }) => {
            expect(body).toHaveLength(1);
            expect(body[0]).toEqual(job);
          });
      });
    });
    describe('Get job by id', () => {
      it('should get job by id', async () => {
        return request(app.getHttpServer())
          .get(`/jobs/${job.id}`)
          .auth(tokens.accessToken, {
            type: 'bearer',
          })
          .expect(200)
          .expect(({ body }: { body: Job }) => {
            expect(body.id).toEqual(job.id);
          });
      });
    });
    describe('Edit job by id', () => {
      const dto: UpdateJobRequestDto = {
        description: 'first group budget test',
      };
      it('should edit job by id', async () => {
        return request(app.getHttpServer())
          .patch(`/jobs/${job.id}`)
          .auth(tokens.accessToken, {
            type: 'bearer',
          })
          .send(dto)
          .expect(200)
          .expect(({ body }: { body: Job }) => {
            expect(body.id).toEqual(job.id);
          });
      });
      const publish: PublishJobRequestDto = { published: true };
      it('should publish job by id', async () => {
        return request(app.getHttpServer())
          .patch(`/jobs/${job.id}/publish`)
          .auth(tokens.accessToken, {
            type: 'bearer',
          })
          .send(publish)
          .expect(200)
          .expect(({ body }: { body: Job }) => {
            expect(body.published).toBeTruthy();
          });
      });
    });
    describe('Delete job', () => {
      it('should delete a job by id', async () => {
        return request(app.getHttpServer())
          .delete(`/jobs/${job.id}`)
          .auth(tokens.accessToken, {
            type: 'bearer',
          })
          .expect(204);
      });
    });
  });
});
