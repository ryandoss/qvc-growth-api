import { PartialType, ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';
import { CreateJobRequestDto } from './createJobRequest.dto';

export class UpdateJobRequestDto extends PartialType(CreateJobRequestDto) {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  description?: string;
  @ApiProperty({ required: false })
  @IsOptional()
  users?: any[];
}
