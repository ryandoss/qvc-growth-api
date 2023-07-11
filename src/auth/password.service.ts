import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { compare, hash, genSalt } from 'bcrypt';
import { SecurityConfig } from 'src/common/configs/config.interface';

@Injectable()
export class PasswordService {
  get bcryptSaltRounds(): number {
    const securityConfig = this.configService.get<SecurityConfig>('security');

    const saltOrRounds = securityConfig ? securityConfig.bcryptSaltOrRound : 10;

    return saltOrRounds;
  }

  constructor(private configService: ConfigService) {}

  validatePassword(password: string, hashedPassword: string): Promise<boolean> {
    return compare(password, hashedPassword);
  }

  async hashPassword(password: string): Promise<string> {
    const salt = await genSalt(this.bcryptSaltRounds);
    return hash(password, salt);
  }
}
