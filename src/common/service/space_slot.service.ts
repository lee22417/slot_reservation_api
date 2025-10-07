import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { SpaceSchedule } from '../../entities/store_space_schedule.entity';

@Injectable()
export class SpaceSlotService {
  constructor(
    @InjectRepository(SpaceSchedule)
    private readonly scheduleRepository: Repository<SpaceSchedule>,
  ) {}

  // 특정 공간, 특정 요일의 시간 슬롯 조회
  async getSlotsByDay(sp_id: number, target_date: string): Promise<string[]> {
    const slots: string[] = [];
    const target_day_of_week = new Date(target_date).getDay(); // 요일

    // 해당 일자의 요일로 스케줄 조회
    const schedules = await this.scheduleRepository.find({
      where: { sp_id, space_day_of_week: target_day_of_week },
    });

    // 각 스케줄별 시간 슬롯 계산
    schedules.forEach((schedule) => {
      const temp_slots: string[] = this.sliceSlots(schedule.space_open_time, schedule.space_close_time, schedule.space_interval_minute);
      slots.push(...temp_slots);
    });

    return slots;
  }

  // open_time, close_time으로 공간 슬롯 구하기
  sliceSlots = (open_time: string, close_time: string, interval_minute) => {
    const slots: string[] = [];

    // 분단위까지 사용, 초단위 사용 안함
    const [open_hour, open_minute, open_second] = open_time.split(':').map(Number);
    const [close_hour, close_minute, close_second] = close_time.split(':').map(Number);

    const start_minutes = open_hour * 60 + open_minute; // 슬롯 오픈 시간 분으로 변환
    const end_minutes = close_hour * 60 + close_minute; // 슬롯 종료 시간 분으로 변환

    // 총 슬롯수
    const count = Math.floor((end_minutes - start_minutes) / interval_minute);

    // 슬롯 계산
    Array.from({ length: count }, (_, i) => {
      const slot_total_minutes = start_minutes + i * interval_minute;
      const slot_hour = Math.floor(slot_total_minutes / 60)
        .toString()
        .padStart(2, '0');
      const slot_minute = (slot_total_minutes % 60).toString().padStart(2, '0');
      slots.push(`${slot_hour}:${slot_minute}`);
    });

    return slots;
  };
}
