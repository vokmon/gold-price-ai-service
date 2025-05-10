import { GoldPriceSummary } from "../../../models/gold-price-summary.ts";
import { OutputInterface } from "../output-interface.ts";
import { convertSummaryDataToString } from "../output-utils.ts";

export default class TerminalOutput implements OutputInterface {
  async outputMessage(message: string) {
    console.log("Display message to the terminal");
    console.log(message);
  }

  async outputImage(_imageBuffer: Buffer, description: string) {
    console.log("Display image to the terminal for image: ", description);
  }

  toString() {
    return "TerminalOutput";
  }
}
