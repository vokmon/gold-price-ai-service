import {
  GoldPriceAlert,
  GoldPriceSummary,
} from "~/models/gold-price-summary.ts";
import { OutputInterface } from "../services/outputs/output-interface.ts";
import {
  convertHuasenghengDataToString,
  convertSummaryDataToString,
} from "~/services/outputs/output-utils.ts";

export default class OutputChannels {
  _channels;
  constructor(channels: OutputInterface[]) {
    this._channels = channels;
  }

  async outputData(summary: GoldPriceSummary) {
    console.log(
      `Start sending the summary to ${this._channels.length} channels.`
    );
    const message = convertSummaryDataToString(summary);
    const promises = this._channels.map(async (channel) => {
      await channel.outputMessage(message, summary);
      return channel.toString();
    });
    const results = await Promise.allSettled(promises);
    console.log("Output result: ", results);
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
