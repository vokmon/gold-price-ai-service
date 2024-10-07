import { describe, it, expect, beforeAll, afterAll, vi } from "vitest";
import TelegramOutput from "../../src/services/outputs/impl/telegram-output";
import { goldPriceSummary } from "../mock-data/gold-price-summary";
import * as OutputUtils from "../../src/services/outputs/output-utils";

describe("Output summary data to channels", async () => {
  let telegramOutput: TelegramOutput;
  

  beforeAll(() => {
    telegramOutput = new TelegramOutput();
  });

  it("should not output data to line notify", async () => {
    const convertSummaryDataToStringSpy = vi.spyOn(OutputUtils, 'convertSummaryDataToString');
    telegramOutput.output(goldPriceSummary);
    expect(convertSummaryDataToStringSpy).toHaveBeenCalledTimes(0);
  });
});

describe("Output summary data to channels with ENV", async () => {
  let telegramOutput: TelegramOutput;
  let envCache;

  beforeAll(() => {
    envCache = process.env;
    process.env.TELEGRAM_BOT_TOKEN="test_bot_token"
    process.env.TELEGRAM_CHANNEL_IDS='[{"channelId":"xxxxxx","description":"test channel"}]';
    telegramOutput = new TelegramOutput();
  });


  it("should output data to telegram notify", async () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch").mockImplementation(vi.fn());
    telegramOutput.output(goldPriceSummary);
    expect(fetchSpy).toHaveBeenCalled();
  });
  afterAll(()=> {
    process.env = envCache;
  })
});
