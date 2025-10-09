import { Entity, PrimaryGeneratedColumn, Column, UpdateDateColumn } from 'typeorm';
import { SPACE_PRICE_TYPE } from '../common/constants/enum.constants';

@Entity('store_space')
export class Space {
  @PrimaryGeneratedColumn()
  sp_id: number;

  @Column({ nullable: false, comment: 'store pk' })
  st_id: number;

  @Column({ nullable: false, type: 'tinyint', default: 0, comment: '공간 운영 여부 (0:미운영,1:운영)' })
  space_status: number;

  @Column({ nullable: false, default: 1, comment: '공간 표시 순서' })
  space_order: number;

  @Column({ nullable: false, length: 30, comment: '공간 이름' })
  space_name: string;

  @Column({ nullable: false, default: 0, comment: '공간 사용 시간 (분)' })
  space_use_minute: number;

  @Column({ nullable: false, comment: '공간 예약 슬롯 단위(분)' })
  space_interval_minute: number;

  @Column({ nullable: false, default: 0, comment: '공간 가격' })
  space_price: number;

  @Column({
    nullable: false,
    type: 'enum',
    enum: SPACE_PRICE_TYPE,
    default: SPACE_PRICE_TYPE.FIXED,
    comment: '요금 정책 (FIXED:단일고정요금, PER_PERSON:인원별요금)',
  })
  space_price_type: SPACE_PRICE_TYPE;

  @Column({ nullable: false, default: 1, comment: '공간 최소 인원' })
  space_min_people: number;

  @Column({ nullable: false, default: 1, comment: '공간 최대 인원' })
  space_max_people: number;

  @Column({ nullable: false, default: 1, comment: '환불 가능 날짜 (n일전까지)' })
  space_refundable_day: number;

  @Column({ nullable: true, type: 'text', comment: '공간 설명' })
  space_description: string;

  @Column({ nullable: true, length: 255, comment: '공간 이미지 url' })
  space_image_url: string;

  @Column({ default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
  updated_at: Date;
}
