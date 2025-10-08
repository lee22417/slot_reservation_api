import { ObjectType, Field, Int } from '@nestjs/graphql';

@ObjectType({ description: '예약 옵션 정보' })
export class ReservationOptionModel {
  @Field(() => Int, { description: 'reservation_option pk' })
  rop_id: number;

  @Field(() => Int, { description: 'reservation pk' })
  re_id: number;

  @Field(() => Int, { description: 'store_space_option pk' })
  sop_id: number;

  @Field(() => Int, { description: '수량' })
  quantity: number;
}
