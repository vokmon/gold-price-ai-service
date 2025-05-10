import { describe, it, vi, beforeAll, afterAll, expect } from "vitest";
import MainApplication from "../../src/main-application";
import GoldPriceDataSummarization from "../../src/controllers/gold-price-data-summarization";
import { goldPriceSummary } from "../mock-data/gold-price-summary";
import OutputChannels from "../../src/controllers/output-channels";
import GoldPriceMonitoring from "../../src/controllers/gold-price-monitoring";
import { huasengsengPriceData2 } from "../mock-data/huasengheng-data";
import { getCurrentDateTime } from "../../src/utils/date-utils";
import FirestoreOutput from "../../src/services/outputs/impl/firestore-output";
import GoldPricePeriodSummary from "../../src/controllers/gold-price-period-summary";
import GoldPricePeriodGraph from "../../src/controllers/gold-price-period-graph";
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

    const graphSpy = vi
      .spyOn(GoldPricePeriodGraph.prototype, "getGoldPricePeriodGraph")
      .mockReturnValueOnce(
        Promise.resolve({
          chartAsBuffer: Buffer.from("test"),
          description: "test",
          dataPeriod: {
            startDate: new Date("2023-01-01"),
            endDate: new Date("2023-01-07"),
          },
        })
      );

    const runProcessSpy = vi.spyOn(MainApplication.prototype, "runProcess");
    const outputDataSpy = vi
      .spyOn(OutputChannels.prototype, "outputData")
      .mockImplementationOnce(vi.fn());

    const outputGraphSpy = vi
      .spyOn(OutputChannels.prototype, "outputDataGoldPricePeriodGraph")
      .mockImplementationOnce(vi.fn());

    await mainApplication.runProcess();

    expect(getGoldPriceSummarySpy).toHaveBeenCalledTimes(1);

    const startDate = new Date();
    startDate.setHours(0, 0, 0, 0);
    const endDate = new Date();
    expect(graphSpy).toHaveBeenCalledWith(startDate, endDate);
    expect(runProcessSpy).toHaveBeenCalledTimes(1);
    expect(outputDataSpy).toHaveBeenCalledTimes(1);
    expect(outputGraphSpy).toHaveBeenCalledTimes(1);
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

describe("main application: Gold price period summary service", async () => {
  let mainApplication: MainApplication;

  beforeAll(() => {
    mainApplication = new MainApplication();
  });

  it("should output summary message to the specific channels", async () => {
    const summarizeGoldPricePeriodSpy = vi
      .spyOn(GoldPricePeriodSummary.prototype, "summarizeGoldPricePeriod")
      .mockReturnValueOnce(Promise.resolve(goldPriceSummary));

    const graphSpy = vi
      .spyOn(GoldPricePeriodGraph.prototype, "getGoldPricePeriodGraph")
      .mockReturnValueOnce(
        Promise.resolve({
          chartAsBuffer: Buffer.from("test"),
          description: "test",
          dataPeriod: {
            startDate: new Date("2023-01-01"),
            endDate: new Date("2023-01-07"),
          },
        })
      );

    const outputDataSpy = vi
      .spyOn(OutputChannels.prototype, "outputDataGoldPricePeriodSummary")
      .mockImplementationOnce(vi.fn());

    const outputGraphSpy = vi
      .spyOn(OutputChannels.prototype, "outputDataGoldPricePeriodGraph")
      .mockImplementationOnce(vi.fn());

    const startDate = new Date("2023-01-01");
    const endDate = new Date("2023-01-07");
    await mainApplication.summarizeGoldPricePeriod(startDate, endDate);

    expect(summarizeGoldPricePeriodSpy).toHaveBeenCalledTimes(1);
    expect(graphSpy).toHaveBeenCalledWith(startDate, endDate);
    expect(outputDataSpy).toHaveBeenCalledTimes(1);
    expect(outputGraphSpy).toHaveBeenCalledTimes(1);
  });
});
