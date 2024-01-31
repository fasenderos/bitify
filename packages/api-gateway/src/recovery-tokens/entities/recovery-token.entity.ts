import { Column, Entity, Index } from 'typeorm';
import { BaseEntity } from '../../base/base.entity';
import { Collections } from '../../common/constants';

const { RECOVERY_TOKENS } = Collections;

@Entity({ name: RECOVERY_TOKENS })
export class RecoveryToken extends BaseEntity {
  @Index(`index_${RECOVERY_TOKENS}_on_userId`)
  @Column({ type: 'uuid' })
  userId!: string;

  @Column()
  token!: string;

  @Column({ type: 'timestamptz' })
  expiresAt!: Date;
}
