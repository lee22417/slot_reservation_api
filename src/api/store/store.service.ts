import { Injectable } from '@nestjs/common';
import { Store } from '../../entities/store.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, Like, Repository } from 'typeorm';
import { StoreNotice } from '../../entities/store_notice.entity';
import { StoreHoliday } from '../../entities/store_holiday.entity';
import { Space } from '../../entities/store_space.entity';
import { StorePaySetting } from '../../entities/store_pay_setting.entity';

@Injectable()
export class StoreService {
  constructor(
    @InjectRepository(Store)
    private readonly storeRepository: Repository<Store>,
    @InjectRepository(StoreNotice)
    private readonly noticeRepository: Repository<StoreNotice>,
    @InjectRepository(StoreHoliday)
    private readonly holidayRepository: Repository<StoreHoliday>,
    @InjectRepository(StorePaySetting)
    private readonly paysettingRepository: Repository<StorePaySetting>,
    @InjectRepository(Space)
    private readonly spaceRepository: Repository<Space>,
  ) {}

  // 모든 상점 조회
  async findAllStore(page: number = 1, limit: number = 10, storeStatus?: number, storeName?: string) {
    const where: FindOptionsWhere<Store> = {};
    if (storeName) {
      where.store_name = Like(`%${storeName}%`);
    }
    if (storeStatus === 0 || storeStatus === 1) {
      where.store_status = storeStatus;
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
  async findOneStore(stId: number, noticeIsShow?: number) {
    const data: { info: Store | null; notice; holiday } = { info: null, notice: {}, holiday: {} };

    // -- 기본 정보 조회
    data.info = await this.storeRepository.findOneBy({ st_id: stId });

    // -- 공지사항 조회 (최근 생성 순으로 최대 10개 조회)
    const noticeWhere: FindOptionsWhere<StoreNotice> = { st_id: stId };
    // notice_is_show가 정의된 경우만 필터링
    if (noticeIsShow === 0 || noticeIsShow === 1) {
      noticeWhere.notice_is_show = noticeIsShow;
    }

    const [noticeData, noticeTotal] = await this.noticeRepository.findAndCount({
      where: noticeWhere,
      order: { created_at: 'DESC' },
      take: 10,
    });

    // -- 휴일 조회
    const [holidayData, holidayTotal] = await this.holidayRepository.findAndCount({
      where: { st_id: stId },
      order: { created_at: 'ASC' },
    });

    data.notice.list = noticeData;
    data.notice.total = noticeTotal;
    data.holiday.list = holidayData;
    data.holiday.total = holidayTotal;
    return { success: true, data };
  }

  // 특정 상점 모든 공간 조회
  async findAllSpace(stId: number, spaceStatus?: number) {
    const where: FindOptionsWhere<Space> = { st_id: stId };
    if (spaceStatus === 0 || spaceStatus === 1) {
      where.space_status = spaceStatus;
    }

    const [data, total] = await this.spaceRepository.findAndCount({
      where: where,
      order: { space_order: 'ASC', space_name: 'ASC' },
    });

    return { success: true, data, total };
  }

  // 특정 삼정 결제 정보 조회
  async findOnePaySetting(stId: number) {
    const data = await this.paysettingRepository.findOneBy({ st_id: stId });
    return { success: true, data };
  }
}
