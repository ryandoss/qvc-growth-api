import { ApiProperty } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { IsString } from 'class-validator';
import { IsISO8601 } from 'class-validator';
import { IsOptional } from 'class-validator';
import { IsDefined } from 'class-validator';

export class UserRequestDto {
  constructor(partial: Partial<UserRequestDto>) {
    Object.assign(this, partial);
  }
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
  @IsString()
  email!: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  firstName?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  lastName?: string;

  @ApiProperty()
  @IsDefined()
  ownedJobs!: unknown;

  @ApiProperty({
    enum: Role,
    isArray: true,
    example: [Role.ADMIN, Role.USER],
  })
  @IsDefined()
  role!: Role;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  refreshTokenHash?: string;

  @ApiProperty()
  @IsString()
  password!: string;
}
