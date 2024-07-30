import { GoldPriceSummary } from "../../../models/gold-price-summary.ts";
import { OutputInterface } from "../output-interface.ts";
import { convertSummaryDataToString } from "../output-utils.ts";

export default class TerminalOutput implements OutputInterface {
  async output(summary: GoldPriceSummary) {
    console.log("Display message to the terminal");
    const message = convertSummaryDataToString(summary);
    console.log(message);
  }
}
