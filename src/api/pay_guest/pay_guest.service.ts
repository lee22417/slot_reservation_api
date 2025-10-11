import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PAY_METHOD, PAY_STATUS, RESERVATION_STATUS } from '../../common/constants/enum.constants';
import { PayReservationStatusService } from '../../common/service/pay_reservation_status.service';
import { Pay } from '../../entities/pay.entity';
import { Reservation } from '../../entities/reservation.entity';
import { ReservationGuest } from '../../entities/reservation_guest.entity';
import { PayRequestDto } from './dto/pay_request.dto';

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
    const pay = await this.payRepository.findOneBy({ payment_id: paymentId, pay_total_price: 0 });
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
}
