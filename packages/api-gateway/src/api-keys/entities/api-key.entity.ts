import { Column, Entity, Index } from 'typeorm';
import { BaseEntity } from '../../base/base.entity';
import { Collections } from '../../common/constants';
import { ApiKeyAbility } from '../../app.roles';

const { APIKEYS } = Collections;

// Currently only HMAC, in the future we may also support RSA
export enum ApiKeyType {
  HMAC = 'HMAC',
}

@Entity({ name: APIKEYS })
export class ApiKey extends BaseEntity {
  @Index(`index_${APIKEYS}_on_userId`)
  @Column({ type: 'uuid' })
  userId!: string;

  @Column({ unique: true })
  public!: string;

  @Column({ select: false })
  secret!: string;

  @Column()
  notes!: string;

  @Column('varchar')
  type!: ApiKeyType;

  @Column('simple-array', { nullable: true })
  userIps!: string[] | null;

  @Column({ type: 'varchar', nullable: true })
  spot!: ApiKeyAbility | null;

  @Column({ type: 'varchar', nullable: true })
  wallet!: ApiKeyAbility | null;

  @Column({ type: 'timestamptz' })
  expiresAt!: Date;
}
