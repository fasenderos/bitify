import { Injectable } from '@nestjs/common';
import { BaseService } from '../base/base.service';
import { RecoveryToken } from './recovery-token.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class RecoveryTokenService extends BaseService<RecoveryToken> {
  constructor(
    @InjectRepository(RecoveryToken)
    repo: Repository<RecoveryToken>,
  ) {
    super(repo);
  }
}
