import { Column, Entity } from 'typeorm';
import { BaseEntity } from '../../base/base.entity';

@Entity({ name: 'profiles' })
export class Profile extends BaseEntity {
  @Column({ type: 'uuid' })
  userId!: string;

  @Column({ nullable: true })
  firstName!: string | null;

  @Column({ nullable: true })
  lastName!: string | null;

  @Column({ nullable: true })
  dob!: Date | null;

  @Column({ nullable: true })
  address!: string | null;

  @Column({ nullable: true })
  postcode!: string | null;

  @Column({ nullable: true })
  city!: string | null;

  @Column({ nullable: true })
  country!: string | null;

  @Column({ type: 'jsonb', nullable: true })
  metadata!: string | null;
}
