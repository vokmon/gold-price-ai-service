import { describe, it, vi, beforeAll, expect } from "vitest";
import Huasengheng from "../../src/services/huasengheng/huasengheng-service";
import { HGoldType } from "../../src/models/huasengheng";

describe("fetch data from huasengheng", async () => {
  let huasengheng: Huasengheng;

  beforeAll(() => {
    huasengheng = new Huasengheng();
  });

  it("should get current gold price from Huasengheng API", async () => {
    const result = await huasengheng.getCurrentHuasenghengPrice();
    expect(result).toBeDefined();
  });

  it("should not be able to get current gold price from Huasengheng API", async () => {
    const getCurrentPriceSpy = vi
      .spyOn(Huasengheng.prototype, "getCurrentPrice")
      .mockResolvedValueOnce(undefined!);
    const result = await huasengheng.getCurrentHuasenghengPrice();
    expect(result).toBeUndefined();
    getCurrentPriceSpy.mockRestore();
  });

  it("should return undefined when there is no HSH gold price", async () => {
    const getCurrentPriceSpy = vi
      .spyOn(Huasengheng.prototype, "getCurrentPrice")
      .mockResolvedValueOnce([
        {
          GoldType: HGoldType.JEWEL,
          GoldCode: "96.50",
          Buy: "35,000",
          Sell: "35,500",
          TimeUpdate: "2023-01-01T10:00:00",
          BuyChange: 0,
          SellChange: 0,
          PresentDate: "2023-01-01",
          FxAsk: null,
          FxBid: null,
          Bid: null,
          Ask: null,
          QtyBid: null,
          QtyAsk: null,
          Discount: null,
          Premium: null,
          Increment: null,
          SourcePrice: null,
          StrTimeUpdate: "2023-01-01T10:00:00",
        },
      ]);

    const result = await huasengheng.getCurrentHuasenghengPrice();
    expect(result).toBeUndefined();
    getCurrentPriceSpy.mockRestore();
  });

  it("should get market status from Huasengheng API", async () => {
    const result = await huasengheng.getMarketStatus();
    expect(result).toBeDefined();
  });
});
