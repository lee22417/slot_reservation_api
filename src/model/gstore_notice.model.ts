import { ObjectType, Field, Int } from '@nestjs/graphql';

@ObjectType()
export class StoreNoticeModel {
  @Field(() => Int, { description: '공지사항 ID (PK)' })
  sno_id: number;

  @Field(() => Int, { description: '상점 ID (Store PK)' })
  st_id: number;

  @Field(() => String, { description: '공지사항 제목' })
  notice_title: string;

  @Field(() => String, { description: '공지사항 내용' })
  notice_content: string;

  @Field(() => Int, { description: '공지사항 노출 여부 (0:비노출,1:노출)' })
  notice_is_show: number;

  @Field(() => Date, { description: '공지사항 생성 일자' })
  created_at: Date;
}
