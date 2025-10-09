// date 범용 함수

export const formatDate = (date: Date): string => {
  return date.toISOString().split('T')[0]; // YYYY-MM-DD
};

export const formatTime = (date: Date): string => {
  return date.toISOString().split('T')[1]; // HH:mm:ss
};

export const getCurrentTimestamp = (): number => {
  return Date.now();
};

// date와 time을 datetime으로 합치기
export const combineDateTime = (date: string, time: string): Date => {
  return new Date(`${date}T${time}:00`);
};

// datetime 시간 차이 계산
export const getDiffDateTime = (startDateTime: Date, endDateTime: Date, returnType: string) => {
  const diff = endDateTime.getTime() - startDateTime.getTime(); // ms
  switch (returnType) {
    case 'minute':
      return diff / 1000 / 60; // 시간 차이 분단위
    case 'hour':
      return diff / 1000 / 60 / 60; // 시간 차이 시단위
    default:
      return 0;
  }
};
