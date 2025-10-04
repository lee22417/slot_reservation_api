import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
export class Store {
  @PrimaryGeneratedColumn()
  st_id: number;

  @Column({
    nullable: false,
    default: 0,
    comment: '상점 운영 여부 (0:미운영,1:운영)',
  })
  store_status: number;

  @Column({ nullable: false, length: 30, comment: '상점 이름' })
  store_name: string;

  @Column({ nullable: false, length: 20, comment: '상점 연락처' })
  store_number: string;

  @Column({ default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  updated_at: Date;
}
