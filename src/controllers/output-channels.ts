import {
  GoldPriceAlert,
  GoldPriceSummary,
} from "~/models/gold-price-summary.ts";
import { OutputInterface } from "../services/outputs/output-interface.ts";
import { convertHuasenghengDataToString } from "~/services/outputs/output-utils.ts";

export default class OutputChannels {
  _channels;
  constructor(channels: OutputInterface[]) {
    this._channels = channels;
  }

  async outputData(summary: GoldPriceSummary) {
    console.log(
      `Start sending the summary to ${this._channels.length} channels.`
    );
    const promises = this._channels.map(async (channel) => {
      await channel.output(summary);
      return channel;
    });
    const results = await Promise.allSettled(promises);
    console.log("Output result: ", results);
  }

  async outputDataPriceAlert(priceAlert: GoldPriceAlert) {
    console.log(
      `Start sending the price alert to ${this._channels.length} channels.`
    );
    const message = convertHuasenghengDataToString(
      priceAlert.currentPrice,
      priceAlert.priceDiff,
      priceAlert.lastCheckTime
    );
    const promises = this._channels.map(async (channel) => {
      await channel.outputMessage(message);
      return channel;
    });
    const results = await Promise.allSettled(promises);
    console.log("Output result: ", results);
  }
}
