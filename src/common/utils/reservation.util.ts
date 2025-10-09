import { Reservation } from '../../entities/reservation.entity';
import { RESERVATION_STATUS } from '../constants/enum.constants';
import { getDiffDateTime } from './date.util';

// 해당 예약 상태 유효한지 확인
export const checkValidReservationStatus = (reservation: Reservation | undefined, now = new Date()) => {
  let status = reservation ? reservation.status : null; // 예약 상태

  // status가 OCCUPIED이면 임시 점유 (created_at) 기준 10분 이내 확인
  if (status === RESERVATION_STATUS.OCCUPIED && reservation) {
    const diffMinutes = getDiffDateTime(reservation.created_at, now, 'minute');
    if (diffMinutes > 10) {
      status = null; // 10분 초과면 미예약으로 설정
    }
  }

  // status가 PENDING이면 결제 대기 (created_at) 기준 1일 이내 확인
  if (status === RESERVATION_STATUS.PENDING && reservation) {
    const diffHours = getDiffDateTime(reservation.created_at, now, 'hour');
    if (diffHours > 24) {
      status = null; // 1일 초과면 미예약으로 설정
    }
  }

  return status;
};
