import { Entity, PrimaryGeneratedColumn, Column, UpdateDateColumn } from 'typeorm';

@Entity('store_space_schedule')
export class SpaceSchedule {
  @PrimaryGeneratedColumn()
  ssc_id: number;

  @Column({ nullable: false, comment: 'store_space pk' })
  sp_id: number;

  @Column({ nullable: false, comment: '요일 (0:일요일 ~ 6:토요일)' })
  space_day_of_week: number;

  @Column({ nullable: false, comment: '운영 시작 시간 (HH:mm)' })
  space_open_time: string;

  @Column({ nullable: false, comment: '운영 종료 시간 (HH:mm) (24:00 이면 익일 자정)' })
  space_close_time: string;

  @Column({ default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
  updated_at: Date;
}
