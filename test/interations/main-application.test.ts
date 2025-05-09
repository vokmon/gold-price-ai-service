import { describe, it, vi, beforeAll, afterAll, expect } from "vitest";
import MainApplication from "../../src/main-application";
import GoldPriceDataSummarization from "../../src/controllers/gold-price-data-summarization";
import { goldPriceSummary } from "../mock-data/gold-price-summary";
import OutputChannels from "../../src/controllers/output-channels";
import GoldPriceMonitoring from "../../src/controllers/gold-price-monitoring";
import { huasengsengPriceData2 } from "../mock-data/huasengheng-data";
import { getCurrentDateTime } from "../../src/utils/date-utils";
import FirestoreOutput from "../../src/services/outputs/impl/firestore-output";

describe("main application: summary service", async () => {
  let mainApplication: MainApplication;

  beforeAll(() => {
    mainApplication = new MainApplication();
  });

  it("should output summary message to the specific channels", async () => {
    const getGoldPriceSummarySpy = vi
      .spyOn(GoldPriceDataSummarization.prototype, "getGoldPriceSummary")
      .mockReturnValueOnce(Promise.resolve(goldPriceSummary));
    const runProcessSpy = vi.spyOn(MainApplication.prototype, "runProcess");
    const outputDataSpy = vi
      .spyOn(OutputChannels.prototype, "outputData")
      .mockImplementationOnce(vi.fn());

    await mainApplication.runProcess();

    expect(getGoldPriceSummarySpy).toHaveBeenCalledTimes(1);
    expect(runProcessSpy).toHaveBeenCalledTimes(1);
    expect(outputDataSpy).toHaveBeenCalledTimes(1);
  });
});

describe("main application with TEST flag flase", async () => {
  let envCache;
  let mainApplication: MainApplication;

  beforeAll(() => {
    envCache = process.env;
    process.env.TEST = "false";
    mainApplication = new MainApplication();
  });

  it("should output summary message to the specific channels", async () => {
    const getGoldPriceSummarySpy = vi
      .spyOn(GoldPriceDataSummarization.prototype, "getGoldPriceSummary")
      .mockReturnValueOnce(Promise.resolve(goldPriceSummary));
    const runProcessSpy = vi.spyOn(MainApplication.prototype, "runProcess");
    const outputDataSpy = vi
      .spyOn(OutputChannels.prototype, "outputData")
      .mockImplementationOnce(vi.fn());

    await mainApplication.runProcess();

    expect(getGoldPriceSummarySpy).toHaveBeenCalledTimes(1);
    expect(runProcessSpy).toHaveBeenCalledTimes(1);
    expect(outputDataSpy).toHaveBeenCalledTimes(1);
  });

  afterAll(() => {
    process.env = envCache;
  });
});

describe("main application: Price monitoring service", async () => {
  let mainApplication: MainApplication;

  beforeAll(() => {
    mainApplication = new MainApplication();
  });

  it("should output message to the specific channels", async () => {
    const monitorPriceSpy = vi
      .spyOn(GoldPriceMonitoring.prototype, "monitorPrice")
      .mockReturnValueOnce(
        Promise.resolve({
          priceAlert: true,
          currentPrice: huasengsengPriceData2,
          priceDiff: 200,
          lastCheckTime: getCurrentDateTime("th-TH"),
        })
      );

    const outputMessageSpy = vi
      .spyOn(OutputChannels.prototype, "outputDataPriceAlert")
      .mockImplementationOnce(vi.fn());

    await mainApplication.monitorPrice(100);
    expect(monitorPriceSpy).toHaveBeenCalledTimes(1);
    expect(outputMessageSpy).toHaveBeenCalledTimes(1);
  });

  it("should not output message to the specific channels", async () => {
    const monitorPriceSpy = vi
      .spyOn(GoldPriceMonitoring.prototype, "monitorPrice")
      .mockReturnValueOnce(
        Promise.resolve({
          priceAlert: false,
          currentPrice: huasengsengPriceData2,
          priceDiff: 10,
        })
      );

    const firestoreOutputSpy = vi
      .spyOn(FirestoreOutput.prototype, "outputMessage")
      .mockImplementationOnce(vi.fn());

    await mainApplication.monitorPrice(100);
    expect(monitorPriceSpy).toHaveBeenCalledTimes(1);

    expect(firestoreOutputSpy).toHaveBeenCalledTimes(1);
  });
});
