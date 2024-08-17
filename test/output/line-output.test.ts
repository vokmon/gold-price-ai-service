import { describe, it, expect, beforeAll, afterAll, vi } from "vitest";
import LineNotifyOutput from "../../src/services/outputs/impl/line-output";
import { goldPriceSummary } from "../mock-data/gold-price-summary";
import * as OutputUtils from "../../src/services/outputs/output-utils";

describe("Output summary data to channels", async () => {
  let lineNotifyOutput: LineNotifyOutput;
  

  beforeAll(() => {
    lineNotifyOutput = new LineNotifyOutput();
  });

  it("should not output data to line notify", async () => {
    const convertSummaryDataToStringSpy = vi.spyOn(OutputUtils, 'convertSummaryDataToString');
    lineNotifyOutput.output(goldPriceSummary);
    expect(convertSummaryDataToStringSpy).toHaveBeenCalledTimes(0);
  });
});

describe("Output summary data to channels with ENV", async () => {
  let lineNotifyOutput: LineNotifyOutput;
  let envCache;

  beforeAll(() => {
    envCache = process.env;
    process.env.LINE_NOTIFY_TOKENS='[{"token":"xxxxxx","description":"test token"}]';
    lineNotifyOutput = new LineNotifyOutput();
  });


  it("should output data to line notify", async () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch").mockImplementation(vi.fn());
    lineNotifyOutput.output(goldPriceSummary);
    expect(fetchSpy).toHaveBeenCalled();
  });
  afterAll(()=> {
    process.env = envCache;
  })
});
