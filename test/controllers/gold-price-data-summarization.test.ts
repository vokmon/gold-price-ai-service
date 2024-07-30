import { describe, it } from "vitest";
import GoldPriceDataSummarization from "../../src/controllers/gold-price-data-summarization";
import { getAdditionalLinks } from "../../src/utils/url";
import { getCurrentDate } from "../../src/utils/date-utils";

const timeout = 1000 * 60 * 5; // 5 minutes

describe("summarize gold price data from given context", async () => {
  let goldPriceDataSummarization: GoldPriceDataSummarization;
  const context = `** The current gold price from huasengheng.com is Buy: 40,670, Sell: 40,720 \n ราคาทองคำเมื่อวานนี้ (${getCurrentDate('th-TH')}) ปรับตัวขึ้น +23.1 ดอลลาร์ คิดเป็น +0.97% ปิดตลาดที่ระดับ 2,387 ดอลลาร์ ราคาทองคำแท่งสูงสุด - 40,650 บาทต่ำสุด 40,650 บาท  แนวโน้มราคาทองคำคาดว่าจะฟื้นตัวอย่างจำกัด โดยสัญญาณทางเทคนิคของราคาทองคำใน Timeframe 240 นาที จาก MACD และ Modified Stochastic ยังเห็นสัญญาณการปรับตัวขึ้นระยะสั้น จับตาบริเวณแนวต้าน 2,390-2,400 ดอลลาร์ คาดว่าอาจมีแรงขายออกมา`;
  
  beforeAll(() => {
    goldPriceDataSummarization = new GoldPriceDataSummarization();
  });

  it("should successfully provide summary answer", async () => {
    const result =
      await goldPriceDataSummarization.summarizeGoldPriceDataByContext(context);
    expect(result).toBeDefined();
    expect(result.hasEnoughData).toBeTruthy();
    expect(result.createdDate).toBeDefined();

  }, timeout); // increate timeout

  it("should not be able to provide an answer", async () => {
    const result =
      await goldPriceDataSummarization.summarizeGoldPriceDataByContext("There is no data related to gold price.");
    expect(result).toBeDefined();
    expect(result.hasEnoughData).toBeFalsy();
    
  }, timeout); // increate timeout

});
