import { ObjectType, Field, Int, registerEnumType } from '@nestjs/graphql';
import { RESERVATION_STATUS } from '../common/constants/enum.constants';

registerEnumType(RESERVATION_STATUS, { name: 'ReservationStatus' });

@ObjectType({ description: '예약 정보 엔티티' })
export class ReservationModel {
  @Field(() => Int, { description: '예약 PK' })
  re_id: number;

  @Field(() => Int, { description: 'store_space PK' })
  sp_id: number;

  @Field(() => Int, { description: '결제(pay) PK' })
  pa_id: number;

  @Field(() => String, {
    description: '상태 (OCCUPIED: 임시 점유, PENDING: 대기, COMPLETED: 완료, CANCELED: 취소)',
  })
  status: RESERVATION_STATUS;

  @Field(() => Date, { description: '예약 시작 일시' })
  start_datetime: Date;

  @Field(() => Date, { description: '예약 종료 일시' })
  end_datetime: Date;

  @Field(() => Int, { description: '총 결제 인원 수' })
  total_people: number;

  @Field(() => Date, { description: '생성 일시' })
  created_at: Date;

  @Field(() => Date, { description: '수정 일시' })
  updated_at: Date;
}
