import { Column, Entity, Index } from 'typeorm';
import { BaseEntity } from '../../base/base.entity';
import { Collections } from '../../common/constants';
const { ACCOUNTS } = Collections;

@Index(`index_${ACCOUNTS}_currencyId_and_userId`, ['currencyId', 'userId'], {
  unique: true,
})
@Entity({ name: ACCOUNTS })
export class Account extends BaseEntity {
  @Index(`index_${ACCOUNTS}_on_userId`)
  @Column({ type: 'uuid' })
  userId!: string;

  @Column({ type: 'uuid' })
  currencyId!: string;

  @Column('decimal', { precision: 32, scale: 16, default: 0.0 })
  balance!: number;

  @Column('decimal', { precision: 32, scale: 16, default: 0.0 })
  locked!: number;
}
