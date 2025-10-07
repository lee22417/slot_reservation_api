import { Entity, PrimaryGeneratedColumn, Column, Unique } from 'typeorm';

@Entity({ name: 'store_pay_setting' })
@Unique(['st_id'])
export class StorePaySetting {
  @PrimaryGeneratedColumn({ unsigned: true })
  sps_id: number;

  @Column({ nullable: false, comment: 'store pk' })
  st_id: number;

  @Column({ nullable: false, type: 'tinyint', default: 0, comment: '현금 결제 가능 여부 (0:불가,1:가능)' })
  is_cash_enabled: number;

  @Column({ nullable: false, type: 'tinyint', default: 0, comment: '카드 결제 가능 여부 (0:불가,1:가능)' })
  is_card_enabled: number;

  @Column({ nullable: false, default: 0, comment: '구매 포인트 적립율 (%)' })
  point_earn_rate: number;

  @Column({ default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;
}
