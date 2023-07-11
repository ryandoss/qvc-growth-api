import { ApiProperty, PartialType } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';
import { Role } from '@prisma/client';
import { CreateUserRequestDto } from './createUserRequest.dto';

export class UpdateUserRequestDto extends PartialType(CreateUserRequestDto) {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  firstName?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  lastName?: string;

  @ApiProperty({
    enum: Role,
    isArray: true,
    example: [Role.ADMIN, Role.USER],
  })
  @IsOptional()
  role!: Role;
}
