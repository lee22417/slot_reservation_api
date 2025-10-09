import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity({ name: 'pay_detail' })
export class PayDetail {
  @PrimaryGeneratedColumn({ unsigned: true })
  pde_id: number;

  @Column({ unique: true, type: 'varchar', length: 100, comment: '결제 고유 번호' })
  payment_id: string;

  @Column({ nullable: false, type: 'varchar', length: 30, comment: '구매 아이템 이름' })
  item_name: string;

  @Column({ nullable: false, type: 'int', comment: '구매 아이템 총 가격 (수량,인원,시간 슬롯 모두 고려)' })
  item_total_price: number;

  @Column({ nullable: false, type: 'int', default: 1, comment: '구매 아이템 수량' })
  item_quantity: number;

  @Column({ nullable: false, type: 'varchar', length: 50, comment: 'item 연관 테이블' })
  item_rel_table: string;

  constructor(partial?: Partial<PayDetail>) {
    Object.assign(this, partial);
  }
}
