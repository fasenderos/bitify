import { Column, Entity, Index } from 'typeorm';
import { Collections } from '../../common/constants';
import { BaseEntity } from '../../base/base.entity';

const { DEPOSITS } = Collections;

enum DepositType {
  CARD = 1,
  WIRE = 2,
  SWIFT = 3,
  SEPA = 4,
}

@Index(
  `index_${DEPOSITS}_on_currencyId_and_txid_and_txout`,
  ['currencyId', 'txid', 'txout'],
  { unique: true },
)
@Index(`index_${DEPOSITS}_on_userId_and_txid`, ['userId', 'txid'])
@Index(`index_${DEPOSITS}_on_state_and_userId_and_currencyId`, [
  'state',
  'userId',
  'currencyId',
])
@Entity({ name: DEPOSITS })
export class Deposit extends BaseEntity {
  @Column({ type: 'uuid' })
  userId!: string;

  @Index(`index_${DEPOSITS}_on_currencyId`)
  @Column({ type: 'uuid' })
  currencyId!: string;

  @Column('decimal', { precision: 32, scale: 16 })
  amount!: number;

  @Column('decimal', { precision: 32, scale: 16 })
  fee!: number;

  @Column()
  address!: string;

  @Column()
  fromAddresses!: string;

  @Index(`index_${DEPOSITS}_on_txid`)
  @Column()
  txid!: string;

  @Column()
  txout!: number;

  @Column()
  state!: number;

  @Column()
  blockNumber!: number;

  @Index(`index_${DEPOSITS}_on_type`)
  @Column('smallint')
  type!: DepositType;

  @Column()
  tid!: string;

  @Column('varchar', { nullable: true })
  spread!: string | null;

  @Column({ type: 'timestamptz' })
  completedAt!: Date;
}
