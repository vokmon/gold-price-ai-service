import { GoldPriceAlert } from "../types/gold-price-summary.type.ts";
import { OutputInterface } from "./output-interface.ts";
import { convertHuasenghengDataToString } from "../utils/output-utils.ts";

export default class OutputChannels {
  _channels;
  constructor(channels: OutputInterface[]) {
    this._channels = channels;
  }

  async outputDataPriceAlert(priceAlert: GoldPriceAlert) {
    console.log(
      `Start sending the price alert to ${this._channels.length} channels.`
    );
    if (!priceAlert.currentPrice) {
      console.log("Price difference is undefined, skipping the output.");
      return;
    }
    const message = convertHuasenghengDataToString(
      priceAlert.currentPrice,
      priceAlert.priceDiff,
      priceAlert.lastCheckTime
    );
    const promises = this._channels.map(async (channel) => {
      await channel.outputMessage(message, priceAlert);
      return channel.toString();
    });
    const results = await Promise.allSettled(promises);
    console.log("Output result: ", results);
  }
}
