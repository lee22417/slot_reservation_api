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
  async getSlotsByDay(spId: number, targetDate: string, intervalMinute: number): Promise<{ slots: string[] }> {
    const slots: string[] = [];
    const targetDayOfWeek = new Date(targetDate).getDay(); // 요일

    // 해당 일자의 요일로 스케줄 조회
    const schedules = await this.scheduleRepository.find({
      where: { sp_id: spId, space_day_of_week: targetDayOfWeek },
    });

    // 각 스케줄별 시간 슬롯 계산
    schedules.forEach((schedule) => {
      const tempSlots: string[] = this.sliceSlots(schedule.space_open_time, schedule.space_close_time, intervalMinute);
      slots.push(...tempSlots);
    });

    return { slots };
  }

  // open_time, close_time으로 공간 슬롯 구하기
  sliceSlots = (openTime: string, closeTime: string, intervalMinute: number) => {
    const slots: string[] = [];

    // 분단위까지 사용, 초단위 사용 안함
    const [openHour, openMinute, openSecond] = openTime.split(':').map(Number);
    const [closeHour, closeMinute, closeSecond] = closeTime.split(':').map(Number);

    const startMinutes = openHour * 60 + openMinute; // 슬롯 오픈 시간 분으로 변환
    const endMinutes = closeHour * 60 + closeMinute; // 슬롯 종료 시간 분으로 변환

    // 총 슬롯수
    const count = Math.floor((endMinutes - startMinutes) / intervalMinute);

    // 슬롯 계산
    Array.from({ length: count }, (_, i) => {
      const slotTotalMinutes = startMinutes + i * intervalMinute;
      const slotHour = Math.floor(slotTotalMinutes / 60)
        .toString()
        .padStart(2, '0');
      const slotMinute = (slotTotalMinutes % 60).toString().padStart(2, '0');
      slots.push(`${slotHour}:${slotMinute}`);
    });

    return slots;
  };
}
