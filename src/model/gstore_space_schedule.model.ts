import { ObjectType, Field, Int } from '@nestjs/graphql';

@ObjectType()
export class SpaceScheduleModel {
  @Field(() => Int, { description: '공간 스케줄 ID (PK)' })
  ssc_id: number;

  @Field(() => Int, { description: '공간 ID (store_space PK)' })
  sp_id: number;

  @Field(() => Int, { description: '요일 (0:일요일 ~ 6:토요일)' })
  space_day_of_week: number;

  @Field({ description: '운영 시작 시간 (HH:MM)' })
  space_open_time: string;

  @Field({ description: '운영 종료 시간 (HH:MM, 24:00이면 익일 자정)' })
  space_close_time: string;

  @Field(() => Int, { description: '공간 예약 슬롯 단위(분)' })
  space_interval_minute: number;

  @Field(() => Date, { description: '생성일' })
  created_at: Date;

  @Field(() => Date, { description: '수정일' })
  updated_at: Date;
}
