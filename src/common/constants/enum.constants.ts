// space.price_type
export enum SPACE_PRICE_TYPE {
  FIXED = 'FIXED',
  PER_PERSON = 'PER_PERSON',
}

// reservation.status
export enum RESERVATION_STATUS {
  OCCUPIED = 'OCCUPIED', // 임시 점유 (예약 중, 예약완료X, 결제X)
  PENDING = 'PENDING', // 결제 대기 (예약완료, 결제 대기 상태 (현금))
  COMPLETED = 'COMPLETED', // 결제 완료
  CANCELED = 'CANCELED', // 결제 취소
}

// pay.pay_status
export enum PAY_STATUS {
  PENDING = 'PENDING', // 결제 대기
  COMPLETED = 'COMPLETED', // 결제 완료
  CANCELED = 'CANCELED', // 취소
}

// pay.pay_method
export enum PAY_METHOD {
  CARD = 'CARD',
  CASH = 'CASH',
  FREE = 'FREE',
}
