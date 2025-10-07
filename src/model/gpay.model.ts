import { ObjectType, Field, Int, registerEnumType } from '@nestjs/graphql';
import { PayMethod, PayStatus } from '../common/constants/enum.constants';

// GraphQL에서 enum 등록
registerEnumType(PayStatus, { name: 'PayStatus' });
registerEnumType(PayMethod, { name: 'PayMethod' });

@ObjectType({ description: '결제 정보' })
export class PayModel {
  @Field(() => Int)
  pa_id: number;

  @Field({ description: '결제 고유 번호' })
  payment_id: string;

  @Field(() => Int, { nullable: true, description: '사용자 PK (비회원일 경우 null)' })
  us_id?: number;

  @Field(() => Int, { nullable: true, description: '쿠폰 PK' })
  co_id?: number;

  @Field(() => Int, { nullable: true, description: '유저 포인트 PK' })
  po_id?: number;

  @Field(() => Int, { description: '총 결제 금액' })
  pay_total_price: number;

  @Field(() => PayStatus, { description: '결제 상태 (결제 대기, 완료, 취소)' })
  pay_status: PayStatus;

  @Field(() => PayMethod, { description: '결제 수단 (CARD, CASH, FREE)' })
  pay_method: PayMethod;

  @Field({ description: '생성일' })
  created_at: Date;

  @Field({ description: '수정일' })
  updated_at: Date;
}
