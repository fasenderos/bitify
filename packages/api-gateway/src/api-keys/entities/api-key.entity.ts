import { Column, Entity } from 'typeorm';
import { BaseEntity } from '../../base/base.entity';
import { Collections } from '../../common/constants';
import { ApiKeyAbility } from '../../app.roles';

// Currently only HMAC, in the future we may also support RSA
export enum ApiKeyType {
  HMAC = 'HMAC',
}

@Entity({ name: Collections.API_KEYS })
export class ApiKey extends BaseEntity {
  @Column({ unique: true })
  public!: string;

  @Column({ select: false })
  secret!: string;

  @Column()
  notes!: string;

  @Column({ type: 'enum', enum: ApiKeyType })
  type!: ApiKeyType;

  @Column('simple-array', { nullable: true })
  userIps!: string[] | null;

  @Column({ type: 'enum', enum: ApiKeyAbility, nullable: true })
  spot!: ApiKeyAbility | null;

  @Column({ type: 'enum', enum: ApiKeyAbility, nullable: true })
  wallet!: ApiKeyAbility | null;

  @Column({ type: 'timestamptz' })
  expiresAt!: Date;
}
