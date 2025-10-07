import { Field, Int, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class StorePaySettingModel {
  @Field(() => Int)
  sps_id: number;

  @Field(() => Int)
  st_id: number;

  @Field(() => Int)
  is_cash_enabled: number;

  @Field(() => Int)
  is_card_enabled: number;

  @Field(() => Int)
  point_earn_rate: number;
}
