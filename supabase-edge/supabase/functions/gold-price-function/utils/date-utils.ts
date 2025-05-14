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
