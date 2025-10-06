import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { StoreNotice } from '../../../entities/store_notice.entity';
import { Store } from '../../../entities/store.entity';
import { Repository } from 'typeorm';

@Injectable()
export class GstoreService {
  constructor(
    @InjectRepository(Store)
    private readonly storeRepository: Repository<Store>,
    @InjectRepository(StoreNotice)
    private readonly noticeRepository: Repository<StoreNotice>,
  ) {}

  async findAll() {
    const [data, total] = await this.storeRepository.findAndCount({
      select: ['st_id', 'store_status', 'store_name'],
      order: { store_name: 'ASC' }, // 이름 정렬
    });
    return data;
  }

  findOne(st_id: number) {
    return this.storeRepository.findOneBy({ st_id: st_id });
  }

  findAllNotice(st_id: number) {
    return this.noticeRepository.find({
      where: { st_id },
    });
  }
}
