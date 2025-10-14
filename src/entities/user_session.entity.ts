// src/entities/user-session.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('user_session')
export class UserSession {
  @PrimaryGeneratedColumn({ name: 'se_id', unsigned: true })
  se_id: number;

  @Column({ nullable: false, type: 'varchar', length: 255, comment: 'jwt token' })
  token: string;

  @Column({ nullable: false, type: 'datetime', name: 'expired_at', comment: 'token 만료 시간' })
  expired_at: Date;

  @CreateDateColumn({ name: 'created_at' })
  created_at: Date;
}
