export function getCurrentDate(
  format: string = "th-TH",
  monthFormat: "2-digit" | "short" = "short"
) {
  const currentDate = new Date();
  return new Intl.DateTimeFormat(format, {
    day: "2-digit",
    month: monthFormat,
    year: "numeric",
  }).format(currentDate);
}

export function getFormattedDate(
  date: Date,
  format: string = "th-TH",
  monthFormat: "2-digit" | "short" = "short"
) {
  return new Intl.DateTimeFormat(format, {
    day: "2-digit",
    month: monthFormat,
    year: "numeric",
  }).format(date);
}

export function getCurrentDateTime(
  format: string = "th-TH",
  monthFormat: "2-digit" | "short" = "short"
) {
  const currentDate = new Date();
  return new Intl.DateTimeFormat(format, {
    day: "2-digit",
    month: monthFormat,
    year: "numeric",
    hour12: false, // Set to false for 24-hour format
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).format(currentDate);
}

export function getTimeOfDay() {
  const now = new Date();
  const hours = now.getHours();

  if (hours < 12) {
    return "เช้า";
  } else if (hours < 15) {
    return "บ่าย";
  } else if (hours < 18) {
    return "เย็น";
  } else if (hours < 21) {
    return "ค่ำ";
  } else {
    return "ดึก";
  }
}

export function formatDateAsDDMMYYYY(date: Date = new Date()): string {
  const day = date.getDate().toString().padStart(2, "0");
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const year = date.getFullYear();

  return `${day}/${month}/${year}`;
}
