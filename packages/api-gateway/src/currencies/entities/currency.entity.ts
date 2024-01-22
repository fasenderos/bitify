import { Column, Entity, Index } from 'typeorm';
import { Collections, State } from '../../common/constants';
import { BaseEntity } from '../../base/base.entity';

const { CURRENCIES } = Collections;

enum CurrencyType {
  FIAT = 'fiat',
  COIN = 'coin',
}

@Entity({ name: CURRENCIES })
export class Currency extends BaseEntity {
  @Column()
  name!: string;

  @Column('uuid')
  blockchainId!: string;

  @Column({ type: 'varchar', default: CurrencyType.COIN })
  type!: CurrencyType;

  @Column('decimal', { precision: 32, scale: 16, default: 0.0 })
  depositFee!: number;

  @Column('decimal', { precision: 32, scale: 16, default: 0.0 })
  minDepositAmount!: number;

  @Column('decimal', { precision: 32, scale: 16, default: 0.0 })
  minCollectionAmount!: number;

  @Column('decimal', { precision: 32, scale: 16, default: 0.0 })
  withdrawFee!: number;

  @Column('decimal', { precision: 32, scale: 16, default: 0.0 })
  minWithdrawAmount!: number;

  @Column('decimal', { precision: 32, scale: 16, default: 0.0 })
  withdrawLimit24h!: number;

  @Column('decimal', { precision: 32, scale: 16, default: 0.0 })
  withdrawLimit72h!: number;

  @Index(`index_${CURRENCIES}_on_position`)
  @Column({ default: 0 })
  position!: number;

  @Index(`index_${CURRENCIES}_on_state`)
  @Column({ type: 'smallint', default: State.ACTIVE })
  state!: State;

  @Column({ type: 'smallint', default: State.ACTIVE })
  depositState!: State;

  @Column({ type: 'smallint', default: State.ACTIVE })
  withdrawState!: State;

  @Column('bigint', { default: 1 })
  baseFactor!: number;

  @Column('smallint', { default: 8 })
  precision!: number;

  @Column()
  iconUrl!: string;
}
