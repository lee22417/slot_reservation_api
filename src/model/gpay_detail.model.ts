import { ObjectType, Field, Int } from '@nestjs/graphql';

@ObjectType({ description: '결제 상세 정보' })
export class PayDetailModel {
  @Field(() => Int, { description: 'pay_detail pk' })
  pde_id: number;

  @Field(() => Int, { description: 'pay pk' })
  pa_id: number;

  @Field({ description: '구매 아이템 이름' })
  item_name: string;

  @Field(() => Int, { description: '구매 아이템 가격' })
  item_price: number;

  @Field(() => Int, { description: '구매 아이템 수량' })
  item_quantity: number;

  @Field(() => Int, { description: 'item 연관 테이블 pk' })
  item_table_pk: number;

  @Field({ description: 'item 연관 테이블' })
  item_table_pk_field: string;
}
