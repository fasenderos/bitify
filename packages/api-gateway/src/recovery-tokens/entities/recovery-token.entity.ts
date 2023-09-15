import { Column, Entity } from 'typeorm';
import { BaseEntity } from '../../base/base.entity';
import { Collections } from '../../common/constants';

@Entity({ name: Collections.RECOVERY_TOKENS })
export class RecoveryToken extends BaseEntity {
  @Column()
  token!: string;

  @Column({ type: 'timestamptz' })
  expiresAt!: Date;
}
