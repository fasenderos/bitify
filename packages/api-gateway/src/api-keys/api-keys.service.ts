import { Injectable } from '@nestjs/common';
import { BaseService } from '../base/base.service';
import { ApiKey } from './entities/api-key.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateApiKeyDto } from './dto/create-api-key.dto';
import { UpdateApiKeyDto } from './dto/update-api-key.dto';
import { randomBytes } from 'crypto';
import { genSalt, hash } from 'bcrypt';
import { QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity';

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

    // Set api key expiration
    this.setExpiration(apikey);

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

  override async updateById(
    id: string,
    data: UpdateApiKeyDto,
    userId: string | undefined,
  ): Promise<void> {
    const update: QueryDeepPartialEntity<ApiKey> = { ...data };
    // If userIps is `null`, means that user have
    // removed the IPs, so we have to update the apikey expiration
    if (data.userIps === null) this.setExpiration(update);
    await this.repo.update(
      {
        id,
        ...(userId ? { userId: userId } : {}),
      },
      update,
    );
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

  setExpiration(apiKey: QueryDeepPartialEntity<ApiKey>) {
    if (apiKey.userIps && apiKey.userIps?.length > 0) return;
    // Without IP apiKey expires in 90 days
    // 60 * 60 * 24 * 90 * 1000 = 7_776_000_000
    apiKey.expiresAt = new Date(Date.now() + 7_776_000_000);
  }
}
