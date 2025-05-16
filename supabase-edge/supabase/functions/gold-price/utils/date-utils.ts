const timeZone = "Asia/Bangkok";

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
    timeZone: timeZone,
  }).format(currentDate);
}

export function getCurrentDate(
  format: string = "th-TH",
  monthFormat: "2-digit" | "short" = "short"
) {
  const currentDate = new Date();
  return new Intl.DateTimeFormat(format, {
    day: "2-digit",
    month: monthFormat,
    year: "numeric",
    timeZone: timeZone,
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
    timeZone: timeZone,
  }).format(date);
}

export function getCurrentDateInThai() {
  const currentDate = new Date();
  return new Intl.DateTimeFormat("th-TH", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    timeZone: timeZone,
  }).format(currentDate);
}

/**
 * Returns a Date object for the current date in Thailand timezone
 */
export function getTodayThaiDate(): Date {
  // Create a date object in the Thai timezone
  const options = { timeZone };
  const thailandTime = new Date().toLocaleString("en-US", options);
  return new Date(thailandTime);
}

export function formatDateAsDDMMYYYY(date: Date = new Date()): string {
  const day = date.getDate().toString().padStart(2, "0");
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const year = date.getFullYear();

  return `${day}/${month}/${year}`;
}

/**
 * Converts a date string to a Date object in Thai timezone
 */
export function convertToThaiTimezone(dateString: string): Date {
  return new Date(
    new Date(dateString).toLocaleString("en-US", { timeZone: "Asia/Bangkok" })
  );
}
