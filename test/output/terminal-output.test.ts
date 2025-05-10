import { describe, it, beforeAll } from "vitest";
import TerminalOutput from "../../src/services/outputs/impl/terminal-output";
import { goldPriceSummary } from "../mock-data/gold-price-summary";
import { convertSummaryDataToString } from "../../src/services/outputs/output-utils";

describe("Output summary data to channels", async () => {
  let terminalOutput: TerminalOutput;

  beforeAll(() => {
    terminalOutput = new TerminalOutput();
  });

  it("should output data to terminal", async () => {
    const message = convertSummaryDataToString(goldPriceSummary);
    terminalOutput.outputMessage(message);
  }); // increase timeout

  it("should output image to terminal", async () => {
    const image = await terminalOutput.outputImage(
      Buffer.from("imageBuffer", "utf-8"),
      "Test image"
    );
  });
});
