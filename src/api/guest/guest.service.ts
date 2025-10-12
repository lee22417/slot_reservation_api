import { Injectable } from '@nestjs/common';
import { GuestRequestDto } from './dto/guest_request.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Like, Repository } from 'typeorm';
import { Logger } from 'nestjs-pino';
import { Pay } from '../../entities/pay.entity';
import { Reservation } from '../../entities/reservation.entity';
import { ReservationGuest } from '../../entities/reservation_guest.entity';
import { PayDetail } from '../../entities/pay_detail.entity';
import { formatDateSeoul } from '../../common/utils/date.util';
import moment from 'moment';

@Injectable()
export class GuestService {
  constructor(
    @InjectRepository(Reservation)
    private readonly reservationRepository: Repository<Reservation>,
    @InjectRepository(ReservationGuest)
    private readonly guestRepository: Repository<ReservationGuest>,
    @InjectRepository(Pay)
    private readonly payRepository: Repository<Pay>,
    @InjectRepository(PayDetail)
    private readonly payDetailRepository: Repository<PayDetail>,

    private readonly logger: Logger,
  ) {}

  // 비회원 공간 예약 조회
  async getGuestReservation(guestRequestDto: GuestRequestDto) {
    const guestPhone = guestRequestDto.guest_phone;
    const paymentIdSuffix = guestRequestDto.payment_id_suffix; // 결제 고유 번호 뒷6자리

    const guest = await this.guestRepository.findOne({
      where: { guest_phone: guestPhone, payment_id: Like(`%${paymentIdSuffix}`) },
    });
    if (!guest) {
      return { success: false, msg: '해당 예약 조회 실패' };
    }
    const paymentId = guest.payment_id;

    // 결제
    const pay = await this.payRepository.findOne({
      where: { payment_id: paymentId },
      select: ['pay_total_price', 'pay_status', 'pay_method', 'created_at'],
    });

    // 결제 상세
    const payDetail = await this.payDetailRepository.find({
      where: { payment_id: paymentId },
      select: ['item_name', 'item_total_price', 'item_quantity'],
      order: { pde_id: 'ASC' },
    });
    // this.logger.debug('payDetail', payDetail);

    // 예약
    const reservation = await this.reservationRepository
      .createQueryBuilder('r')
      .leftJoin('store_space', 's', 's.sp_id = r.sp_id')
      .select([
        'r.sp_id',
        'r.status',
        'r.total_people',
        'r.start_datetime',
        'r.end_datetime',
        's.space_name',
        's.space_use_minute',
        's.space_refundable_day',
      ])
      .where('r.payment_id = :paymentId', { paymentId })
      .orderBy('r.start_datetime')
      .getRawMany();

    reservation.map((x) => {
      x.r_start_datetime_kst = formatDateSeoul(x.r_start_datetime as Date); // 'Asia/Seoul' KST로 변환
      x.r_end_datetime_kst = formatDateSeoul(x.r_end_datetime as Date); // 'Asia/Seoul' KST로 변환
    });

    const data = { pay: pay, payDetail, reservation };
    return { success: true, data };
  }
}
