import { Expose } from 'class-transformer';
import { Entity, PrimaryGeneratedColumn, Column, UpdateDateColumn } from 'typeorm';
import { formatDate } from '../common/utils/date.util';

@Entity('store_space_schedule')
export class SpaceSchedule {
  @PrimaryGeneratedColumn()
  ssc_id: number;

  @Column({ nullable: false, comment: 'store_space pk' })
  sp_id: number;

  @Column({ nullable: false, comment: '요일 (1:월요일 ~ 7:일요일)' })
  space_day_of_week: number;

  @Column({ nullable: false, type: 'time', comment: '운영 시작 시간' })
  space_open_time: Date;

  @Column({ nullable: false, type: 'time', comment: '운영 종료 시간 (00:00:00 이면 익일 자정)' })
  space_close_time: Date;

  @Column({ nullable: false, comment: '공간 예약 슬롯 단위(분)' })
  space_interval_minute: number;

  @Column({ default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  updated_at: Date;
}
