import { Column, Entity } from 'typeorm';
import { BaseEntity } from '../../base/base.entity';
import { UserStatus } from '../../common/constants';

@Entity({ name: 'users' })
export class User extends BaseEntity {
  @Column({ unique: true })
  email!: string;

  @Column({ select: false })
  passwordHash!: string;

  @Column({ default: 'member' })
  role!: string;

  /**
   * Level 0 is default account level
   * Level 1 will apply after email verification
   * Level 2 will apply after phone verification
   * Level 3 will apply after identity & document verification
   */
  @Column({ default: 0 })
  level!: number;

  /** active, pending, banned */
  @Column({ default: UserStatus.PENDING })
  state!: string;

  @Column({ nullable: true, type: 'uuid' })
  referralId!: string;

  @Column({ default: false })
  otp!: boolean;

  @Column({ nullable: true, select: false })
  otpSecret!: string | null;

  @Column('int', { array: true, nullable: true, select: false })
  otpCodes!: number[] | null;
}
