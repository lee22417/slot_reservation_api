import { ObjectType, Field, Int } from '@nestjs/graphql';

@ObjectType({ description: '상점 휴일' })
export class StoreHolidayModel {
  @Field(() => Int, { description: '휴일 ID (PK)' })
  sho_id: number;

  @Field(() => Int, { description: '상점 ID (Store PK)' })
  st_id: number;

  @Field(() => Date, { description: '휴일 일자' })
  holiday_date: Date;

  @Field(() => String, { description: '휴일 설명' })
  holiday_description: string;

  @Field(() => Date, { description: '공지사항 생성 일자' })
  created_at: Date;
}
