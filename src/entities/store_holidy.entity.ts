import { Expose } from 'class-transformer';
import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';
import { formatDate } from '../common/utils/date.util';

@Entity()
export class StoreHoliday {
  @PrimaryGeneratedColumn()
  sho_id: number;

  @Column({
    nullable: false,
    comment: 'store pk',
  })
  st_id: number;

  @Column({ nullable: false, comment: '휴일 일자' })
  holiday_date: Date;

  @Column({ nullable: false, length: 255, comment: '휴일 설명' })
  holiday_description: string;

  @Column({ default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;

  // DB에 없는 계산 필드
  @Expose()
  get holiday_date_str(): string {
    return formatDate(this.holiday_date);
  }
}
