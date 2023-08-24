import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

export abstract class BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @CreateDateColumn()
  createdAt!: Date;

  @Column({ type: 'uuid' })
  createdBy!: string;

  @UpdateDateColumn()
  updatedAt!: Date;

  @Column({ type: 'uuid' })
  updatedBy!: string;

  @DeleteDateColumn({ nullable: true })
  deletedAt?: Date;

  @Column({ type: 'uuid', nullable: true })
  deletedBy?: string;
}
