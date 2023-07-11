import { Injectable } from '@nestjs/common';
import { Job } from '@prisma/client';
import { JobResponseDto } from './dto/jobResponse.dto';

@Injectable()
export class JobsTransformer {
  public transform(job: Job): JobResponseDto {
    const jobResponse = new JobResponseDto({
      id: job.id,
      createdAt: job.createdAt,
      updatedAt: job.updatedAt,
      published: job.published,
      title: job.title,
      description: job.description,
      ownerId: job.ownerId,
    });

    return jobResponse;
  }

  public transformAllUsers(jobs: Job[]): JobResponseDto[] {
    return jobs?.map((job) => this.transform(job));
  }
}
