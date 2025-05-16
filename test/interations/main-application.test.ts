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
import { GoldPriceDataRecorder } from "../../src/controllers/gold-price-data-recorder";
import { GoldPriceGraphType } from "../../src/models/gold-price-graph";

vi.mock("firebase-admin/firestore");
vi.mock("firebase-admin/app");

describe("main application: summary service", async () => {
  let mainApplication: MainApplication;

  beforeAll(() => {
    mainApplication = new MainApplication();
  });

  it("should output summary message to the specific channels", async () => {
    const getGoldPriceSummarySpy = vi
      .spyOn(GoldPriceDataSummarization.prototype, "getGoldPriceSummary")
      .mockReturnValueOnce(Promise.resolve(goldPriceSummary));

    const getGoldPricePeriodGraphSpy = vi
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

    await mainApplication.runProcess();

    expect(getGoldPriceSummarySpy).toHaveBeenCalledTimes(1);
    expect(getGoldPricePeriodGraphSpy).toHaveBeenCalledTimes(1);
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

    expect(graphSpy).toHaveBeenCalledTimes(1);
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

    expect(firestoreOutputSpy).not.toHaveBeenCalled();
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
    expect(graphSpy).toHaveBeenCalledWith(
      startDate,
      endDate,
      GoldPriceGraphType.DAY
    );
    expect(outputDataSpy).toHaveBeenCalledTimes(1);
    expect(outputGraphSpy).toHaveBeenCalledTimes(1);
  });
});

describe("main application: Gold price period graph service", async () => {
  let mainApplication: MainApplication;

  beforeAll(() => {
    mainApplication = new MainApplication();
  });

  it("should output graph message to the specific channels", async () => {
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

    const outputGraphSpy = vi
      .spyOn(OutputChannels.prototype, "outputDataGoldPricePeriodGraph")
      .mockImplementationOnce(vi.fn());

    const startDate = new Date("2023-01-01");
    const endDate = new Date("2023-01-07");
    await mainApplication.summarizeGoldPricePeriodWithGraph(
      startDate,
      endDate,
      GoldPriceGraphType.DAY
    );

    expect(graphSpy).toHaveBeenCalledWith(
      startDate,
      endDate,
      GoldPriceGraphType.DAY
    );
    expect(outputGraphSpy).toHaveBeenCalledTimes(1);
  });

  it("should output only message when graph is not available", async () => {
    const graphSpy = vi
      .spyOn(GoldPricePeriodGraph.prototype, "getGoldPricePeriodGraph")
      .mockReturnValueOnce(
        Promise.resolve({
          chartAsBuffer: undefined,
          description: "test",
        })
      );

    const outputGraphSpy = vi
      .spyOn(OutputChannels.prototype, "outputDataGoldPricePeriodGraph")
      .mockImplementationOnce(vi.fn());

    const outputMessageSpy = vi
      .spyOn(OutputChannels.prototype, "outputMessage")
      .mockImplementationOnce(vi.fn());

    const startDate = new Date("2023-01-01");
    const endDate = new Date("2023-01-07");
    await mainApplication.summarizeGoldPricePeriodWithGraph(
      startDate,
      endDate,
      GoldPriceGraphType.DAY
    );

    expect(graphSpy).toHaveBeenCalledWith(
      startDate,
      endDate,
      GoldPriceGraphType.DAY
    );
    expect(outputGraphSpy).not.toHaveBeenCalled();
    expect(outputMessageSpy).toHaveBeenCalledTimes(1);
  });
});

describe("main application: Gold price data recorder service", async () => {
  let mainApplication: MainApplication;

  beforeAll(() => {
    mainApplication = new MainApplication();
  });

  it("should call recordGoldPriceData method from GoldPriceDataRecorder", async () => {
    // Setup the spy on the GoldPriceDataRecorder
    const recordGoldPriceDataSpy = vi
      .spyOn(GoldPriceDataRecorder.prototype, "recordGoldPriceData")
      .mockResolvedValueOnce(undefined);

    // Call the method under test
    await mainApplication.recordGoldPriceData();

    // Verify the GoldPriceDataRecorder was called
    expect(recordGoldPriceDataSpy).toHaveBeenCalledTimes(1);
  });

  it("should handle errors from recordGoldPriceData method", async () => {
    // Setup the spy to throw an error
    const testError = new Error("Test recording error");
    const recordGoldPriceDataSpy = vi
      .spyOn(GoldPriceDataRecorder.prototype, "recordGoldPriceData")
      .mockRejectedValueOnce(testError);

    // Call the method and expect it to throw
    try {
      await mainApplication.recordGoldPriceData();
      // If no error is thrown, fail the test
      expect(true).toBe(false);
    } catch (error) {
      // Verify error was caught
      expect(error).toBe(testError);
    }

    // Verify the method was called despite the error
    expect(recordGoldPriceDataSpy).toHaveBeenCalledTimes(1);
  });
});
