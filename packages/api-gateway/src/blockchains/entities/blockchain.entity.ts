import { Column, Entity, Index } from 'typeorm';
import { Collections, State } from '../../common/constants';
import { BaseEntity } from '../../base/base.entity';

const { BLOCKCHAINS } = Collections;

@Entity({ name: BLOCKCHAINS })
export class Blockchain extends BaseEntity {
  @Index(`index_${BLOCKCHAINS}_on_key`, { unique: true })
  @Column({ unique: true })
  key!: string;

  @Column()
  name!: string;

  @Column()
  client!: string;

  @Column()
  server!: string;

  @Column('bigint')
  height!: number;

  @Column()
  explorerAddress!: string;

  @Column()
  explorerTransaction!: string;

  @Column({ default: 6 })
  minConfirmation!: number;

  /** active (1), inactive (0) */
  @Index(`index_${BLOCKCHAINS}_on_state`)
  @Column({ type: 'smallint', default: State.ACTIVE })
  state!: State;
}
