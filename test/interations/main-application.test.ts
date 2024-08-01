import { describe, it, vi } from "vitest";
import MainApplication from "../../src/main-application";
import GoldPriceDataSummarization from "../../src/controllers/gold-price-data-summarization";
import { goldPriceSummary } from "../mock-data/gold-price-summary";
import OutputChannels from "../../src/controllers/output-channels";

describe("main application", async () => {
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
