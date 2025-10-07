import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { PayMethod, PayStatus } from '../common/constants/enum.constants';

@Entity({ name: 'pay' })
export class Pay {
  @PrimaryGeneratedColumn({ type: 'int', unsigned: true })
  pa_id: number;

  @Column({ unique: true, type: 'varchar', length: 100, comment: '결제 고유 번호' })
  payment_id: string;

  @Column({ nullable: true, type: 'int', comment: 'user pk (비회원 null)' })
  us_id?: number;

  @Column({ nullable: true, type: 'int', comment: 'coupon pk' })
  co_id?: number;

  @Column({ nullable: true, type: 'int', comment: 'user_point pk' })
  po_id?: number;

  @Column({ nullable: false, type: 'int', comment: '총 가격' })
  pay_total_price: number;

  @Column({ nullable: false, type: 'enum', enum: PayStatus, comment: '결제 상태 (결제 대기, 완료, 취소)' })
  pay_status: PayStatus;

  @Column({ nullable: false, type: 'enum', enum: PayMethod, comment: '결제 수단' })
  pay_method: PayMethod;

  @CreateDateColumn({ type: 'datetime', comment: '생성일' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamp', comment: '수정일', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
  updated_at: Date;
}
