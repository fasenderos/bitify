import { Injectable } from '@nestjs/common';
import { BaseService } from '../base/base.service';
import { RecoveryToken } from './entities/recovery-token.entity';
import { DeepPartial, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity';

@Injectable()
export class RecoveryTokensService extends BaseService<
  RecoveryToken,
  DeepPartial<RecoveryToken>,
  QueryDeepPartialEntity<RecoveryToken>
> {
  constructor(
    @InjectRepository(RecoveryToken)
    repo: Repository<RecoveryToken>,
  ) {
    super(repo);
  }
}
