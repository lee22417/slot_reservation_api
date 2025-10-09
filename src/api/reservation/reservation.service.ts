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
    const startDate = reservationRequestDto.start_date;
    const startTime = reservationRequestDto.start_time;
    const endDate = reservationRequestDto.end_date;
    const endTime = reservationRequestDto.end_time;
    const option = reservationRequestDto.option;

    const startDateTime: Date = new Date(`${startDate}T${startTime}:00`);
    const endDateTime: Date = new Date(`${endDate}T${endTime}:00`);
    const totalReservationMinute = (endDateTime.getTime() - startDateTime.getTime()) / 1000 / 60; // 총 예약 시간 (분)

    // --- 예약 가능 여부 확인 로직
    // 시작 일자 = 종료 일자 아니면 오류 (임시 조치)
    /* 
      여러 날짜로 로직 구성시, intervalMinute -> 60,120,...분 단위가 아닐떄 로직 필요) (예, 80분일때 slot이 23:00~00:20 이런식으로 날짜 넘어서 구성되면, 매일마다 slot이 달라짐)
      요일별로 운영시간 다른 것도 해결 필요 (20시~다음날 1시 예약했는데, 다음날은 7시부터 오픈)
    */
    if (!startDate.match(endDate)) {
      return { success: false, msg: '여러 날짜 한번에 예약 불가' };
    }

    // 시작 일자, 종료 일자 운영 여부 조회
    const statusResult = await this.spaceStatusService.checkSpaceStatus(spId, [startDate, endDate]);
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

    // 시작 시간이 시간 슬롯에 있는지 확인
    const slotsInfo = await this.spaceSlotService.getSlotsByDay(spId, startDate, space.space_interval_minute); // 시간 슬롯
    const isStartValid = slotsInfo.slots.some((x) => x === startTime);
    if (!isStartValid) {
      return { success: false, msg: '시간 슬롯에 존재 하지 않는 시작 시간' };
    }

    // 시간 겹치는 예약들 조회
    const excludedStatus = [RESERVATION_STATUS.CANCELED];
    const reservation: Reservation[] = await this.reservationRepository.find({
      where: {
        sp_id: spId,
        start_datetime: Raw((alias) => `${alias} < :endDateTime`, { endDateTime }),
        end_datetime: Raw((alias) => `${alias} >= :startDateTime`, { startDateTime }),
        status: Raw((alias) => `${alias} NOT IN (:...excludedStatus)`, { excludedStatus }),
      },
    });

    // 시간 겹치는 예약들 중 유효한 예약 있는지 확인
    const isNotValid = reservation.some((x) => {
      const status = checkValidReservationStatus(x); // 해당 예약 상태 유효한지 확인
      return status;
    });
    if (isNotValid) {
      return { success: false, msg: '이미 예약된 시간' };
    }

    // pay_method 사용 가능한지 확인
    const paySetting = await this.paysettingRepository.findOneBy({ st_id: space.st_id });
    if (!paySetting?.is_card_enabled && payMethod === PAY_METHOD.CARD) {
      return { success: false, msg: `해당 결제 수단 사용 불가 [${payMethod}]` };
    }
    if (!paySetting?.is_cash_enabled && payMethod === PAY_METHOD.CASH) {
      return { success: false, msg: `해당 결제 수단 사용 불가 [${payMethod}]` };
    }

    // 시간 슬롯 간격 유효성 확인
    if (totalReservationMinute % space.space_interval_minute != 0) {
      return { success: false, msg: '시간 슬롯 간격 오류' };
    }

    // 결제 고유 번호 생성
    const paymentId: string = await this.paymentIdService.createUniquePaymentId();

    // 공간 총 가격 계산 (인원, 시간 슬롯 고려) (옵션 제외)
    const priceInfo = this.calculateTotalSpacePrice(
      totalPeople,
      space.space_price,
      space.space_price_type,
      space.space_interval_minute,
      totalReservationMinute,
    );
    this.logger.debug({ message: 'priceInfo', priceInfo: priceInfo });

    // 결제 정보 저장 로직
    const payResult = await this.savePayLogic(paymentId, payMethod, option, space.space_name, priceInfo.totalPrice, priceInfo.spaceQuantity);
    if (!payResult?.success) {
      return payResult;
    }

    // 예약 정보 저장 로직
    const reservationResult = await this.saveReservationLogic(
      spId,
      paymentId,
      guestName,
      guestPhone,
      priceInfo.slotCount,
      totalPeople,
      startDateTime,
      endDateTime,
      option,
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
    slotCount: number,
    totalPeople: number,
    startDateTime: Date,
    endDateTime: Date,
    option: ReservationRequestOptionDto[] | undefined,
  ) {
    // 예약한 비회원 정보 저장
    const isSavedGuest = await this.guestRepository.save(
      new ReservationGuest({
        payment_id: paymentId,
        guest_name: guestName,
        guest_phone: guestPhone,
      }),
    );

    // 예약 정보 저장
    const isSavedReservation = await this.reservationRepository.save(
      new Reservation({
        payment_id: paymentId,
        sp_id: spId,
        status: RESERVATION_STATUS.OCCUPIED,
        start_datetime: startDateTime,
        end_datetime: endDateTime,
        slot_count: slotCount,
        total_people: totalPeople,
      }),
    );
    if (!isSavedReservation) {
      return { success: false, msg: '예약 실패' };
    }

    // 예약 옵션 정보 저장
    if (option?.length) {
      const reservationOptionBulk = option.map((x) => ({
        payment_id: paymentId,
        sop_id: x.sop_id,
        quantity: x.quantity,
      }));
      const isSavedOptions = await this.reservationOptionRepository.save(reservationOptionBulk); // 저장 bulk
    }

    return { success: true };
  }

  // 결제 정보 저장 로직
  async savePayLogic(
    paymentId: string,
    payMethod: PAY_METHOD,
    reservationOption: ReservationRequestOptionDto[] | undefined,
    spaceName: string,
    totalSpacePrice: number, // 공간 총 가격 (옵션 제외)
    spaceQuantity: number,
  ) {
    // 공간 pay_detail 저장
    await this.payDetailRepository.save({
      payment_id: paymentId,
      item_name: spaceName,
      item_total_price: totalSpacePrice,
      item_quantity: spaceQuantity,
      item_rel_table: 'reservation',
    });

    // 공간 옵션 pay_detail 저장
    if (reservationOption?.length) {
      const payDetailBulk: Partial<PayDetail>[] = [];
      for (const x of reservationOption) {
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
      if (payDetailBulk.length) {
        await this.payDetailRepository.save(payDetailBulk);
      }
    }

    // pay 저장
    const isSavedPay = await this.payRepository.save({
      payment_id: paymentId,
      pay_total_price: totalSpacePrice,
      pay_status: PAY_STATUS.PENDING,
      pay_method: payMethod,
    });
    const paId = isSavedPay.pa_id;

    return { success: true, pa_id: paId };
  }

  // 공간 총 가격 계산 (인원, 시간 슬롯 고려) (옵션 제외)
  calculateTotalSpacePrice(
    totalPeople: number,
    spacePrice: number,
    spacePriceType: SPACE_PRICE_TYPE,
    intervalMinute: number,
    totalReservationMinute: number,
  ) {
    let totalPrice = 0; // 공간 총 가격
    let spaceQuantity = 1; // 공간 총 개수 (인원 수(FIXED=1) * 시간 슬롯 수)

    // 인원별 요금이면
    if (spacePriceType == SPACE_PRICE_TYPE.FIXED) {
      totalPrice += spacePrice;
    } else if (spacePriceType == SPACE_PRICE_TYPE.PER_PERSON) {
      totalPrice += spacePrice * totalPeople;
      spaceQuantity = totalPeople;
    }

    // interval로 총 예약하는 시간 슬롯 수 구하기
    const slotCount = Math.floor(totalReservationMinute / intervalMinute);
    totalPrice *= slotCount; // 총 가격 추가
    spaceQuantity *= slotCount;

    // 총 가격 = 공간 기본 가격 * 인원 수(FIXED=1) * 시간 슬롯 수
    return { totalPrice, slotCount, spaceQuantity };
  }
}
