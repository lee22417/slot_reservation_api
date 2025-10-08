import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity({ name: 'reservation_guest' })
export class ReservationGuest {
  @PrimaryGeneratedColumn({ unsigned: true })
  gu_id: number;

  @Column({ nullable: false, length: 100, comment: '결제 고유 번호' })
  payment_id: string;

  @Column({ nullable: false, type: 'varchar', length: 50, comment: '비회원 이름' })
  guest_name: string;

  @Column({ nullable: false, type: 'varchar', length: 20, comment: '비회원 연락처' })
  guest_phone: string;

  constructor(partial?: Partial<ReservationGuest>) {
    Object.assign(this, partial);
  }
}
