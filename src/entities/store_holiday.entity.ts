import { Expose } from 'class-transformer';
import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';
import { formatDate, formatDateSeoul } from '../common/utils/date.util';

@Entity('store_holiday')
export class StoreHoliday {
  @PrimaryGeneratedColumn()
  sho_id: number;

  @Column({ nullable: false, comment: 'store pk' })
  st_id: number;

  @Column({ nullable: false, comment: '휴일 일자' })
  holiday_date: Date;

  @Column({ nullable: true, length: 255, comment: '휴일 설명' })
  holiday_description: string;

  @Column({ default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;

  // DB에 없는 계산 필드
  @Expose()
  get holiday_date_kst(): string {
    return formatDateSeoul(this.holiday_date); // 'Asia/Seoul' KST로 변환
  }
}
