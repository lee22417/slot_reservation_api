import { Injectable } from '@nestjs/common';
import { Space } from '../../entities/store_space.entity';
import { SpaceOption } from '../../entities/store_space_option.entity';
import { SpaceSchedule } from '../../entities/store_space_schedule.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Raw, Repository } from 'typeorm';
import { Reservation } from '../../entities/reservation.entity';
import { RESERVATION_STATUS } from '../../common/constants/enum.constants';
import { SpaceStatusService } from '../../common/service/space_status.service';
import { SpaceSlotService } from '../../common/service/space_slot.service';

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
    const data: any = { option: {}, schedule: {} };
    data.info = await this.spaceRepository.findOneBy({ sp_id: spId });

    // -- 공간 옵션 조회
    const optionWhere: any = { sp_id: spId };
    // option_status가 정의된 경우만 필터링
    if (optionStatus === 0 || optionStatus === 1) {
      optionWhere.option_status = optionStatus;
    }
    const [optionData, optionTotal] = await this.optionRepository.findAndCount({
      where: optionWhere,
      order: { option_name: 'ASC' },
    });

    // -- 공간 스케줄 조회
    const schedule = await this.scheduleRepository.find({ where: { sp_id: spId }, order: { space_day_of_week: 'ASC' } });

    data.option.list = optionData;
    data.option.total = optionTotal;
    data.schedule.list = schedule;
    return { success: true, data };
  }

  // 특정 공간 특정 일자 시간 슬롯 조회
  async findSpaceSlots(spId: number, targetDate: string) {
    const now = new Date();

    // 해당 일자 운영 여부 조회
    const statusResult = await this.spaceStatusService.checkSpaceStatus(spId, targetDate);
    if (!statusResult || !statusResult.success) {
      return statusResult;
    }

    // 시간 슬롯 구하기
    const slots = await this.spaceSlotServicce.getSlotsByDay(spId, targetDate);

    // 해당 일자 예약 조회
    const nextDate = new Date(new Date(targetDate));
    nextDate.setDate(nextDate.getDate() + 1);
    const excludedStatus = ['CANCELED'];
    const reservation: Reservation[] = await this.reservationRepository.find({
      where: {
        sp_id: spId,
        start_datetime: Raw((alias) => `${alias} < :nextDate`, { nextDate }),
        end_datetime: Raw((alias) => `${alias} >= :targetDate`, { targetDate }),
        status: Raw((alias) => `${alias} NOT IN (:...excludedStatus)`, { excludedStatus }),
      },
    });

    // 해당 일자 시간 슬롯에 예약 여부 추가
    const slotInfo = slots.map((x) => {
      const slotStart = new Date(`${targetDate}T${x}:00`);
      const slotEnd = new Date(slotStart);
      slotEnd.setHours(slotEnd.getHours() + 1); // 1시간 슬롯 기준

      // 해당 슬롯에 걸치는 예약 찾기
      const tempReservation = reservation.find((r) => r.start_datetime < slotEnd && r.end_datetime > slotStart);

      let status = tempReservation ? tempReservation.status : null; // 예약 상태

      // status가 OCCUPIED이면 임시 점유 (created_at) 기준 10분 이내 확인
      if (status === RESERVATION_STATUS.OCCUPIED && tempReservation) {
        const diffMinutes = (now.getTime() - tempReservation.created_at.getTime()) / 1000 / 60;
        if (diffMinutes > 10) {
          status = null; // 10분 초과면 미예약으로 설정
        }
      }

      // status가 PENDING이면 결제 대기 (created_at) 기준 1일 이내 확인
      if (status === RESERVATION_STATUS.PENDING && tempReservation) {
        const diffHours = (now.getTime() - tempReservation.created_at.getTime()) / 1000 / 60 / 60; // 시간 단위
        if (diffHours > 24) {
          status = null; // 1일 초과면 미예약으로 설정
        }
      }

      return { time: x, reservation: status };
    });

    return { success: true, data: slotInfo };
  }
}
