import { ObjectType, Field, Int } from '@nestjs/graphql';

@ObjectType({ description: '상점 정보' })
export class StoreModel {
  @Field(() => Int)
  st_id: number;

  @Field(() => Int, { description: '상점 운영 여부 (0:미운영,1:운영)' })
  store_status: number;

  @Field(() => String, { description: '상점 이름' })
  store_name: string;

  @Field(() => String, { description: '상점 연락처' })
  store_number: string;

  @Field(() => Date, { description: '생성 일자' })
  created_at: Date;

  @Field(() => Date, { description: '수정 일자' })
  updated_at: Date;
}
