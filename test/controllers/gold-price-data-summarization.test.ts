import { describe, it, vi, beforeAll, expect } from "vitest";
import GoldPriceDataSummarization from "../../src/controllers/gold-price-data-summarization";
import { getCurrentDate } from "../../src/utils/date-utils";
import GoldPriceRelatedWebLinksRetreiver from "../../src/controllers/gold-price-related-web-links-retreiver";
import GoldPriceDataExtractor from "../../src/controllers/gold-price-data-extractor";
import Huasengheng from "../../src/services/huasengheng/huasengheng-service";
import {
  HuasenghengDataType,
  MarketStatus,
} from "../../src/models/huasengheng";

const timeout = 1000 * 60 * 5; // 5 minutes

describe("summarize gold price data from given context", async () => {
  let goldPriceDataSummarization: GoldPriceDataSummarization;
  const context = `** The current gold price from huasengheng.com is Buy: 40,670, Sell: 40,720 \n ราคาทองคำเมื่อวานนี้ (${getCurrentDate(
    "th-TH"
  )}) ปรับตัวขึ้น +23.1 ดอลลาร์ คิดเป็น +0.97% ปิดตลาดที่ระดับ 2,387 ดอลลาร์ ราคาทองคำแท่งสูงสุด - 40,650 บาทต่ำสุด 40,650 บาท  แนวโน้มราคาทองคำคาดว่าจะฟื้นตัวอย่างจำกัด โดยสัญญาณทางเทคนิคของราคาทองคำใน Timeframe 240 นาที จาก MACD และ Modified Stochastic ยังเห็นสัญญาณการปรับตัวขึ้นระยะสั้น จับตาบริเวณแนวต้าน 2,390-2,400 ดอลลาร์ คาดว่าอาจมีแรงขายออกมา`;

  beforeAll(() => {
    goldPriceDataSummarization = new GoldPriceDataSummarization();
  });

  it(
    "should successfully provide summary message answer from the given context ",
    async () => {
      const result =
        await goldPriceDataSummarization.summarizeGoldPriceDataByContext(
          context
        );
      expect(result).toBeDefined();
      expect(result.hasEnoughData).toBeTruthy();
      expect(result.createdDate).toBeDefined();
    },
    timeout
  ); // increase timeout

  it(
    "should not be able to provide an answer",
    async () => {
      const result =
        await goldPriceDataSummarization.summarizeGoldPriceDataByContext(
          "There is no data related to gold price."
        );
      expect(result).toBeDefined();
      expect(result.hasEnoughData).toBeFalsy();
    },
    timeout
  ); // increase timeout

  it(
    "should get summary information from web links",
    async () => {
      const getGoldPriceLinksSpy = vi
        .spyOn(GoldPriceRelatedWebLinksRetreiver.prototype, "getGoldPriceLinks")
        .mockReturnValueOnce(Promise.resolve(["http://www.test.com"]));
      const extractGoldPriceInformationFromWebLinksSpy = vi
        .spyOn(
          GoldPriceDataExtractor.prototype,
          "extractGoldPriceInformationFromWebLinks"
        )
        .mockReturnValueOnce(Promise.resolve([]));
      const getMarketStatusSpy = vi
        .spyOn(Huasengheng.prototype, "getMarketStatus")
        .mockReturnValueOnce(
          Promise.resolve({
            MarketStatus: "ON",
          } as MarketStatus)
        );
      const getCurrentHuasenghengPriceSpy = vi
        .spyOn(Huasengheng.prototype, "getCurrentHuasenghengPrice")
        .mockReturnValueOnce(
          Promise.resolve({
            Buy: 41000,
            Sell: 40000,
          } as HuasenghengDataType)
        );

      const result = await goldPriceDataSummarization.getGoldPriceSummary();

      expect(getMarketStatusSpy).toHaveBeenCalledTimes(1);
      expect(getGoldPriceLinksSpy).toHaveBeenCalledTimes(1);
      expect(extractGoldPriceInformationFromWebLinksSpy).toHaveBeenCalledTimes(
        1
      );
      expect(getCurrentHuasenghengPriceSpy).toHaveBeenCalledTimes(1);
      expect(result).toBeDefined();
    },
    timeout
  );

  it("should not get summary information from web links if market is off", async () => {
    const getMarketStatusSpy = vi
      .spyOn(Huasengheng.prototype, "getMarketStatus")
      .mockReturnValueOnce(
        Promise.resolve({ MarketStatus: "OFF" } as MarketStatus)
      );
    const getGoldPriceLinksSpy = vi.spyOn(
      GoldPriceRelatedWebLinksRetreiver.prototype,
      "getGoldPriceLinks"
    );
    const result = await goldPriceDataSummarization.getGoldPriceSummary();
    expect(result).toBeUndefined();
    expect(getMarketStatusSpy).toHaveBeenCalledTimes(1);
    expect(getGoldPriceLinksSpy).not.toHaveBeenCalled();
  });
});
