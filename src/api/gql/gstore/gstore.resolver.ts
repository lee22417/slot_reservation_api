import { Resolver, Query, Args, Int } from '@nestjs/graphql';
import { GstoreService } from './gstore.service';
import { StoreModel } from '../../../model/gstore.model';
import { StoreNoticeModel } from '../../../model/gstore_notice.model';
import { StoreHolidayModel } from '../../../model/gstore_holiday.model';

@Resolver(() => StoreModel)
export class GstoreResolver {
  constructor(private readonly gstoreService: GstoreService) {}

  // 특정 상점 조회
  @Query(() => StoreModel, { name: 'store', nullable: true, description: 'ID를 기준으로 특정 상점 조회' })
  findOne(@Args('id', { type: () => Int }) st_id: number) {
    return this.gstoreService.findOne(st_id);
  }

  // 특정 상점 공지사항 조회
  @Query(() => [StoreNoticeModel], { name: 'storenotices', description: 'ID를 기준으로 특정 상점의 모든 공지사항 조회' })
  findAllNotice(@Args('id', { type: () => Int }) st_id: number) {
    return this.gstoreService.findAllNotice(st_id);
  }

  // 특정 상점 휴일 조회
  @Query(() => [StoreHolidayModel], { name: 'storeholidays', description: 'ID를 기준으로 특정 상점의 모든 휴일 조회' })
  findAllHoliday(@Args('id', { type: () => Int }) st_id: number) {
    return this.gstoreService.findAllHoliday(st_id);
  }
}
