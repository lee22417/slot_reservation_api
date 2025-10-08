import { Entity, PrimaryGeneratedColumn, Column, UpdateDateColumn } from 'typeorm';

@Entity('store_space_option')
export class SpaceOption {
  @PrimaryGeneratedColumn()
  sop_id: number;

  @Column({ nullable: false, comment: 'store_space pk' })
  sp_id: number;

  @Column({ nullable: false, type: 'tinyint', default: 0, comment: '공간 옵션 사용 여부 (0:미사용,1:사용)' })
  option_status: number;

  @Column({ nullable: false, length: 30, comment: '옵션 이름' })
  option_name: string;

  @Column({ nullable: false, default: 0, comment: '옵션 가격' })
  option_price: number;

  @Column({ nullable: true, type: 'text', comment: '옵션 설명' })
  option_description: string;

  @Column({ default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
  updated_at: Date;
}
