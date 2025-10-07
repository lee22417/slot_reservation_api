export enum SPACE_PRICE_TYPE {
  FIXED = 'FIXED',
  PER_PERSION = 'PER_PERSION',
}

export enum RESERVATION_STATUS {
  OCCUPIED = 'OCCUPIED', // 임시 점유 (예약 중, 예약완료X, 결제X)
  PENDING = 'PENDING', // 결제 대기 (예약완료, 결제 대기 상태 (현금))
  COMPLETED = 'COMPLETED', // 결제 완료
  CANCELED = 'CANCELED', // 결제 취소
}
