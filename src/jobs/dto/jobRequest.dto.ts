import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsISO8601, IsBoolean, IsOptional } from 'class-validator';

export class JobRequestDto {
  @ApiProperty()
  @IsString()
  id!: string;

  @ApiProperty()
  @IsISO8601()
  createdAt!: Date;

  @ApiProperty()
  @IsISO8601()
  updatedAt!: Date;

  @ApiProperty()
  @IsBoolean()
  published!: boolean;

  @ApiProperty()
  @IsString()
  title!: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  description!: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  ownerId?: string;
}
