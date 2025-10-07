// space 관련 범용 함수

// open_time, close_time으로 공간 슬롯 구하기
export const sliceSlots = (open_time: string, close_time: string, interval_minute) => {
  const slots: string[] = [];

  // 분단위까지 사용, 초단위 사용 안함
  const [open_hour, open_minute, open_second] = open_time.split(':').map(Number);
  const [close_hour, close_minute, close_second] = close_time.split(':').map(Number);

  const start_minutes = open_hour * 60 + open_minute; // 슬롯 오픈 시간 분으로 변환
  const end_minutes = close_hour * 60 + close_minute; // 슬롯 종료 시간 분으로 변환

  // 총 슬롯수
  const count = Math.floor((end_minutes - start_minutes) / interval_minute);

  // 슬롯 계산
  Array.from({ length: count }, (_, i) => {
    const slot_total_minutes = start_minutes + i * interval_minute;
    const slot_hour = Math.floor(slot_total_minutes / 60)
      .toString()
      .padStart(2, '0');
    const slot_minute = (slot_total_minutes % 60).toString().padStart(2, '0');
    slots.push(`${slot_hour}:${slot_minute}`);
  });

  return slots;
};
