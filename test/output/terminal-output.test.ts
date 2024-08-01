import { describe, it } from "vitest";
import TerminalOutput from "../../src/services/outputs/impl/terminal-output";
import { goldPriceSummary } from "../mock-data/gold-price-summary";

describe("Output summary data to channels", async () => {
  let terminalOutput: TerminalOutput;
  
  beforeAll(() => {
    terminalOutput = new TerminalOutput();
  });

  it("should output data to terminal", async () => {
    terminalOutput.output(goldPriceSummary);
  }); // increase timeout
});
