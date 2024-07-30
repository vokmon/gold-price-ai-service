const currentDate = new Date();

export function getCurrentDate(
  format: string,
  monthFormat: "2-digit" | "short" = "short"
) {
  return new Intl.DateTimeFormat(format, {
    day: "2-digit",
    month: monthFormat,
    year: "numeric",
  }).format(currentDate);
}