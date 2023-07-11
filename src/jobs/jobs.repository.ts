import { Injectable } from '@nestjs/common';
import { Job, Prisma } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class JobRepository {
  constructor(private prisma: PrismaService) {}

  async createJob(params: { data: Prisma.JobCreateInput }): Promise<Job> {
    const { data } = params;
    return this.prisma.job.create({ data });
  }

  async getJobs(params: {
    skip?: number;
    take?: number;
    cursor?: Prisma.JobWhereUniqueInput;
    where?: Prisma.JobWhereInput;
    orderBy?: Prisma.JobOrderByWithRelationInput;
  }): Promise<Job[]> {
    const { skip, take, cursor, where, orderBy } = params;
    return this.prisma.job.findMany({ skip, take, cursor, where, orderBy });
  }

  async getJobById(params: {
    where: Prisma.JobWhereUniqueInput;
  }): Promise<Job> {
    const { where } = params;
    return this.prisma.job.findUniqueOrThrow({ where });
  }

  async updateJob(params: {
    where: Prisma.JobWhereUniqueInput;
    data: Prisma.JobUpdateInput;
  }): Promise<Job> {
    const { where, data } = params;
    return this.prisma.job.update({ where, data });
  }

  async deleteJob(params: { where: Prisma.JobWhereUniqueInput }): Promise<Job> {
    const { where } = params;
    return this.prisma.job.delete({ where });
  }
}
