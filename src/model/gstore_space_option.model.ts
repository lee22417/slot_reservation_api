import { ObjectType, Field, Int, Float } from '@nestjs/graphql';

@ObjectType({ description: '공간 옵션 정보' })
export class SpaceOptionModel {
  @Field(() => Int, { description: '공간 옵션 ID (PK)' })
  sop_id: number;

  @Field(() => Int, { description: '공간 ID (store_space PK)' })
  sp_id: number;

  @Field(() => Int, { description: '공간 옵션 사용 여부 (0:미사용,1:사용)' })
  option_status: number;

  @Field({ description: '옵션 이름' })
  option_name: string;

  @Field(() => Float, { description: '옵션 가격' })
  option_price: number;

  @Field({ nullable: true, description: '옵션 설명' })
  option_description?: string;

  @Field(() => Date, { description: '생성일' })
  created_at: Date;

  @Field(() => Date, { description: '수정일' })
  updated_at: Date;
}
