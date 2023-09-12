import { Column, Entity } from 'typeorm';
import { BaseEntity } from '../base/base.entity';
import { Collections } from '../common/constants';

@Entity({ name: Collections.ACTIVITIES })
export class Activity extends BaseEntity {
  @Column({ type: 'uuid' })
  userId!: string;

  @Column()
  userIP!: string;

  @Column()
  userAgent!: string;

  @Column()
  topic!: string;

  @Column()
  action!: string;

  @Column()
  result!: string;

  @Column({ type: 'text', nullable: true })
  data?: string | null;
}
