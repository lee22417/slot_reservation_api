import { ObjectType, Field, Int, Float, registerEnumType } from '@nestjs/graphql';
import { SPACE_PRICE_TYPE } from '../common/constants/enum.constants';

registerEnumType(SPACE_PRICE_TYPE, { name: 'SpacePriceType' });

@ObjectType()
export class SpaceModel {
  @Field(() => Int, { description: '공간 ID (PK)' })
  sp_id: number;

  @Field(() => Int, { description: '상점 ID (Store PK)' })
  st_id: number;

  @Field(() => Int, { description: '공간 운영 여부 (0:미운영,1:운영)' })
  space_status: number;

  @Field(() => Int, { description: '공간 표시 순서' })
  space_order: number;

  @Field({ description: '공간 이름' })
  space_name: string;

  @Field(() => Int, { description: '공간 사용 시간 (분)' })
  space_use_minute: number;

  @Field(() => Float, { description: '공간 가격' })
  space_price: number;

  @Field(() => String, { description: '요금 정책 (FIXED:단일고정요금, PER_PERSON:인원별요금)' })
  space_price_type: SPACE_PRICE_TYPE;

  @Field(() => Int, { description: '공간 최소 인원' })
  space_min_people: number;

  @Field(() => Int, { description: '공간 최대 인원' })
  space_max_people: number;

  @Field(() => Int, { description: '환불 가능 날짜 (n일전까지)' })
  space_refundable_day: number;

  @Field({ nullable: true, description: '공간 설명' })
  space_description?: string;

  @Field({ nullable: true, description: '공간 이미지 URL' })
  space_image_url?: string;

  @Field(() => Date, { description: '생성일' })
  created_at: Date;

  @Field(() => Date, { description: '수정일' })
  updated_at: Date;
}
