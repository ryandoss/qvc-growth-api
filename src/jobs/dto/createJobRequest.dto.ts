import { OmitType } from '@nestjs/swagger';
import { JobRequestDto } from './jobRequest.dto';

export class CreateJobRequestDto extends OmitType(JobRequestDto, [
  'createdAt',
  'updatedAt',
  'id',
  'ownerId',
] as const) {}
