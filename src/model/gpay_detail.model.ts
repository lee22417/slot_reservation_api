import { ObjectType, Field, Int } from '@nestjs/graphql';

@ObjectType({ description: '결제 상세 정보' })
export class PayDetailModel {
  @Field(() => Int, { description: 'pay_detail pk' })
  pde_id: number;

  @Field({ description: '결제 고유 번호' })
  payment_id: string;

  @Field({ description: '구매 아이템 이름' })
  item_name: string;

  @Field(() => Int, { description: '구매 아이템 총 가격 (수량 고려)' })
  item_total_price: number;

  @Field(() => Int, { description: '구매 아이템 수량 (인원,슬롯 수 고려)' })
  item_quantity: number;

  @Field({ description: 'item 연관 테이블' })
  item_rel_table: string;
}
