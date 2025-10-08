import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity({ name: 'reservation_option' })
export class ReservationOption {
  @PrimaryGeneratedColumn({ unsigned: true })
  rop_id: number;

  @Column({ unique: true, type: 'varchar', length: 100, comment: '결제 고유 번호' })
  payment_id: string;

  @Column({ nullable: false, type: 'int', comment: 'store_space_option pk' })
  sop_id: number;

  @Column({ nullable: false, type: 'int', comment: '옵션 수량' })
  quantity: number;

  constructor(partial?: Partial<ReservationOption>) {
    Object.assign(this, partial);
  }
}
