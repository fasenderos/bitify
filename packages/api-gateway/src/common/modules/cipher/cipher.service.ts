import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createCipheriv, randomBytes, createDecipheriv } from 'crypto';

@Injectable()
export class CipherService {
  ENCRYPTION_SECRET: string;
  IV_LENGTH = 16;
  ALGORITHM = 'aes-256-ctr';
  SEPARATOR = '::';

  constructor(private readonly config: ConfigService) {
    this.ENCRYPTION_SECRET = this.config.get<string>(
      'encryption.secret',
    ) as string;
  }

  encrypt(text: string) {
    const iv = randomBytes(this.IV_LENGTH);
    const cipher = createCipheriv(
      this.ALGORITHM,
      Buffer.from(this.ENCRYPTION_SECRET),
      iv,
    );
    let encrypted = cipher.update(text);
    encrypted = Buffer.concat([encrypted, cipher.final()]);
    return iv.toString('hex') + this.SEPARATOR + encrypted.toString('hex');
  }

  decrypt(text: string) {
    const textParts = text.split(this.SEPARATOR);
    const iv = Buffer.from(textParts.shift()!, 'hex');
    const encryptedText = Buffer.from(textParts.join(this.SEPARATOR), 'hex');
    const decipher = createDecipheriv(
      this.ALGORITHM,
      Buffer.from(this.ENCRYPTION_SECRET),
      iv,
    );
    let decrypted = decipher.update(encryptedText);
    decrypted = Buffer.concat([decrypted, decipher.final()]);
    return decrypted.toString();
  }
}
