import { ObjectType, Field, Int } from '@nestjs/graphql';

@ObjectType()
export class UserModel {
  @Field(() => Int)
  us_id: number;

  @Field({ description: '회원 id' })
  user_id: string;

  // 비밀번호
  // @Field()
  // user_pw: string;

  @Field({ description: '회원 이름' })
  user_name: string;

  @Field({ description: '회원 연락처' })
  user_phone: string;

  @Field()
  created_at: Date;
}
