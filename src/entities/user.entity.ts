import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, Index } from 'typeorm';

@Entity('user')
export class User {
  @PrimaryGeneratedColumn({ unsigned: true })
  us_id: number;

  @Column({ nullable: false, type: 'varchar', length: 20, comment: '회원 id' })
  user_id: string;

  @Column({ nullable: false, type: 'varchar', length: 200, comment: '회원 비밀번호' })
  user_pw: string;

  @Column({ nullable: false, type: 'varchar', length: 50, comment: '회원 이름' })
  user_name: string;

  @Column({ nullable: false, type: 'varchar', length: 11, comment: '회원 연락처' })
  user_phone: string;

  @CreateDateColumn({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;
}
