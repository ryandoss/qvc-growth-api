import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { Job } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateJobRequestDto } from './dto/createJobRequest.dto';
import { PublishJobRequestDto } from './dto/publishJobRequest.dto';
import { UpdateJobRequestDto } from './dto/updateJobRequest.dto';
import { UpdateJobWithoutUsersRequest } from './dto/updateJobWithoutUsersRequest.dto';
import { JobRepository } from './jobs.repository';

@Injectable()
export class JobsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jobRepository: JobRepository,
  ) {}

  async getAllJobs(): Promise<Job[]> {
    try {
      const allJobs = await this.jobRepository.getJobs({});

      if (!allJobs) {
        throw new NotFoundException('No Jobs found');
      }
      return allJobs;
    } catch (e) {
      throw new InternalServerErrorException(`Could not get Job Resources.`);
    }
  }
  async getAllOwnedJobs(userId: string): Promise<Job[]> {
    const allJobs = await this.jobRepository.getJobs({
      where: {
        ownerId: userId,
      },
    });
    if (!allJobs) {
      throw new NotFoundException('No Jobs found');
    }
    return allJobs;
  }

  async getJobById(jobId: string): Promise<Job> {
    const job = await this.jobRepository.getJobById({
      where: {
        id: jobId,
      },
    });

    if (!job) {
      throw new NotFoundException('No Job found');
    }

    return job;
  }

  async getJobsByUserId(userId: string): Promise<Job[]> {
    try {
      const userJobs = await this.jobRepository.getJobs({
        where: {
          users: {
            some: { userId: userId },
          },
        },
      });
      if (!userJobs) {
        throw new NotFoundException('No Jobs found');
      }
      return userJobs;
    } catch (e) {
      throw new NotFoundException(
        `Job Resources for ${userId} could not be found`,
      );
    }
  }

  async createJob(userId: string, dto: CreateJobRequestDto): Promise<Job> {
    try {
      const data = {
        data: {
          ...dto,
          ownerId: userId,
          users: { create: [{ user: { connect: { id: userId } } }] },
        },
      };
      return await this.jobRepository.createJob(data);
    } catch (err) {
      throw new InternalServerErrorException(`Could not create Job Resource.`);
    }
  }

  async updateJob(jobId: string, dto: UpdateJobRequestDto): Promise<Job> {
    try {
      if (dto.users) {
        return await this.jobRepository.updateJob({
          where: {
            id: jobId,
          },
          data: {
            ...dto,
            users: {
              connectOrCreate: dto.users.map((user) => ({
                where: {
                  userId_jobId: {
                    userId: user.id,
                    jobId: jobId,
                  },
                },
                create: {
                  user: {
                    connect: {
                      id: user.id,
                    },
                  },
                },
              })),
            },
          },
        });
      }
      return await this.jobRepository.updateJob({
        where: {
          id: jobId,
        },
        data: dto as UpdateJobWithoutUsersRequest,
      });
    } catch (err) {
      throw new InternalServerErrorException(
        `Could not update Job Resource ${jobId}.`,
      );
    }
  }

  async publishJob(jobId: string, dto: PublishJobRequestDto): Promise<Job> {
    try {
      return this.jobRepository.updateJob({
        where: {
          id: jobId,
        },
        data: {
          published: dto.published,
        },
      });
    } catch (err) {
      throw new InternalServerErrorException(
        `Could not update Job Resource ${jobId}.`,
      );
    }
  }

  async deleteJob(jobId: string): Promise<void> {
    try {
      await this.jobRepository.deleteJob({
        where: {
          id: jobId,
        },
      });
    } catch (err) {
      throw new InternalServerErrorException(
        `Could not delete Job Resource ${jobId}.`,
      );
    }
  }
}
