import { ApiProperty } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { Dto } from 'src/common/dto/dto';

export class UserResponseDto extends Dto<UserResponseDto> {
  @ApiProperty({ example: 'cldt7idk8000008l746tgdjce' })
  public id!: string;

  @ApiProperty({ example: 'email@example.com' })
  public email!: string;

  @ApiProperty({ example: 'John' })
  public firstName!: string | null;

  @ApiProperty({ example: 'Hancock' })
  public lastName!: string | null;

  @ApiProperty({ example: new Date() })
  createdAt!: Date;

  @ApiProperty({ example: new Date() })
  updatedAt!: Date;

  @ApiProperty({ example: 'USER' })
  role!: Role;
}
