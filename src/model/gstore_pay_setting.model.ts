import { Field, Int, ObjectType } from '@nestjs/graphql';

@ObjectType({ description: '상점 결제 설정 정보' })
export class StorePaySettingModel {
  @Field(() => Int)
  sps_id: number;

  @Field(() => Int)
  st_id: number;

  @Field(() => Int, { description: '현금 결제 가능 여부 (0:불가,1:가능)' })
  is_cash_enabled: number;

  @Field(() => Int, { description: '카드 결제 가능 여부 (0:불가,1:가능)' })
  is_card_enabled: number;

  @Field(() => Int, { description: '구매 포인트 적립율 (%)' })
  point_earn_rate: number;

  @Field({ nullable: true, description: '상점 계좌 은행명' })
  bank_name: string;

  @Field({ nullable: true, description: '상점 계좌 번호' })
  bank_account: string;

  @Field(() => Date, { description: '생성 일시' })
  created_at: Date;
}
