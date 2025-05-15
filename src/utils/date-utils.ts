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

export function formatDateAsDDMMYYYY(date: Date = new Date()): string {
  const day = date.getDate().toString().padStart(2, "0");
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const year = date.getFullYear();

  return `${day}/${month}/${year}`;
}
