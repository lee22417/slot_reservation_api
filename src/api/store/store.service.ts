import { Injectable } from '@nestjs/common';
import { Store } from '../../entities/store.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Like, Repository } from 'typeorm';
import { StoreNotice } from '../../entities/store_notice.entity';
import { StoreHoliday } from '../../entities/store_holiday.entity';
import { formatDate } from '../../common/utils/date.util';
import { Space } from '../../entities/store_space.entity';

@Injectable()
export class StoreService {
  constructor(
    @InjectRepository(Store)
    private readonly storeRepository: Repository<Store>,
    @InjectRepository(StoreNotice)
    private readonly noticeRepository: Repository<StoreNotice>,
    @InjectRepository(StoreHoliday)
    private readonly holidayRepository: Repository<StoreHoliday>,
    @InjectRepository(Space)
    private readonly spaceRepository: Repository<Space>,
  ) {}

  // 모든 상점 조회
  async findAllStore(page: number = 1, limit: number = 10, store_status?: number, store_name?: string) {
    const where: any = {};
    if (store_name) {
      where.store_name = Like(`%${store_name}%`);
    }
    if (store_status === 0 || store_status === 1) {
      where.store_status = store_status;
    }

    const [data, total] = await this.storeRepository.findAndCount({
      select: ['st_id', 'store_status', 'store_name'],
      where: where,
      skip: (page - 1) * limit,
      take: limit,
      order: { store_name: 'ASC' }, // 이름 정렬
    });

    return { success: true, data, total, page, limit };
  }

  // 특정 상점 모든 정보 조회
  async findOneStore(st_id: number, notice_is_show?: number) {
    const data: any = { notice: {}, holiday: {} };

    // -- 기본 정보 조회
    data.info = await this.storeRepository.findOneBy({ st_id: st_id });

    // -- 공지사항 조회 (최근 생성 순으로 최대 10개 조회)
    const notice_where: any = { st_id };
    // notice_is_show가 정의된 경우만 필터링
    if (notice_is_show === 0 || notice_is_show === 1) {
      notice_where.notice_is_show = notice_is_show;
    }

    const [notice_data, notice_total] = await this.noticeRepository.findAndCount({
      where: notice_where,
      order: { created_at: 'DESC' },
      take: 10,
    });

    // -- 휴일 조회
    const [holiday_data, holiday_total] = await this.holidayRepository.findAndCount({
      where: { st_id: st_id },
      order: { created_at: 'ASC' },
    });

    data.notice.list = notice_data;
    data.notice.total = notice_total;
    data.holiday.list = holiday_data;
    data.holiday.total = holiday_total;
    return { success: true, data };
  }

  // 특정 상점 모든 공간 조회
  async findAllSpace(st_id: number, space_status?: number) {
    const where: any = { st_id };
    if (space_status === 0 || space_status === 1) {
      where.space_status = space_status;
    }

    const [data, total] = await this.spaceRepository.findAndCount({
      where: where,
      order: { space_order: 'ASC', space_name: 'ASC' },
    });

    return { success: true, data, total };
  }
}
