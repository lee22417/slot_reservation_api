import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { StoreNotice } from '../../../entities/store_notice.entity';
import { Store } from '../../../entities/store.entity';
import { StoreHoliday } from '../../../entities/store_holiday.entity';

@Injectable()
export class GstoreService {
  constructor(
    @InjectRepository(Store)
    private readonly storeRepository: Repository<Store>,
    @InjectRepository(StoreNotice)
    private readonly noticeRepository: Repository<StoreNotice>,
    @InjectRepository(StoreHoliday)
    private readonly holidayRepository: Repository<StoreHoliday>,
  ) {}

  findOne(st_id: number) {
    return this.storeRepository.findOneBy({ st_id: st_id });
  }

  findAllNotice(st_id: number) {
    return this.noticeRepository.find({
      where: { st_id },
      order: { created_at: 'ASC' },
    });
  }

  findAllHoliday(st_id: number) {
    return this.holidayRepository.find({
      where: { st_id },
      order: { holiday_date: 'ASC' },
    });
  }
}
