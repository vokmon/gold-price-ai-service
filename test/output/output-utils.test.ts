import { describe, it } from "vitest";
import { convertHuasenghengDataToString, convertSummaryDataToString } from "../../src/services/outputs/output-utils";
import { goldPriceSummary } from "../mock-data/gold-price-summary";
import { huasengsengPriceData1 } from "../mock-data/huasengheng-data";

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

  it("should get price monitoring message", async() => {
    const result = convertHuasenghengDataToString(huasengsengPriceData1);
    console.log(result);
    expect(result).toBeDefined();
  });
});
