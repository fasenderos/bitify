import { Injectable } from '@nestjs/common';
import { BaseService } from '../base/base.service';
import { ApiKey } from './entities/api-key.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateApiKeyDto } from './dto/create-api-key.dto';
import { UpdateApiKeyDto } from './dto/update-api-key.dto';
import { randomBytes } from 'crypto';
import { genSalt, hash } from 'bcrypt';

@Injectable()
export class ApiKeysService extends BaseService<
  ApiKey,
  CreateApiKeyDto,
  UpdateApiKeyDto
> {
  constructor(
    @InjectRepository(ApiKey)
    repo: Repository<ApiKey>,
  ) {
    super(repo);
  }

  override async save(apikey: ApiKey) {
    // Create Public and Private Api Keys
    const { privateKeyEncrypted, publicKey, privateKey } =
      await this.generateAPIKeys();

    // Save in DB hashed secret key and crypted public key
    apikey.secret = privateKeyEncrypted;
    apikey.public = publicKey;
    await this.repo.save(apikey);

    // Return the real public and secret keys to the user.
    // The secret key will never be shown again
    apikey.secret = privateKey;
    apikey.public = publicKey;
    return apikey;
  }

  async generateAPIKeys() {
    const privateBuffer = randomBytes(64);
    const privateKey = privateBuffer.toString('hex');
    const publicBuffer = randomBytes(64);
    const publicKey = publicBuffer.toString('hex');
    const salt = await genSalt(10);
    const privateKeyEncrypted = await hash(privateKey, salt);
    return { privateKeyEncrypted, publicKey, privateKey };
  }
}
