import { ObjectType, Field, Int } from '@nestjs/graphql';

@ObjectType({ description: '예약한 비회원 정보' })
export class ReservationGuestModel {
  @Field(() => Int, { description: 'reservation_guest pk' })
  gu_id: number;

  @Field({ description: '결제 고유 번호' })
  payment_id: string;

  @Field({ description: '비회원 이름' })
  guest_name: string;

  @Field({ description: '비회원 연락처' })
  guest_phone: string;
}
