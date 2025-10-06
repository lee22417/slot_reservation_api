import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Space } from '../../../entities/store_space.entity';
import { SpaceOption } from '../../../entities/store_space_option.entity';
import { SpaceSchedule } from '../../../entities/store_space_schedule.entity';

@Injectable()
export class GspaceService {
  constructor(
    @InjectRepository(Space)
    private readonly spaceRepository: Repository<Space>,
    @InjectRepository(SpaceOption)
    private readonly optionRepository: Repository<SpaceOption>,
    @InjectRepository(SpaceSchedule)
    private readonly scheduleRepository: Repository<SpaceSchedule>,
  ) {}

  async findALLSpace(st_id: number) {
    const data = await this.spaceRepository.find({
      where: { st_id },
      order: { space_order: 'ASC', space_name: 'ASC' },
    });
    return data;
  }

  async findALLSpaceOptions(sp_id: number) {
    const data = await this.optionRepository.find({
      where: { sp_id },
      order: { option_name: 'ASC' },
    });
    return data;
  }

  async findALLSpaceSchedules(sp_id: number) {
    const data = await this.scheduleRepository.find({
      where: { sp_id },
      order: { space_day_of_week: 'ASC' },
    });
    return data;
  }
}
