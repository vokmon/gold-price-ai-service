import { describe, it, expect } from "vitest";
import {
  convertHuasenghengDataToString,
  convertSummaryDataToString,
  convertGoldPricePeriodSummaryToString,
  convertGoldPricePeriodGraphToString,
} from "../../src/services/outputs/output-utils";
import { goldPriceSummary } from "../mock-data/gold-price-summary";
import { huasengsengPriceData1 } from "../mock-data/huasengheng-data";
import { getCurrentDateTime } from "../../src/utils/date-utils";
import { goldPricePeriodSummary } from "../mock-data/gold-price-period-summary-mocked-data";

describe("get output string from GoldPriceSummary", async () => {
  it("should get summary message with current price", async () => {
    const result = convertSummaryDataToString(goldPriceSummary);
    expect(result).toBeDefined();
    expect(result).toContain("คาดการณ์ราคาทองคำวันนี้");
  });

  it("should get summary message without current price", async () => {
    const result = convertSummaryDataToString({
      ...goldPriceSummary,
      currentPrice: { buy: 0, sell: 0 },
    });
    expect(result).toBeDefined();
    expect(result).toContain("คาดการณ์ราคาทองคำวันนี้");
  });

  it("should get summary message only display the current price", async () => {
    const result = convertSummaryDataToString({
      ...goldPriceSummary,
      hasEnoughData: false,
    });
    expect(result).toBeDefined();
    expect(result).not.toContain("คาดการณ์ราคาทองคำวันนี้");
  });

  it("should get price monitoring message, price goes up", async () => {
    const result = convertHuasenghengDataToString(
      huasengsengPriceData1,
      100,
      getCurrentDateTime("th-TH")
    );
    console.log(result);
    expect(result).toBeDefined();
  });

  it("should get price monitoring message, price goes down", async () => {
    const result = convertHuasenghengDataToString(
      huasengsengPriceData1,
      -100,
      getCurrentDateTime("th-TH")
    );
    console.log(result);
    expect(result).toBeDefined();
  });

  it("should get gold price period summary message", async () => {
    const result = convertGoldPricePeriodSummaryToString(
      goldPricePeriodSummary
    );
    console.log(result);
    expect(result).toBeDefined();
  });

  it("should get gold price period summary message without current price", async () => {
    const result = convertGoldPricePeriodSummaryToString({
      ...goldPricePeriodSummary,
      currentPrice: undefined,
    });
    console.log(result);
    expect(result).toBeDefined();
  });

  it("should get gold price period summary message with same start date and end date", async () => {
    const result = convertGoldPricePeriodSummaryToString({
      ...goldPricePeriodSummary,
      startDate: new Date("2025-05-13"),
      endDate: new Date("2025-05-13"),
    });
    console.log(result);
    expect(result).toBeDefined();
  });

  it("should get gold price period graph message for price goes up", async () => {
    const result = convertGoldPricePeriodGraphToString({
      priceDifference: 2000,
      minPrice: 10000,
      maxPrice: 12000,
      latestPrice: 11000,
      earliestPrice: 10000,
    });
    console.log(result);
    expect(result).toBeDefined();
  });

  it("should get gold price period graph message for price goes down", async () => {
    const result = convertGoldPricePeriodGraphToString({
      priceDifference: -2000,
      minPrice: 10000,
      maxPrice: 12000,
      latestPrice: 11000,
      earliestPrice: 10000,
    });
    console.log(result);
    expect(result).toBeDefined();
  });

  it("should get gold price period graph message for price no change", async () => {
    const result = convertGoldPricePeriodGraphToString({
      priceDifference: 0,
      minPrice: 10000,
      maxPrice: 12000,
      latestPrice: 11000,
      earliestPrice: 10000,
    });
    console.log(result);
    expect(result).toBeDefined();
  });
});
