import { Column, Entity, Index } from 'typeorm';
import { Collections, State } from '../../common/constants';
import { BaseEntity } from '../../base/base.entity';

const { WALLETS } = Collections;

enum WalletType {
  DEPOSIT = 1,
  HOT = 2,
  COLD = 3,
}

@Index(`index_${WALLETS}_on_type_and_currencyId_and_state`, [
  'type',
  'currencyId',
  'state',
])
@Entity({ name: WALLETS })
export class Market extends BaseEntity {
  @Column()
  name!: string;

  @Column('uuid')
  blockchainId!: string;

  @Index(`index_${WALLETS}_on_currencyId`)
  @Column('uuid')
  currencyId!: string;

  @Column()
  address!: string;

  @Column('decimal', { precision: 32, scale: 16, default: 0.0 })
  maxBalance!: number;

  @Index(`index_${WALLETS}_on_state`)
  @Column({ type: 'smallint', default: State.ACTIVE })
  state!: State;

  @Index(`index_${WALLETS}_on_type`)
  @Column({ default: WalletType.DEPOSIT })
  type!: WalletType;
}
