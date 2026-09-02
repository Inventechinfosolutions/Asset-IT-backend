import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import { User } from '../../users/entities/user.entity';

export enum RequestType {
  ASSET = 'ASSET',
  IT_SUPPORT = 'IT_SUPPORT',
}

export enum RequestStatus {
  SUBMITTED = 'SUBMITTED',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  IN_PROGRESS = 'IN_PROGRESS',
  RESOLVED = 'RESOLVED',
  CLOSED = 'CLOSED',
  FULFILLED = 'FULFILLED',
}

@Entity('support_requests')
export class SupportRequest {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 36 })
  userId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column({ type: 'enum', enum: RequestType })
  requestType: RequestType;

  @Column({
    type: 'enum',
    enum: RequestStatus,
    default: RequestStatus.SUBMITTED,
  })
  status: RequestStatus;

  @Column({ type: 'varchar', length: 200 })
  title: string;

  @Column({ type: 'varchar', length: 500 })
  location: string;

  @Column({ type: 'text' })
  description: string;

  @Column({ type: 'json', nullable: true })
  selectedAssets: string[] | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
