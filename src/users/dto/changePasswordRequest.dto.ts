import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, MinLength } from 'class-validator';

export class ChangePasswordRequestDto {
  constructor(oldPassword: string, newPassword: string) {
    this.oldPassword = oldPassword;
    this.newPassword = newPassword;
  }
  @ApiProperty()
  @IsNotEmpty()
  @MinLength(8)
  oldPassword: string;
  @ApiProperty()
  @IsNotEmpty()
  @MinLength(8)
  newPassword: string;
}
