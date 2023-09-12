import { Column, Entity } from 'typeorm';
import { BaseEntity } from '../../base/base.entity';
import { UserRole, UserState } from '../../common/constants';

@Entity({ name: 'users' })
export class User extends BaseEntity {
  @Column({ unique: true })
  email!: string;

  @Column({ select: false })
  passwordHash!: string;

  /**
   * superadmin = 1000
   * admin = 1001
   * support = 1002
   * member = 1 (default)
   */
  @Column({ default: UserRole.MEMBER })
  role!: number;

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

  @Column({ nullable: true, select: false })
  otpSecret!: string | null;

  @Column({ nullable: true, select: false })
  verifyCode!: string | null;

  @Column({ nullable: true, select: false })
  verifyExpire!: Date | null;
}
