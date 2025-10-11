import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PAY_METHOD, PAY_STATUS, RESERVATION_STATUS } from '../../common/constants/enum.constants';
import { PayReservationStatusService } from '../../common/service/pay_reservation_status.service';
import { Pay } from '../../entities/pay.entity';
import { Reservation } from '../../entities/reservation.entity';
import { ReservationGuest } from '../../entities/reservation_guest.entity';
import { PayRequestDto } from './dto/pay_request.dto';
import { Space } from '../../entities/store_space.entity';
import { StorePaySetting } from '../../entities/store_pay_setting.entity';
import { Logger } from 'nestjs-pino';

@Injectable()
export class PayGuestService {
  constructor(
    @InjectRepository(Reservation)
    private readonly reservationRepository: Repository<Reservation>,
    @InjectRepository(ReservationGuest)
    private readonly guestRepository: Repository<ReservationGuest>,
    @InjectRepository(Pay)
    private readonly payRepository: Repository<Pay>,

    private readonly payReservationStatusService: PayReservationStatusService,
    private readonly logger: Logger,
  ) {}

  // 무료(0원)로 임시 점유 결제 완료 (비회원)
  async payFreeComplete(reservationCancelRequestSlotDto: PayRequestDto) {
    const guestPhone = reservationCancelRequestSlotDto.guest_phone;
    const paymentId = reservationCancelRequestSlotDto.payment_id;

    const guest = await this.guestRepository.findOneBy({ guest_phone: guestPhone, payment_id: paymentId });
    if (!guest) {
      return { success: false, msg: '해당 예약 조회 실패' };
    }

    // 결제 유효한지 확인
    const pay = await this.payRepository.findOneBy({ payment_id: paymentId, pay_status: PAY_STATUS.PENDING, pay_total_price: 0 });
    if (!pay) {
      return { success: false, msg: '해당 결제 조회 실패' };
    }

    // 결제 및 예약 상태 업데이트
    return await this.payReservationStatusService.updatePayReservationStatus(
      paymentId,
      PAY_STATUS.PENDING,
      PAY_STATUS.COMPLETED,
      RESERVATION_STATUS.OCCUPIED,
      RESERVATION_STATUS.COMPLETED,
    );
  }

  // 무료(0원)로 결제 완료한 예약 취소 (비회원)
  async payFreeCancel(reservationCancelRequestSlotDto: PayRequestDto) {
    const guestPhone = reservationCancelRequestSlotDto.guest_phone;
    const paymentId = reservationCancelRequestSlotDto.payment_id;

    const guest = await this.guestRepository.findOneBy({ guest_phone: guestPhone, payment_id: paymentId });
    if (!guest) {
      return { success: false, msg: '해당 예약 조회 실패' };
    }

    // 결제 유효한지 확인
    const pay = await this.payRepository.findOneBy({ payment_id: paymentId, pay_status: PAY_STATUS.COMPLETED, pay_total_price: 0 });
    if (!pay) {
      return { success: false, msg: '해당 결제 조회 실패' };
    }

    // 결제 및 예약 상태 업데이트
    return await this.payReservationStatusService.updatePayReservationStatus(
      paymentId,
      PAY_STATUS.COMPLETED,
      PAY_STATUS.CANCELED,
      RESERVATION_STATUS.COMPLETED,
      RESERVATION_STATUS.CANCELED,
    );
  }

  // 현금 결제시 임시 점유를 결제 대기 (비회원)
  async payCashPending(reservationCancelRequestSlotDto: PayRequestDto) {
    const guestPhone = reservationCancelRequestSlotDto.guest_phone;
    const paymentId = reservationCancelRequestSlotDto.payment_id;

    const guest = await this.guestRepository.findOneBy({ guest_phone: guestPhone, payment_id: paymentId });
    if (!guest) {
      return { success: false, msg: '해당 예약 조회 실패' };
    }

    // 결제 유효한지 확인
    const pay = await this.payRepository.findOneBy({ payment_id: paymentId, pay_status: PAY_STATUS.PENDING, pay_method: PAY_METHOD.CASH });
    if (!pay) {
      return { success: false, msg: '해당 결제 조회 실패' };
    }

    // 예약 임시 점유를 결제 대기로 업데이트
    const updatedReservation = await this.reservationRepository.update(
      { payment_id: paymentId, status: RESERVATION_STATUS.OCCUPIED },
      { status: RESERVATION_STATUS.PENDING },
    );
    if (!updatedReservation.affected) {
      return { success: false, msg: '해당 예약 업데이트 실패' };
    }
    // this.logger.debug('updatedReservation', { updatedReservation });

    // 상점 계좌정보 조회
    const paysetting = await this.reservationRepository
      .createQueryBuilder('r')
      .leftJoin('store_space', 's', 's.sp_id = r.sp_id')
      .leftJoin('store_pay_setting', 'p', 'p.st_id = s.st_id')
      .select(['p.bank_name', 'p.bank_account'])
      .where('r.payment_id = :paymentId', { paymentId })
      .getRawOne();

    return { success: true, data: { bank_name: paysetting?.p_bank_name, bank_account: paysetting?.p_bank_account } };
  }
}
