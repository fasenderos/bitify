import { Column, Entity } from 'typeorm';
import { BaseEntity } from '../../base/base.entity';

@Entity({ name: 'profiles' })
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

  @Column({ type: 'jsonb', nullable: true })
  metadata!: string | null;
}
