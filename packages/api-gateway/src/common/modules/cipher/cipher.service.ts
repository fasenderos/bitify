import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createCipheriv, createDecipheriv, randomBytes } from 'crypto';

@Injectable()
export class CipherService {
  secret: string;
  // TODO make the following configurable
  separator: string = '::';
  ivLength: number = 16;
  algorithm: string = 'aes-256-ctr';

  constructor(private readonly config: ConfigService) {
    this.secret = this.config.get<string>('encryption.secret') as string;
  }

  encrypt(text: string) {
    const iv = randomBytes(this.ivLength);
    const cipher = createCipheriv(this.algorithm, Buffer.from(this.secret), iv);
    let encrypted = cipher.update(text);
    encrypted = Buffer.concat([encrypted, cipher.final()]);
    return iv.toString('hex') + this.separator + encrypted.toString('hex');
  }

  decrypt(text: string) {
    const textParts = text.split(this.separator);
    const iv = Buffer.from(textParts.shift() as string, 'hex');
    const encryptedText = Buffer.from(textParts.join(this.separator), 'hex');
    const decipher = createDecipheriv(
      this.algorithm,
      Buffer.from(this.secret),
      iv,
    );
    let decrypted = decipher.update(encryptedText);
    decrypted = Buffer.concat([decrypted, decipher.final()]);
    return decrypted.toString();
  }
}
