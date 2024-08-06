import { describe, it, vi } from "vitest";
import MainApplication from "../../src/main-application";
import GoldPriceDataSummarization from "../../src/controllers/gold-price-data-summarization";
import { goldPriceSummary } from "../mock-data/gold-price-summary";
import OutputChannels from "../../src/controllers/output-channels";
import GoldPriceMonitoring from "../../src/controllers/gold-price-monitoring";
import { huasengsengPriceData2 } from "../mock-data/huasengheng-data";

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

  it("should retry once", async () => {
    vi.spyOn(globalThis, "setTimeout").mockImplementation((fn: () => any) => {
      return fn();
    });

    const getGoldPriceSummarySpy = vi
      .spyOn(GoldPriceDataSummarization.prototype, "getGoldPriceSummary")
      .mockReturnValueOnce(
        Promise.resolve({ ...goldPriceSummary, hasEnoughData: false })
      )
      .mockReturnValueOnce(
        Promise.resolve({ ...goldPriceSummary, hasEnoughData: true })
      );

    const runProcessSpy = vi.spyOn(MainApplication.prototype, "runProcess");
    const outputDataSpy = vi
      .spyOn(OutputChannels.prototype, "outputData")
      .mockImplementationOnce(vi.fn());

    await mainApplication.runProcess();

    expect(getGoldPriceSummarySpy).toHaveBeenCalledTimes(2);
    expect(runProcessSpy).toHaveBeenCalledTimes(2);
    expect(outputDataSpy).toHaveBeenCalledTimes(1);
  });

  it("should not be able to generate summary message after max retry", async () => {
    vi.spyOn(globalThis, "setTimeout").mockImplementation((fn: () => any) => {
      return fn();
    });

    const getGoldPriceSummarySpy = vi
      .spyOn(GoldPriceDataSummarization.prototype, "getGoldPriceSummary")
      .mockReturnValueOnce(
        Promise.resolve({ ...goldPriceSummary, hasEnoughData: false })
      )
      .mockReturnValueOnce(
        Promise.resolve({ ...goldPriceSummary, hasEnoughData: false })
      )
      .mockReturnValueOnce(
        Promise.resolve({ ...goldPriceSummary, hasEnoughData: false })
      );

    const runProcessSpy = vi.spyOn(MainApplication.prototype, "runProcess");
    const outputDataSpy = vi
      .spyOn(OutputChannels.prototype, "outputData")
      .mockImplementationOnce(vi.fn());

    await mainApplication.runProcess();

    expect(getGoldPriceSummarySpy).toHaveBeenCalledTimes(3);
    expect(runProcessSpy).toHaveBeenCalledTimes(3);
    expect(outputDataSpy).toHaveBeenCalledTimes(0);
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
      .mockReturnValueOnce(Promise.resolve({
        priceAlert: true,
        currentPrice: huasengsengPriceData2,
        priceDiff: 200,
      }));

    const outputMessageSpy = vi
      .spyOn(OutputChannels.prototype, "outputMessage")
      .mockImplementationOnce(vi.fn());

    await mainApplication.monitorPrice();
    expect(monitorPriceSpy).toHaveBeenCalledTimes(1);
    expect(outputMessageSpy).toHaveBeenCalledTimes(1);
  });

  it("should not output message", async () => {
    const monitorPriceSpy = vi
      .spyOn(GoldPriceMonitoring.prototype, "monitorPrice")
      .mockReturnValueOnce(Promise.resolve({
        priceAlert: false,
        currentPrice: huasengsengPriceData2,
        priceDiff: 10,
      }));

    const outputMessageSpy = vi
      .spyOn(OutputChannels.prototype, "outputMessage")
      .mockImplementationOnce(vi.fn());

    await mainApplication.monitorPrice();
    expect(monitorPriceSpy).toHaveBeenCalledTimes(1);
    expect(outputMessageSpy).toHaveBeenCalledTimes(0);
  });
});