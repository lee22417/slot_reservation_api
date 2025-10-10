import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Pay } from '../../entities/pay.entity';
import { Reservation } from '../../entities/reservation.entity';
import { PAY_STATUS, RESERVATION_STATUS } from '../constants/enum.constants';

@Injectable()
export class PayReservationStatusService {
  constructor(
    @InjectRepository(Pay)
    private readonly payRepository: Repository<Pay>,
    @InjectRepository(Reservation)
    private readonly reservationRepository: Repository<Reservation>,
  ) {}

  // 특정 공간 특정 일자 운영 여부 조회
  async updatePayReservationStatus(
    paymentId: string,
    currentPayStatus: PAY_STATUS,
    newPayStatus: PAY_STATUS,
    currentStatus: RESERVATION_STATUS,
    newStatus: RESERVATION_STATUS,
  ) {
    // 대기를 취소로 업데이트
    const updatedPay = await this.payRepository.update({ payment_id: paymentId, pay_status: currentPayStatus }, { pay_status: newPayStatus });
    // 임시 점유를 취소로 업데이트
    const updatedReservation = await this.reservationRepository.update({ payment_id: paymentId, status: currentStatus }, { status: newStatus });
    if (!updatedPay || !updatedReservation) {
      return { success: false, msg: '해당 예약 취소 실패' };
    }

    return { success: true };
  }
}
