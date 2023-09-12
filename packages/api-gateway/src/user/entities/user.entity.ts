import { Column, Entity } from 'typeorm';
import { BaseEntity } from '../../base/base.entity';
import { Collections, UserState } from '../../common/constants';
import { UserRole } from '../../app.roles';

@Entity({ name: Collections.USERS })
export class User extends BaseEntity {
  @Column({ unique: true })
  email!: string;

  @Column({ select: false })
  passwordHash!: string;

  /**
   * superadmin = has an access to the whole system without any limits
   * admin = has nearly full access except managing permissions
   * support
   * member
   */
  @Column({ default: UserRole.MEMBER })
  role!: string;

  /**
   * Level 0 is default account level
   * Level 1 will apply after email verification
   * Level 2 will apply after phone verification
   * Level 3 will apply after identity & document verification
   */
  @Column({ default: 0 })
  level!: number;

  /** active (1), pending (0), banned (-1) */
  @Column({ default: UserState.PENDING })
  state!: number;

  @Column({ nullable: true, type: 'uuid' })
  referralId!: string;

  @Column({ default: false })
  otp!: boolean;

  @Column('varchar', { nullable: true, select: false })
  otpSecret!: string | null;

  @Column('varchar', { nullable: true, select: false })
  verifyCode!: string | null;

  @Column('timestamptz', { nullable: true, select: false })
  verifyExpire!: Date | null;
}
