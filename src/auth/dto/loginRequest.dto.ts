import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, MinLength } from 'class-validator';

export class LoginRequestDto {
  constructor(email: string, password: string) {
    this.email = email;
    this.password = password;
  }
  @ApiProperty()
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @ApiProperty()
  @MinLength(8)
  password: string;
}
