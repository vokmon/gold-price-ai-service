import { GoldPriceSummary } from "~/models/gold-price-summary.ts";
import { OutputInterface } from "../services/outputs/output-interface.ts";

export default class OutputChannels {
  _channels;
  constructor(channels: OutputInterface[]) {
    this._channels = channels;
  }

  async outputData(summary: GoldPriceSummary) {
    if (!summary.hasEnoughData) {
      console.log("No information about the gold price to be outputed.", summary);
      return;
    }

    console.log(`Start sending the summary to ${this._channels.length} channels.`);
    const promises = this._channels.map(async (channel) => {
      await channel.output(summary);
      return channel;
    })
    const results = await Promise.allSettled(promises);
    console.log("Output result: ", results)
  }
}
