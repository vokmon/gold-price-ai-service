import { describe, it, vi } from "vitest";
import { convertSummaryDataToString } from "../../src/services/outputs/output-utils";
import { goldPriceSummary } from "../mock-data/gold-price-summary";

describe("get output string from GoldPriceSummary", async () => {
  
  it("should get summary message with current price", async () => {
    const result = convertSummaryDataToString(goldPriceSummary);
    expect(result).toBeDefined();
  });

  it("should get summary message without current price", async () => {
    const result = convertSummaryDataToString({
      ...goldPriceSummary,
      currentPrice: {buy: 0, sell: 0}
    });
    expect(result).toBeDefined();
  });

});
