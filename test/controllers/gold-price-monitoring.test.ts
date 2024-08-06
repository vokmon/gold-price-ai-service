import { describe, expect, it, vi } from "vitest";
import GoldPriceMonitoring from "../../src/controllers/gold-price-monitoring";
import Huasengheng from "../../src/services/huasengheng/huasengheng-service";
import { huasengsengPriceData1, huasengsengPriceData2, huasengsengPriceData3, huasengsengPriceData4 } from "../mock-data/huasengheng-data";

describe("retreive gold price and compare with the last seen price with env", async () => {
  let goldPriceMonitoring: GoldPriceMonitoring;

  beforeEach(() => {
    goldPriceMonitoring = new GoldPriceMonitoring();
  });

  afterEach(() => {    
    vi.clearAllMocks();
  });

  it("should not indicate price alert for the first time", async () => {
    const getCurrentHuasenghengPriceSpy = vi
      .spyOn(Huasengheng.prototype, "getCurrentHuasenghengPrice")
      .mockReturnValueOnce(
        Promise.resolve(huasengsengPriceData1)
      )
    const result = await goldPriceMonitoring.monitorPrice();
    expect(result.priceAlert).toBeFalsy();
    expect(getCurrentHuasenghengPriceSpy).toHaveBeenCalledTimes(1);
  });

  it("should not indicate price alert as the api return undefined", async () => {
    const getCurrentHuasenghengPriceSpy = vi
      .spyOn(Huasengheng.prototype, "getCurrentHuasenghengPrice")
      .mockReturnValueOnce(
        Promise.resolve(undefined)
      )
    const result = await goldPriceMonitoring.monitorPrice();
    expect(result.priceAlert).toBeFalsy();
    expect(getCurrentHuasenghengPriceSpy).toHaveBeenCalledTimes(1);
  });

  it("should not indicate price alert as the price change does not hit the threshold", async () => {
    const getCurrentHuasenghengPriceSpy = vi
      .spyOn(Huasengheng.prototype, "getCurrentHuasenghengPrice")
      .mockReturnValueOnce(
        Promise.resolve(huasengsengPriceData1)
      )
      .mockReturnValueOnce(
        Promise.resolve(huasengsengPriceData4)
      )
    
    const resultOne = await goldPriceMonitoring.monitorPrice();
    expect(resultOne.priceAlert).toBeFalsy();

    const resultTwo = await goldPriceMonitoring.monitorPrice();
    expect(resultTwo.priceAlert).toBeFalsy();
    expect(getCurrentHuasenghengPriceSpy).toHaveBeenCalledTimes(2);
  });

  it("should not indicate price alert as the api returns the same data", async () => {
    const getCurrentHuasenghengPriceSpy = vi
      .spyOn(Huasengheng.prototype, "getCurrentHuasenghengPrice")
      .mockReturnValueOnce(
        Promise.resolve(huasengsengPriceData1)
      )
      .mockReturnValueOnce(
        Promise.resolve(huasengsengPriceData1)
      )
    const resultOne = await goldPriceMonitoring.monitorPrice();
    expect(resultOne.priceAlert).toBeFalsy();

    const resultTwo = await goldPriceMonitoring.monitorPrice();
    expect(resultTwo.priceAlert).toBeFalsy();
    expect(getCurrentHuasenghengPriceSpy).toHaveBeenCalledTimes(2);
  });

  it("should indicate price alert as the price goes up and hit the threshold", async () => {
    const getCurrentHuasenghengPriceSpy = vi
      .spyOn(Huasengheng.prototype, "getCurrentHuasenghengPrice")
      .mockReturnValueOnce(
        Promise.resolve(huasengsengPriceData1)
      )
      .mockReturnValueOnce(
        Promise.resolve(huasengsengPriceData2)
      )
    const resultOne = await goldPriceMonitoring.monitorPrice();
    expect(resultOne.priceAlert).toBeFalsy()

    const resultTwo = await goldPriceMonitoring.monitorPrice();
    expect(resultTwo.priceAlert).toBeTruthy()

    expect(getCurrentHuasenghengPriceSpy).toHaveBeenCalledTimes(2);
  });

  it("should indicate price alert as the price goes down and hit the threshold", async () => {
    const getCurrentHuasenghengPriceSpy = vi
      .spyOn(Huasengheng.prototype, "getCurrentHuasenghengPrice")
      .mockReturnValueOnce(
        Promise.resolve(huasengsengPriceData1)
      )
      .mockReturnValueOnce(
        Promise.resolve(huasengsengPriceData3)
      )
    const resultOne = await goldPriceMonitoring.monitorPrice();
    expect(resultOne.priceAlert).toBeFalsy()

    const resultTwo = await goldPriceMonitoring.monitorPrice();
    expect(resultTwo.priceAlert).toBeTruthy()
    expect(getCurrentHuasenghengPriceSpy).toHaveBeenCalledTimes(2);
  });
});

describe("retreive gold price and compare with the last seen price without env", async () => {
  let goldPriceMonitoring: GoldPriceMonitoring;
  let envCache;

  beforeAll(() => {
    envCache = process.env;
    process.env.PRICE_DIFF_TRESHOLD = "";
    goldPriceMonitoring = new GoldPriceMonitoring();
  });

  it("should get list of urls", async () => {
    const getCurrentHuasenghengPriceSpy = vi
      .spyOn(Huasengheng.prototype, "getCurrentHuasenghengPrice")
      .mockReturnValueOnce(
        Promise.resolve(huasengsengPriceData1)
      )
      .mockReturnValueOnce(
        Promise.resolve(huasengsengPriceData2)
      )
    const resultOne = await goldPriceMonitoring.monitorPrice();
    expect(resultOne.priceAlert).toBeFalsy()

    const resultTwo = await goldPriceMonitoring.monitorPrice();
    expect(resultTwo.priceAlert).toBeTruthy()
    expect(getCurrentHuasenghengPriceSpy).toHaveBeenCalledTimes(2);
  });

  afterAll(() => {
    process.env = envCache;
  });
});
