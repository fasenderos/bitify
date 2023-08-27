import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity({ name: 'users' })
export class User {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ unique: true })
  email!: string;

  @Column({ select: false })
  passwordHash!: string;

  @Column({ default: 'member' })
  role!: string;

  @Column({ default: 0 })
  level!: number;

  @Column({ default: 'pending' })
  state!: string;

  @Column({ default: null, type: 'uuid' })
  referralId!: string;

  @Column({ default: false })
  otp!: boolean;

  @Column({ nullable: true, select: false })
  otpSecret?: string;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @Column({ type: 'uuid', nullable: true })
  updatedBy?: string;

  @DeleteDateColumn({ nullable: true })
  deletedAt?: Date;

  @Column({ type: 'uuid', nullable: true })
  deletedBy?: string;
}
