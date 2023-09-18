import { Column, Entity, Index } from 'typeorm';
import { BaseEntity } from '../../base/base.entity';
import { Collections } from '../../common/constants';

@Entity({ name: Collections.PROFILES })
@Index(`index_${Collections.PROFILES}_on_userId`, ['userId'])
export class Profile extends BaseEntity {
  @Column('varchar', { nullable: true })
  firstName!: string | null;

  @Column('varchar', { nullable: true })
  lastName!: string | null;

  @Column('varchar', { nullable: true })
  dob!: Date | null;

  @Column('varchar', { nullable: true })
  address!: string | null;

  @Column('varchar', { nullable: true })
  postcode!: string | null;

  @Column('varchar', { nullable: true })
  city!: string | null;

  @Column('varchar', { nullable: true })
  country!: string | null;

  @Column('jsonb', { nullable: true })
  metadata!: string | null;
}
