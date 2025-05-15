import { vi, describe, it, expect } from "vitest";
import {
  getCurrentDate,
  getFormattedDate,
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
