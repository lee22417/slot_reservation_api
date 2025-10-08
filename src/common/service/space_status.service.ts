import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Store } from '../../entities/store.entity';
import { Space } from '../../entities/store_space.entity';
import { StoreHoliday } from '../../entities/store_holiday.entity';

export interface CheckSpaceStatusResult {
  success: boolean;
  msg?: string;
  space?: Space;
}

@Injectable()
export class SpaceStatusService {
  constructor(
    @InjectRepository(Space)
    private readonly spaceRepository: Repository<Space>,
    @InjectRepository(Store)
    private readonly storeRepository: Repository<Store>,
    @InjectRepository(StoreHoliday)
    private readonly holidayRepository: Repository<StoreHoliday>,
  ) {}

  // 특정 공간 특정 일자 운영 여부 조회
  async checkSpaceStatus(spId: number, targetDates: string[]): Promise<CheckSpaceStatusResult> {
    // 공간 조회
    const space = await this.spaceRepository.findOneBy({ sp_id: spId });
    if (!space?.space_status) {
      return { success: false, msg: '해당 공간 미운영' };
    }

    // 상점 조회
    const store = await this.storeRepository.findOneBy({ st_id: space.st_id });
    if (!store?.store_status) {
      return { success: false, msg: '해당 상점 미운영' };
    }

    // 휴일 조회
    const holiday = await this.holidayRepository.find({ where: { st_id: space.st_id, holiday_date: In(targetDates) } });
    if (holiday?.length > 0) {
      return { success: false, msg: '해당 일자 미운영' };
    }

    return { success: true, space };
  }
}
