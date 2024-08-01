export function getCurrentDate(
  format: string,
  monthFormat: "2-digit" | "short" = "short"
) {
  const currentDate = new Date();
  return new Intl.DateTimeFormat(format, {
    day: "2-digit",
    month: monthFormat,
    year: "numeric",
  }).format(currentDate);
}

export function getTimeOfDay() {
  const now = new Date();
  const hours = now.getHours();

  if (hours < 12) {
    return 'เช้า';
  } else if (hours < 15) {
    return 'บ่าย';
  } else if (hours < 18) {
    return 'เย็น';
  } else if (hours < 21) {
    return 'ค่ำ';
  } else {
    return 'ดึก';
  }
}