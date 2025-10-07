import { Injectable } from '@nestjs/common';
import { Space } from '../../entities/store_space.entity';
import { SpaceOption } from '../../entities/store_space_option.entity';
import { SpaceSchedule } from '../../entities/store_space_schedule.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Raw, Repository } from 'typeorm';
import { sliceSlots } from '../../common/utils/space.uitl';
import { Reservation } from '../../entities/reservation.entity';
import { RESERVATION_STATUS } from '../../common/constants/enum.constants';
import { Store } from '../../entities/store.entity';
import { StoreHoliday } from '../../entities/store_holiday.entity';
import { SpaceStatusService } from '../../common/service/space_status.service';
import { SpaceSlotService } from '../../common/service/space_slot.service';

@Injectable()
export class SpaceService {
  constructor(
    @InjectRepository(Store)
    private readonly storeRepository: Repository<Store>,
    @InjectRepository(StoreHoliday)
    private readonly holidayRepository: Repository<StoreHoliday>,
    @InjectRepository(Space)
    private readonly spaceRepository: Repository<Space>,
    @InjectRepository(SpaceOption)
    private readonly optionRepository: Repository<SpaceOption>,
    @InjectRepository(SpaceSchedule)
    private readonly scheduleRepository: Repository<SpaceSchedule>,
    @InjectRepository(Reservation)
    private readonly reservationRepository: Repository<Reservation>,
    private readonly spaceStatusService: SpaceStatusService,
    private readonly spaceSlotServicce: SpaceSlotService,
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
    const schedule_data = await this.scheduleRepository.find({ where: { sp_id }, order: { space_day_of_week: 'ASC' } });

    data.option.list = option_data;
    data.option.total = option_total;
    data.schedule.list = schedule_data;
    return { success: true, data };
  }

  // 특정 공간 특정 일자 시간 슬롯 조회
  async findSpaceSlots(sp_id: number, target_date: string) {
    const now = new Date();

    // 해당 일자 운영 여부 조회
    const status_result = await this.spaceStatusService.checkSpaceStatus(sp_id, target_date);
    if (!status_result || !status_result.success) {
      return status_result;
    }

    // 시간 슬롯 구하기
    const slots = await this.spaceSlotServicce.getSlotsByDay(sp_id, target_date);

    // 해당 일자 예약 조회
    const next_date = new Date(new Date(target_date));
    next_date.setDate(next_date.getDate() + 1);
    const excluded_Status = ['CANCELED'];
    const reservation: Reservation[] = await this.reservationRepository.find({
      where: {
        sp_id,
        start_datetime: Raw((alias) => `${alias} < :next_date`, { next_date }),
        end_datetime: Raw((alias) => `${alias} >= :target_date`, { target_date }),
        status: Raw((alias) => `${alias} NOT IN (:...excluded_Status)`, { excluded_Status }),
      },
    });

    // 해당 일자 시간 슬롯에 예약 여부 추가
    const slot_info = slots.map((x) => {
      const slot_start = new Date(`${target_date}T${x}:00`);
      const slot_end = new Date(slot_start);
      slot_end.setHours(slot_end.getHours() + 1); // 1시간 슬롯 기준

      // 해당 슬롯에 걸치는 예약 찾기
      const temp_reservation = reservation.find((r) => r.start_datetime < slot_end && r.end_datetime > slot_start);

      let status = temp_reservation ? temp_reservation.status : null; // 예약 상태

      // status가 OCCUPIED이면 임시 점유 (created_at) 기준 10분 이내 확인
      if (status === RESERVATION_STATUS.OCCUPIED && temp_reservation) {
        const diff_minutes = (now.getTime() - temp_reservation.created_at.getTime()) / 1000 / 60;
        if (diff_minutes > 10) {
          status = null; // 10분 초과면 미예약으로 설정
        }
      }

      // status가 PENDING이면 결제 대기 (created_at) 기준 1일 이내 확인
      if (status === RESERVATION_STATUS.PENDING && temp_reservation) {
        const diff_hours = (now.getTime() - temp_reservation.created_at.getTime()) / 1000 / 60 / 60; // 시간 단위
        if (diff_hours > 24) {
          status = null; // 1일 초과면 미예약으로 설정
        }
      }

      return { time: x, reservation: status };
    });

    return { success: true, data: slot_info };
  }
}
