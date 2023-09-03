import { Column, Entity } from 'typeorm';
import { BaseEntity } from '../base/base.entity';

@Entity({ name: 'recovery_tokens' })
export class RecoveryToken extends BaseEntity {
  @Column({ type: 'uuid' })
  userId!: string;

  @Column()
  token!: string;

  @Column({ type: 'timestamp with time zone' })
  expiresAt!: Date;
}
