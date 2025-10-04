import { Injectable } from '@nestjs/common';
import { Store } from '../../entities/store.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Like, Repository } from 'typeorm';
import { StoreNotice } from '../../entities/store_notice.entity';

@Injectable()
export class StoreService {
  constructor(
    @InjectRepository(Store)
    private readonly storeRepository: Repository<Store>,
    @InjectRepository(StoreNotice)
    private readonly noticeRepository: Repository<StoreNotice>,
  ) { }

  // 모든 지점 조회
  async findAll(
    page: number = 1,
    limit: number = 10,
    store_status?: number,
    store_name?: string,
  ) {
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

  // 특정 지점 정보 조회
  async findOne(st_id: number) {
    const data = await this.storeRepository.findOneBy({ st_id: st_id });
    return { success: true, data };
  }

  // 특정 지점 공지사항 조회
  async findAllNotice(st_id: number, notice_is_show?: number) {
    const where: any = { st_id };

    // notice_is_show가 정의된 경우만 필터링
    if (notice_is_show === 0 || notice_is_show === 1) {
      where.notice_is_show = notice_is_show;
    }

    const [data, total] = await this.noticeRepository.findAndCount({
      where,
      order: { created_at: 'DESC' }, // 최신 공지사항
    });

    return { success: true, data, total };
  }
}
