import { vi, describe, it, expect } from "vitest";
import {
  getCurrentDate,
  getFormattedDate,
  getTimeOfDay,
  formatDateAsDDMMYYYY,
} from "../../src/utils/date-utils"; // Replace with the correct path
describe("get current date", () => {
  it("should return the current date", () => {
    const mockDate = new Date("2024-01-01T05:00:00Z");
    vi.spyOn(global, "Date").mockImplementation(() => mockDate);

    const result = getCurrentDate("en-UK");
    console.log(result);
  });
});

describe("get time of day string", () => {
  it('should return "เช้า" for hours between 0 and 12', () => {
    const mockDate = new Date();
    mockDate.setHours(5);
    vi.spyOn(global, "Date").mockImplementation(() => mockDate);

    const result = getTimeOfDay();
    expect(result).toBe("เช้า");
  });

  it('should return "บ่าย" for hours between 12 and 15', () => {
    const mockDate = new Date();
    mockDate.setHours(13);
    vi.spyOn(global, "Date").mockImplementation(() => mockDate);

    const result = getTimeOfDay();
    expect(result).toBe("บ่าย");
  });

  it('should return "เย็น" for hours between 15 and 18', () => {
    const mockDate = new Date();
    mockDate.setHours(15);
    vi.spyOn(global, "Date").mockImplementation(() => mockDate);

    const result = getTimeOfDay();
    expect(result).toBe("เย็น");
  });

  it('should return "ค่ำ" for between 18 and 20', () => {
    const mockDate = new Date();
    mockDate.setHours(20);
    vi.spyOn(global, "Date").mockImplementation(() => mockDate);

    const result = getTimeOfDay();
    expect(result).toBe("ค่ำ");
  });

  it('should return "ดึก" for hours > 21', () => {
    const mockDate = new Date();
    mockDate.setHours(22);
    vi.spyOn(global, "Date").mockImplementation(() => mockDate);

    const result = getTimeOfDay();
    expect(result).toBe("ดึก");
  });

  it("should return the format date", () => {
    const mockDate = new Date();
    const result = getFormattedDate(mockDate);
    expect(result).toBe("01 ม.ค. 2567");
  });

  it("should return the format date as DD/MM/YYYY", () => {
    const mockDate = new Date();
    const result = formatDateAsDDMMYYYY(mockDate);
    expect(result).toBe("01/01/2024");
  });
});
