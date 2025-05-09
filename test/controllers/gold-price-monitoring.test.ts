import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import GoldPriceMonitoring from "../../src/controllers/gold-price-monitoring";
import Huasengheng from "../../src/services/huasengheng/huasengheng-service";
import {
  huasengsengPriceData1,
  huasengsengPriceData2,
  huasengsengPriceData3,
  huasengsengPriceData4,
} from "../mock-data/huasengheng-data";
import { MarketStatus } from "../../src/models/huasengheng";

describe("retreive gold price and compare with the last seen price with env", async () => {
  let goldPriceMonitoring: GoldPriceMonitoring;
  let priceThreshold: number;
  let getMarketStatusSpy;

  beforeEach(() => {
    goldPriceMonitoring = new GoldPriceMonitoring();
    priceThreshold = Number(process.env.PRICE_DIFF_THRESHOLD || 0);
    getMarketStatusSpy = vi
      .spyOn(Huasengheng.prototype, "getMarketStatus")
      .mockReturnValueOnce(
        Promise.resolve({ MarketStatus: "ON" } as MarketStatus)
      );
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("should not indicate price alert for the first time", async () => {
    const getCurrentHuasenghengPriceSpy = vi
      .spyOn(Huasengheng.prototype, "getCurrentHuasenghengPrice")
      .mockReturnValueOnce(Promise.resolve(huasengsengPriceData1));
    const result = await goldPriceMonitoring.monitorPrice(priceThreshold);
    expect(result.priceAlert).toBeFalsy();
    expect(getMarketStatusSpy).toHaveBeenCalledTimes(1);
    expect(getCurrentHuasenghengPriceSpy).toHaveBeenCalledTimes(1);
  });

  it("should not indicate price alert as the api return undefined", async () => {
    const getCurrentHuasenghengPriceSpy = vi
      .spyOn(Huasengheng.prototype, "getCurrentHuasenghengPrice")
      .mockReturnValueOnce(Promise.resolve(undefined));
    const result = await goldPriceMonitoring.monitorPrice(priceThreshold);
    expect(result.priceAlert).toBeFalsy();
    expect(getMarketStatusSpy).toHaveBeenCalledTimes(1);
    expect(getCurrentHuasenghengPriceSpy).toHaveBeenCalledTimes(1);
  });

  it("should not indicate price alert as the price change does not hit the threshold", async () => {
    const getCurrentHuasenghengPriceSpy = vi
      .spyOn(Huasengheng.prototype, "getCurrentHuasenghengPrice")
      .mockReturnValueOnce(Promise.resolve(huasengsengPriceData1))
      .mockReturnValueOnce(Promise.resolve(huasengsengPriceData4));

    const resultOne = await goldPriceMonitoring.monitorPrice(priceThreshold);
    expect(resultOne.priceAlert).toBeFalsy();
    const resultTwo = await goldPriceMonitoring.monitorPrice(priceThreshold);
    expect(resultTwo.priceAlert).toBeFalsy();
    expect(getMarketStatusSpy).toHaveBeenCalledTimes(2);
    expect(getCurrentHuasenghengPriceSpy).toHaveBeenCalledTimes(2);
  });

  it("should not indicate price alert as the api returns the same data", async () => {
    const getCurrentHuasenghengPriceSpy = vi
      .spyOn(Huasengheng.prototype, "getCurrentHuasenghengPrice")
      .mockReturnValueOnce(Promise.resolve(huasengsengPriceData1))
      .mockReturnValueOnce(Promise.resolve(huasengsengPriceData1));
    const resultOne = await goldPriceMonitoring.monitorPrice(priceThreshold);
    expect(resultOne.priceAlert).toBeFalsy();

    const resultTwo = await goldPriceMonitoring.monitorPrice(priceThreshold);
    expect(getMarketStatusSpy).toHaveBeenCalledTimes(2);
    expect(resultTwo.priceAlert).toBeFalsy();
    expect(getCurrentHuasenghengPriceSpy).toHaveBeenCalledTimes(2);
  });

  it("should indicate price alert as the price goes up and hit the threshold", async () => {
    const getCurrentHuasenghengPriceSpy = vi
      .spyOn(Huasengheng.prototype, "getCurrentHuasenghengPrice")
      .mockReturnValueOnce(Promise.resolve(huasengsengPriceData1))
      .mockReturnValueOnce(Promise.resolve(huasengsengPriceData2));
    const resultOne = await goldPriceMonitoring.monitorPrice(priceThreshold);
    expect(resultOne.priceAlert).toBeFalsy();

    const resultTwo = await goldPriceMonitoring.monitorPrice(priceThreshold);
    expect(resultTwo.priceAlert).toBeTruthy();

    expect(getMarketStatusSpy).toHaveBeenCalledTimes(2);
    expect(getCurrentHuasenghengPriceSpy).toHaveBeenCalledTimes(2);
  });

  it("should indicate price alert as the price goes down and hit the threshold", async () => {
    const getCurrentHuasenghengPriceSpy = vi
      .spyOn(Huasengheng.prototype, "getCurrentHuasenghengPrice")
      .mockReturnValueOnce(Promise.resolve(huasengsengPriceData1))
      .mockReturnValueOnce(Promise.resolve(huasengsengPriceData3));
    const resultOne = await goldPriceMonitoring.monitorPrice(priceThreshold);
    expect(resultOne.priceAlert).toBeFalsy();

    const resultTwo = await goldPriceMonitoring.monitorPrice(priceThreshold);
    expect(resultTwo.priceAlert).toBeTruthy();

    expect(getMarketStatusSpy).toHaveBeenCalledTimes(2);
    expect(getCurrentHuasenghengPriceSpy).toHaveBeenCalledTimes(2);
  });

  it("should not indicate price alert as the market is off", async () => {
    const marketStatusSpy = (getMarketStatusSpy = vi
      .spyOn(Huasengheng.prototype, "getMarketStatus")
      .mockReturnValueOnce(
        Promise.resolve({ MarketStatus: "OFF" } as MarketStatus)
      ));

    const getCurrentHuasenghengPriceSpy = vi.spyOn(
      Huasengheng.prototype,
      "getCurrentHuasenghengPrice"
    );

    const result = await goldPriceMonitoring.monitorPrice(priceThreshold);

    expect(result.priceAlert).toBeFalsy();
    expect(marketStatusSpy).toHaveBeenCalledTimes(1);
    expect(getCurrentHuasenghengPriceSpy).not.toHaveBeenCalled();
  });
});
