import { Column, Entity, Index } from 'typeorm';
import { Collections, State } from '../../common/constants';
import { BaseEntity } from '../../base/base.entity';

const { MARKETS } = Collections;

@Index(
  `index_${MARKETS}_on_baseUnit_and_quoteUnit`,
  ['baseUnit', 'quoteUnit'],
  { unique: true },
)
@Entity({ name: MARKETS })
export class Market extends BaseEntity {
  @Index(`index_${MARKETS}_on_baseUnit`)
  @Column({ length: 10 })
  baseUnit!: string;

  @Index(`index_${MARKETS}_on_quoteUnit`)
  @Column({ length: 10 })
  quoteUnit!: string;

  @Column('smallint', { default: 4 })
  amountPrecision!: number;

  @Column('smallint', { default: 4 })
  pricePrecision!: number;

  @Column('decimal', { precision: 32, scale: 16, default: 0.0 })
  minPrice!: number;

  @Column('decimal', { precision: 32, scale: 16, default: 0.0 })
  maxPrice!: number;

  @Column('decimal', { precision: 32, scale: 16, default: 0.0 })
  minAmount!: number;

  @Index(`index_${MARKETS}_on_position`)
  @Column({ default: 0 })
  position!: number;

  @Column({ type: 'smallint', default: State.ACTIVE })
  state!: State;
}
