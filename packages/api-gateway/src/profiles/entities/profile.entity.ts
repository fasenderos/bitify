import { Column, Entity } from 'typeorm';
import { BaseEntity } from '../../base/base.entity';

@Entity({ name: 'profiles' })
export class Profile extends BaseEntity {
  @Column({ type: 'uuid' })
  userId!: string;

  @Column({ default: null })
  firstName!: string;

  @Column({ default: null })
  lastName!: string;

  @Column({ default: null })
  dob!: Date;

  @Column({ default: null })
  address!: string;

  @Column({ default: null })
  postcode!: string;

  @Column({ default: null })
  city!: string;

  @Column({ default: null })
  country!: string;

  @Column({ type: 'jsonb', default: null })
  metadata!: string;
}
