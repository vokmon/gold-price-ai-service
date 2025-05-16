import { describe, it, vi, beforeAll, expect } from "vitest";
import OutputChannels from "../../src/controllers/output-channels";
import TerminalOutput from "../../src/services/outputs/impl/terminal-output";
import { GoldPriceSummary } from "../../src/models/gold-price-summary";
import { getCurrentDateTime } from "../../src/utils/date-utils";
import { huasengsengPriceData2 } from "../mock-data/huasengheng-data";
import { convertSummaryDataToString } from "../../src/services/outputs/output-utils";
import { goldPricePeriodSummary } from "../mock-data/gold-price-period-summary-mocked-data";

describe("send the summary information to the defined channels", async () => {
  let outputChannels: OutputChannels;
  let terminalOutput: TerminalOutput;

  beforeAll(() => {
    terminalOutput = new TerminalOutput();
    outputChannels = new OutputChannels([terminalOutput]);
  });

  it("should output the summary data to the given channel", async () => {
    const outputSpy = vi.spyOn(terminalOutput, "outputMessage");

    const summary: GoldPriceSummary = {
      currentPrice: { buy: 40650, sell: 40650 },
      predictions: [
        "ราคาทองคำวันนี้อาจจะปรับตัวสูงขึ้นเล็กน้อย  📈",
        "เนื่องจากราคาทองคำเมื่อวานนี้ปรับตัวขึ้น +23.1 ดอลลาร์ คิดเป็น +0.97% 💰",
      ],
      information: [
        "ราคาทองคำเมื่อวานนี้ (28 กรกฎาคม 2567) ปิดตลาดที่ระดับ 2,387 ดอลลาร์",
        "Gold spot สูงสุด - 2,390 ดอลลาร์ ต่ำสุด – 2,355 ดอลลาร์",
        "ราคาทองคำแท่งสูงสุด – 40,650 บาท ต่ำสุด 40,650 บาท",
      ],
      suggestions: [
        "ติดตามข่าวสารเศรษฐกิจและการเมืองอย่างใกล้ชิด เพราะอาจมีผลต่อราคาทองคำ 📰",
        "พิจารณาซื้อขายทองคำตามความเสี่ยงที่คุณยอมรับได้  ⚖️",
      ],
      hasEnoughData: true,
      createdDate: new Date(),
    };

    const message = convertSummaryDataToString(summary);
    await outputChannels.outputData(summary);
    expect(outputSpy).toHaveBeenCalled();
  });

  it("should output message string", async () => {
    const outputMessageSpy = vi.spyOn(terminalOutput, "outputMessage");
    await outputChannels.outputDataPriceAlert({
      priceAlert: true,
      currentPrice: huasengsengPriceData2,
      priceDiff: 200,
      lastCheckTime: getCurrentDateTime("th-TH"),
    });
    expect(outputMessageSpy).toHaveBeenCalledTimes(1);
  });

  it("should not output message if current price is undefined", async () => {
    const outputMessageSpy = vi.spyOn(terminalOutput, "outputMessage");
    await outputChannels.outputDataPriceAlert({
      priceAlert: false,
      currentPrice: undefined,
      priceDiff: undefined,
      lastCheckTime: getCurrentDateTime("th-TH"),
    });
    expect(outputMessageSpy).not.toHaveBeenCalled();
  });

  it("should output gold price period summary", async () => {
    const outputMessageSpy = vi.spyOn(terminalOutput, "outputMessage");
    await outputChannels.outputDataGoldPricePeriodSummary(
      goldPricePeriodSummary
    );
    expect(outputMessageSpy).toHaveBeenCalled();
  });

  it("should output gold price period graph", async () => {
    const outputGraphSpy = vi.spyOn(terminalOutput, "outputImage");
    await outputChannels.outputDataGoldPricePeriodGraph({
      chartAsBuffer: Buffer.from("test"),
      description: "test",
      dataPeriod: {
        startDate: new Date("2023-01-01"),
        endDate: new Date("2023-01-07"),
      },
    });
    expect(outputGraphSpy).toHaveBeenCalled();
  });

  it("should not output graph if chartAsBuffer is undefined", async () => {
    const outputGraphSpy = vi.spyOn(terminalOutput, "outputImage");
    await outputChannels.outputDataGoldPricePeriodGraph({
      chartAsBuffer: undefined,
      description: "test",
      dataPeriod: {
        startDate: new Date("2023-01-01"),
        endDate: new Date("2023-01-07"),
      },
    });
    expect(outputGraphSpy).not.toHaveBeenCalled();
  });

  it("should output message to all channels", async () => {
    const outputMessageSpy = vi.spyOn(terminalOutput, "outputMessage");
    await outputChannels.outputMessage("test");
    expect(outputMessageSpy).toHaveBeenCalled();
  });
});
