import { Column, Entity, Index } from 'typeorm';
import { BaseEntity } from '../../base/base.entity';
import { Collections } from '../../common/constants';

@Entity({ name: Collections.RECOVERY_TOKENS })
@Index(`index_${Collections.RECOVERY_TOKENS}_on_userId`, ['userId'])
export class RecoveryToken extends BaseEntity {
  @Column({ type: 'uuid' })
  userId!: string;

  @Column()
  token!: string;

  @Column({ type: 'timestamptz' })
  expiresAt!: Date;
}
