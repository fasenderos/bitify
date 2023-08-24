import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Session {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid' })
  userId!: string;

  @Column()
  userIp!: string;

  @Column()
  token!: string;

  @Column({ type: 'timestamp' })
  expires!: Date;
}
