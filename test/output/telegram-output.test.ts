import { describe, it, expect, beforeAll, afterAll, vi } from "vitest";
import TelegramOutput from "../../src/services/outputs/impl/telegram-output";
import { goldPriceSummary } from "../mock-data/gold-price-summary";
import { convertSummaryDataToString } from "../../src/services/outputs/output-utils";

describe("Output summary data to channels", async () => {
  let telegramOutput: TelegramOutput;

  beforeAll(() => {
    telegramOutput = new TelegramOutput();
  });

  it("should not output data to telegram", async () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch").mockImplementation(vi.fn());
    const message = convertSummaryDataToString(goldPriceSummary);
    telegramOutput.outputMessage(message);
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it("should not output image to telegram", async () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch").mockImplementation(vi.fn());
    const imageBuffer = Buffer.from("test_image_buffer", "utf-8");
    const description = "test_image_description";
    telegramOutput.outputImage(imageBuffer, description);
    expect(fetchSpy).not.toHaveBeenCalled();
  });
});

describe("Output summary data to channels with ENV", async () => {
  let telegramOutput: TelegramOutput;
  let envCache;

  beforeAll(() => {
    envCache = process.env;
    process.env.TELEGRAM_BOT_TOKEN = "test_bot_token";
    process.env.TELEGRAM_CHANNEL_IDS =
      '[{"channelId":"xxxxxx","description":"test channel"}]';
    telegramOutput = new TelegramOutput();
  });

  it("should output message to telegram notify", async () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch").mockImplementation(vi.fn());
    const message = convertSummaryDataToString(goldPriceSummary);
    telegramOutput.outputMessage(message);
    expect(fetchSpy).toHaveBeenCalled();
  });

  it("should output image to telegram notify", async () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch").mockImplementation(vi.fn());
    const imageBuffer = Buffer.from("test_image_buffer", "utf-8");
    const description = "test_image_description";
    telegramOutput.outputImage(imageBuffer, description);
    expect(fetchSpy).toHaveBeenCalled();
  });

  it("should output toString", async () => {
    const result = telegramOutput.toString();
    expect(result).toBeDefined();
  });

  afterAll(() => {
    process.env = envCache;
  });
});
