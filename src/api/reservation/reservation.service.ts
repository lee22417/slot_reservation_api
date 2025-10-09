import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Raw, Repository } from 'typeorm';
import { Logger } from 'nestjs-pino';
import { PAY_METHOD, PAY_STATUS, RESERVATION_STATUS, SPACE_PRICE_TYPE } from '../../common/constants/enum.constants';
import { checkValidReservationStatus } from '../../common/utils/reservation.util';
import { ReservationRequestOptionDto } from './dto/reservation_request_option.dto';
import { ReservationRequestDto } from './dto/reservation_request.dto';
import { SpaceStatusService } from '../../common/service/space_status.service';
import { PaymentIdService } from '../../common/service/payment_id.service';
import { SpaceSlotService } from '../../common/service/space_slot.service';
import { LogPinoService } from '../../common/service/log_pino.service';
import { ReservationGuest } from '../../entities/reservation_guest.entity';
import { ReservationOption } from '../../entities/reservation_option.entity';
import { Pay } from '../../entities/pay.entity';
import { PayDetail } from '../../entities/pay_detail.entity';
import { StorePaySetting } from '../../entities/store_pay_setting.entity';
import { Reservation } from '../../entities/reservation.entity';
import { SpaceOption } from '../../entities/store_space_option.entity';
import { combineDateTime } from '../../common/utils/date.util';
import { ReservationRequestSlotDto } from './dto/reservation_request_slot.dto';

@Injectable()
export class ReservationService {
  constructor(
    @InjectRepository(StorePaySetting)
    private readonly paysettingRepository: Repository<StorePaySetting>,
    @InjectRepository(SpaceOption)
    private readonly optionRepository: Repository<SpaceOption>,
    @InjectRepository(Reservation)
    private readonly reservationRepository: Repository<Reservation>,
    @InjectRepository(ReservationGuest)
    private readonly guestRepository: Repository<ReservationGuest>,
    @InjectRepository(ReservationOption)
    private readonly reservationOptionRepository: Repository<ReservationOption>,
    @InjectRepository(Pay)
    private readonly payRepository: Repository<Pay>,
    @InjectRepository(PayDetail)
    private readonly payDetailRepository: Repository<PayDetail>,

    private readonly spaceSlotService: SpaceSlotService,
    private readonly spaceStatusService: SpaceStatusService,
    private readonly paymentIdService: PaymentIdService,
    private readonly logPinoService: LogPinoService,
    private readonly logger: Logger,
  ) {}

  // 특정 공간 특정 일시 임시 점유 (예약) (비회원)
  // @LogPinoExecution({ time: false, startEnd: false, error: true, memory: true, toFile: false, logDir: 'public/logs' })
  async createReservation(spId: number, reservationRequestDto: ReservationRequestDto) {
    const guestName = reservationRequestDto.guest_name;
    const guestPhone = reservationRequestDto.guest_phone;
    const payMethod = reservationRequestDto.pay_method;
    const totalPeople = reservationRequestDto.total_people;
    const slots = reservationRequestDto.slots;
    const options = reservationRequestDto.options;

    // --- 예약 가능 여부 확인 로직
    // 예약 일자 운영 여부 조회
    const slotDate: string[] = slots.map((x) => x.date); // 슬롯 일자만 가져오기
    const statusResult = await this.spaceStatusService.checkSpaceStatus(spId, slotDate);
    if (!statusResult?.success) {
      return statusResult;
    }

    // 공간 조회
    const space = statusResult.space;
    if (!space) {
      return { success: false, msg: '공간 조회 실패' };
    }
    if (totalPeople < space.space_min_people || totalPeople > space.space_max_people) {
      return { success: false, msg: '인원수가 공간 조건에 불일치' };
    }

    const excludedStatus = [RESERVATION_STATUS.CANCELED];
    for (const { date, times } of slots) {
      // 해당 슬롯 시간이 유효한지 확인
      const spaceSlots = await this.spaceSlotService.getSlotsByDay(spId, date, space.space_interval_minute); // 공간 설정된 시간 슬롯
      const invalidSlot = times.some((x) => {
        return !spaceSlots.slots.includes(x);
      });
      if (invalidSlot) {
        return { success: false, msg: `유효하지 않은 슬롯 시간 [${date}]` };
      }

      // 해당 슬롯 예약 가능한지 확인
      const sortedTimes = [...times].sort();
      const startDateTime = combineDateTime(date, sortedTimes[0]); // 해당 슬롯 최소 시작 시간
      const endDateTime = combineDateTime(date, sortedTimes[sortedTimes.length - 1]); // 해당 슬롯 최대 시작 시간
      endDateTime.setMinutes(endDateTime.getMinutes() + space.space_interval_minute); // interval 반영해서 마지막 슬롯 끝나는 시간

      // 해당 슬롯 시간 겹치는 예약들 조회
      const reservations: Reservation[] = await this.reservationRepository.find({
        where: {
          sp_id: spId,
          start_datetime: Raw((alias) => `${alias} < :endDateTime`, { endDateTime }),
          end_datetime: Raw((alias) => `${alias} >= :startDateTime`, { startDateTime }),
          status: Raw((alias) => `${alias} NOT IN (:...excludedStatus)`, { excludedStatus }),
        },
      });

      // 조회한 예약 중 개별 time 단위로 겹침 확인
      for (const t of times) {
        const slotStartDateTime = combineDateTime(date, t);
        const slotEndDateTime = new Date(slotStartDateTime);
        slotEndDateTime.setMinutes(slotEndDateTime.getMinutes() + space.space_interval_minute);

        const isOverlap = reservations.some(
          (x) => x.start_datetime < slotEndDateTime && x.end_datetime > slotStartDateTime && checkValidReservationStatus(x), // 해당 예약 상태 유효한지 확인
        );
        if (isOverlap) {
          return { success: false, msg: `이미 예약된 시간 [${date} ${t}]` };
        }
      }
    }

    // pay_method 사용 가능한지 확인
    const paySetting = await this.paysettingRepository.findOneBy({ st_id: space.st_id });
    if (!paySetting?.is_card_enabled && payMethod === PAY_METHOD.CARD) {
      return { success: false, msg: `해당 결제 수단 사용 불가 [${payMethod}]` };
    }
    if (!paySetting?.is_cash_enabled && payMethod === PAY_METHOD.CASH) {
      return { success: false, msg: `해당 결제 수단 사용 불가 [${payMethod}]` };
    }

    // 결제 고유 번호 생성
    const paymentId: string = await this.paymentIdService.createUniquePaymentId();

    // 총 시간 슬롯 수
    const totalSlotCount = slots.reduce((acc, cur) => acc + cur.times.length, 0);

    // 공간 총 가격 계산 (인원, 시간 슬롯 고려) (옵션 제외)
    const priceInfo = this.calculateTotalSpacePrice(totalPeople, space.space_price, space.space_price_type, totalSlotCount);
    this.logger.debug(priceInfo, { priceInfo: priceInfo });

    // 결제 정보 저장 로직
    const payResult = await this.savePayLogic(paymentId, payMethod, options, space.space_name, priceInfo.totalPrice, priceInfo.spaceQuantity);
    if (!payResult?.success) {
      return payResult;
    }

    // 예약 정보 저장 로직
    const reservationResult = await this.saveReservationLogic(
      spId,
      paymentId,
      guestName,
      guestPhone,
      totalPeople,
      space.space_interval_minute,
      slots,
      options,
    );
    if (!reservationResult?.success) {
      return reservationResult;
    }

    return { success: true, data: { payment_id: paymentId } };
  }

  // --- 내부 함수
  // 예약 정보 저장 로직
  async saveReservationLogic(
    spId: number,
    paymentId: string,
    guestName: string,
    guestPhone: string,
    totalPeople: number,
    intervalMinute: number,
    slots: ReservationRequestSlotDto[],
    options: ReservationRequestOptionDto[] | undefined,
  ) {
    // 예약한 비회원 정보 저장
    const savedGuest = await this.guestRepository.save(
      new ReservationGuest({
        payment_id: paymentId,
        guest_name: guestName,
        guest_phone: guestPhone,
      }),
    );

    // 예약 정보 저장
    const reservationsBulk: Reservation[] = [];
    for (const slot of slots) {
      for (const t of slot.times) {
        const startDateTtime = combineDateTime(slot.date, t);
        const endDateTime = new Date(startDateTtime);
        endDateTime.setMinutes(endDateTime.getMinutes() + intervalMinute);
        reservationsBulk.push(
          new Reservation({
            payment_id: paymentId,
            sp_id: spId,
            status: RESERVATION_STATUS.OCCUPIED,
            start_datetime: startDateTtime,
            end_datetime: endDateTime,
            total_people: totalPeople,
          }),
        );
      }
    }
    const savedReservation = await this.reservationRepository.save(reservationsBulk); // 저장 bulk
    if (!savedReservation) {
      return { success: false, msg: '예약 실패' };
    }

    // 예약 옵션 정보 저장
    if (options?.length) {
      const reservationOptionBulk = options.map((x) => ({
        payment_id: paymentId,
        sop_id: x.sop_id,
        quantity: x.quantity,
      }));
      const savedOptions = await this.reservationOptionRepository.save(reservationOptionBulk); // 저장 bulk
    }

    return { success: true };
  }

  // 결제 정보 저장 로직
  async savePayLogic(
    paymentId: string,
    payMethod: PAY_METHOD,
    options: ReservationRequestOptionDto[] | undefined,
    spaceName: string,
    totalSpacePrice: number, // 공간 총 가격 (옵션 제외)
    spaceQuantity: number,
  ) {
    const payDetailBulk: Partial<PayDetail>[] = [];

    // 공간 pay_detail 저장
    payDetailBulk.push({
      payment_id: paymentId,
      item_name: spaceName,
      item_total_price: totalSpacePrice,
      item_quantity: spaceQuantity,
      item_rel_table: 'reservation',
    });

    // 공간 옵션마다 pay_detail 저장
    if (options?.length) {
      for (const x of options) {
        const spaceOption = await this.optionRepository.findOneBy({ sop_id: x.sop_id, option_status: 1 });
        if (spaceOption) {
          totalSpacePrice += spaceOption.option_price * x.quantity; // 총 가격 추가
          payDetailBulk.push({
            payment_id: paymentId,
            item_name: spaceOption.option_name,
            item_total_price: spaceOption.option_price * x.quantity, // 수량 고려 가격
            item_quantity: x.quantity,
            item_rel_table: 'reservation_option',
          });
        }
      }
    }

    if (payDetailBulk.length) {
      await this.payDetailRepository.save(payDetailBulk); // 저장 bulk
    }

    // pay 저장
    const savedPay = await this.payRepository.save({
      payment_id: paymentId,
      pay_total_price: totalSpacePrice,
      pay_status: PAY_STATUS.PENDING,
      pay_method: payMethod,
    });

    return { success: true };
  }

  // 공간 총 가격 계산 (인원, 시간 슬롯 고려) (옵션 제외)
  calculateTotalSpacePrice(totalPeople: number, spacePrice: number, spacePriceType: SPACE_PRICE_TYPE, totalSlotCount: number) {
    let totalPrice = 0; // 공간 총 가격 = 공간 기본 가격 * 인원 수 * 시간 슬롯 수
    let spaceQuantity = 1; // 공간 총 개수 (인원 수 * 시간 슬롯 수)

    // space_price_type = FIXED이면 인원 수 = 1로 간주
    if (spacePriceType == SPACE_PRICE_TYPE.FIXED) {
      totalPrice += spacePrice;
    } // 인원별 요금이면
    else if (spacePriceType == SPACE_PRICE_TYPE.PER_PERSON) {
      totalPrice += spacePrice * totalPeople;
      spaceQuantity = totalPeople;
    }

    // interval로 총 예약하는 시간 슬롯 수 구하기
    totalPrice *= totalSlotCount; // 총 가격 추가
    spaceQuantity *= totalSlotCount;

    return { totalPrice, spaceQuantity };
  }
}
