import { PartialType } from '@nestjs/swagger';
import { CreateJobRequestDto } from './createJobRequest.dto';

export class UpdateJobWithoutUsersRequest extends PartialType(
  CreateJobRequestDto,
) {}
