import { Injectable } from '@nestjs/common';
import { Space } from '../../entities/store_space.entity';
import { SpaceOption } from '../../entities/store_space_option.entity';
import { SpaceSchedule } from '../../entities/store_space_schedule.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, Raw, Repository } from 'typeorm';
import { Reservation } from '../../entities/reservation.entity';
import { RESERVATION_STATUS } from '../../common/constants/enum.constants';
import { SpaceStatusService } from '../../common/service/space_status.service';
import { SpaceSlotService } from '../../common/service/space_slot.service';
import { checkValidReservationStatus } from '../../common/utils/reservation.util';

@Injectable()
export class SpaceService {
  constructor(
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
  async findOneSpace(spId: number, optionStatus?: number) {
    const data: { info: Space | null; option; schedule } = { info: null, option: {}, schedule: {} };
    data.info = await this.spaceRepository.findOneBy({ sp_id: spId });

    // 공간 옵션 조회
    const optionWhere: FindOptionsWhere<SpaceOption> = { sp_id: spId };
    // option_status가 정의된 경우만 필터링
    if (optionStatus === 0 || optionStatus === 1) {
      optionWhere.option_status = optionStatus;
    }
    const [optionData, optionTotal] = await this.optionRepository.findAndCount({
      where: optionWhere,
      order: { option_name: 'ASC' },
    });

    // 공간 스케줄 조회
    const schedule = await this.scheduleRepository.find({ where: { sp_id: spId }, order: { space_day_of_week: 'ASC' } });

    data.option.list = optionData;
    data.option.total = optionTotal;
    data.schedule.list = schedule;
    return { success: true, data };
  }

  // 특정 공간 특정 일자 시간 슬롯 조회
  async findSpaceSlots(spId: number, targetDate: string) {
    // 해당 일자 운영 여부 조회
    const statusResult = await this.spaceStatusService.checkSpaceStatus(spId, [targetDate]);
    if (!statusResult || !statusResult.success) {
      return statusResult;
    }
    // 공간 조회
    const space = statusResult.space;
    if (!space) {
      return { success: false, msg: '공간 조회 실패' };
    }

    // 시간 슬롯 구하기
    const slotsInfo = await this.spaceSlotServicce.getSlotsByDay(spId, targetDate, space.space_interval_minute);

    // 해당 일자 예약 조회
    const nextDate = new Date(new Date(targetDate));
    nextDate.setDate(nextDate.getDate() + 1);
    const excludedStatus = [RESERVATION_STATUS.CANCELED];
    const reservation: Reservation[] = await this.reservationRepository.find({
      where: {
        sp_id: spId,
        start_datetime: Raw((alias) => `${alias} < :nextDate`, { nextDate }),
        end_datetime: Raw((alias) => `${alias} >= :targetDate`, { targetDate }),
        status: Raw((alias) => `${alias} NOT IN (:...excludedStatus)`, { excludedStatus }),
      },
      order: { created_at: 'DESC' },
    });

    // 해당 일자 시간 슬롯에 예약 여부 추가
    const now: Date = new Date();
    const slots = slotsInfo.slots.map((x) => {
      const slotStart = new Date(`${targetDate}T${x}:00`);
      const slotEnd = new Date(slotStart);
      slotEnd.setMinutes(slotEnd.getMinutes() + space.space_interval_minute);

      // 해당 슬롯에 걸치는 예약들 상태 유효한지 확인
      const tempReservation = reservation
        .filter((x) => x.start_datetime < slotEnd && x.end_datetime > slotStart)
        .find((x) => checkValidReservationStatus(x, now) !== null);

      const status = tempReservation ? tempReservation.status : null;
      return { time: x, reservation: status };
    });

    return { success: true, data: slots };
  }
}
