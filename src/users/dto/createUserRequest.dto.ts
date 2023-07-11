import { OmitType } from '@nestjs/swagger';
import { UserRequestDto } from './userRequest.dto';

export class CreateUserRequestDto extends OmitType(UserRequestDto, [
  'createdAt',
  'updatedAt',
  'id',
  'ownedJobs',
  'refreshTokenHash',
] as const) {}
