import { Resolver, Query, Args, Int } from '@nestjs/graphql';
import { GstoreService } from './gstore.service';
import { StoreModel } from '../../../model/gstore.model';
import { StoreNoticeModel } from '../../../model/gstore_notice.model';

@Resolver(() => StoreModel)
export class GstoreResolver {
  constructor(private readonly gstoreService: GstoreService) { }

  // 모든 지점 조회
  @Query(() => [StoreModel], {
    name: 'stores',
    nullable: true,
    description: '모든 조회',
  })
  async findAll() {
    return await this.gstoreService.findAll();
  }

  // 특정 지점 조회
  @Query(() => StoreModel, {
    name: 'store',
    nullable: true,
    description: 'ID를 기준으로 특정 지점 조회',
  })
  findOne(@Args('id', { type: () => Int }) st_id: number) {
    return this.gstoreService.findOne(st_id);
  }

  // // 특정 지점 공지사항 조회
  @Query(() => [StoreNoticeModel], {
    description: 'ID를 기준으로 특정 지점의 모든 공지사항 조회',
  })
  findAllNotice(@Args('id', { type: () => Int }) st_id: number) {
    return this.gstoreService.findAllNotice(st_id);
  }
}
