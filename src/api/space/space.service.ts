import { Injectable } from '@nestjs/common';
import { Space } from '../../entities/store_space.entity';
import { SpaceOption } from '../../entities/store_space_option.entity';
import { SpaceSchedule } from '../../entities/store_space_schedule.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class SpaceService {
  constructor(
    @InjectRepository(Space)
    private readonly spaceRepository: Repository<Space>,
    @InjectRepository(SpaceOption)
    private readonly optionRepository: Repository<SpaceOption>,
    @InjectRepository(SpaceSchedule)
    private readonly scheduleRepository: Repository<SpaceSchedule>,
  ) {}

  // 특정 공간 모든 정보 조회
  async findOneSpace(sp_id: number, option_status?: number) {
    const data: any = { option: {}, schedule: {} };
    data.info = await this.spaceRepository.findOneBy({ sp_id });

    // -- 공간 옵션 조회
    const option_where: any = { sp_id };
    // option_status가 정의된 경우만 필터링
    if (option_status === 0 || option_status === 1) {
      option_where.option_status = option_status;
    }
    const [option_data, option_total] = await this.optionRepository.findAndCount({
      where: option_where,
      order: { option_name: 'ASC' },
    });

    // -- 공간 스케줄 조회
    const schedule_data = await this.scheduleRepository.find({ where: { sp_id } });

    data.option.list = option_data;
    data.option.total = option_total;
    data.schedule.list = schedule_data;
    return { success: true, data };
  }
}
