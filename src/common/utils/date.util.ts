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
