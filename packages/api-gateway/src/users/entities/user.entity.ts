import { Column, Entity, Index } from 'typeorm';
import { Collections, UserState } from '../../common/constants';
import { BaseEntity } from '../../base/base.entity';
import { UserRole } from '../../app.roles';

const { USERS } = Collections;

@Entity({ name: USERS })
export class User extends BaseEntity {
  @Index(`index_${USERS}_on_email`, { unique: true })
  @Column()
  email!: string;

  @Column({ select: false })
  passwordHash!: string;

  /**
   * Level 0 is default account level
   * Level 1 will apply after email verification
   * Level 2 will apply after phone verification
   * Level 3 will apply after identity & document verification
   */
  @Column({ default: 0 })
  level!: number;

  /** active (1), pending (0), banned (-1) */
  @Column({ type: 'smallint', default: UserState.PENDING })
  state!: UserState;

  @Column('uuid', { nullable: true })
  referralId!: string | null;

  @Column({ default: false })
  otp!: boolean;

  @Column('varchar', { nullable: true, select: false })
  otpSecret!: string | null;

  @Column('varchar', { nullable: true, select: false })
  verifyCode!: string | null;

  @Column('timestamptz', { nullable: true, select: false })
  verifyExpire!: Date | null;

  // // This is not a column, it is setted on authenthication
  /**
   * superadmin = has an access to the whole system without any limits
   * admin = has nearly full access except managing permissions
   * support
   * member
   */
  @Column({ default: UserRole.MEMBER })
  roles!: string;
}
