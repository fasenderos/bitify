import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Cryptr from 'cryptr';

@Injectable()
export class CipherService {
  cryptr: Cryptr;

  constructor(private readonly config: ConfigService) {
    const secret = this.config.get<string>('encryption.secret') as string;
    this.cryptr = new Cryptr(secret);
  }

  encrypt(value: string) {
    return this.cryptr.encrypt(value);
  }

  decrypt(value: string) {
    return this.cryptr.decrypt(value);
  }
}
