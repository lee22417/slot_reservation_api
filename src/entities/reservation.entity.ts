import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';
import { RESERVATION_STATUS } from '../common/constants/enum.constants';

@Entity('reservation')
export class Reservation {
  @PrimaryGeneratedColumn({ unsigned: true })
  re_id: number;

  @Column({ nullable: false, length: 100, comment: '결제 고유 번호' })
  payment_id: string;

  @Column({ nullable: false, type: 'int', comment: 'store_space pk' })
  sp_id: number;

  @Column({
    nullable: false,
    type: 'enum',
    enum: RESERVATION_STATUS,
    comment: '상태 (임시 점유(예약중), 결제 대기, 완료, 취소)',
  })
  status: RESERVATION_STATUS;

  @Column({ nullable: false, type: 'datetime', comment: '예약 시작 일시' })
  start_datetime: Date;

  @Column({ nullable: false, type: 'datetime', comment: '예약 종료 일시' })
  end_datetime: Date;

  @Column({ nullable: false, type: 'int', comment: '총 결제 인원' })
  total_people: number;

  @CreateDateColumn({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
  updated_at: Date;

  constructor(partial?: Partial<Reservation>) {
    Object.assign(this, partial);
  }
}
