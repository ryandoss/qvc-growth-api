import { ApiProperty, OmitType } from '@nestjs/swagger';
import { IsBoolean } from 'class-validator';
import { JobRequestDto } from './jobRequest.dto';

export class PublishJobRequestDto extends OmitType(JobRequestDto, [
  'createdAt',
  'updatedAt',
  'id',
  'ownerId',
  'title',
  'description',
] as const) {
  @ApiProperty()
  @IsBoolean()
  published!: boolean;
}
