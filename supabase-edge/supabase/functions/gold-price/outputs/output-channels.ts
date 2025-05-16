import {
  GoldPriceAlert,
  GoldPriceSummary,
} from "../types/gold-price-summary.type.ts";
import { OutputInterface } from "./output-interface.ts";
import {
  convertHuasenghengDataToString,
  convertSummaryDataToString,
  convertGoldPricePeriodSummaryToString,
} from "../utils/output-utils.ts";
import { GoldPricePeriodSummaryInfo } from "../types/gold-price-period-summary.type.ts";
import { GoldPricePeriodGraphData } from "../types/gold-price-period-graph.type.ts";
export default class OutputChannels {
  _channels;
  constructor(channels: OutputInterface[]) {
    this._channels = channels;
  }

  async outputData(summary: GoldPriceSummary) {
    console.log(
      `⌯⌲ Start sending the summary to ${this._channels.length} channels.`
    );
    const message = convertSummaryDataToString(summary);
    const promises = this._channels.map(async (channel) => {
      await channel.outputMessage(message, summary);
      return channel.toString();
    });
    const results = await Promise.allSettled(promises);
    console.log("🎉 Output result: ", results);
  }

  async outputDataPriceAlert(priceAlert: GoldPriceAlert) {
    console.log(
      `⌯⌲ Start sending the price alert to ${this._channels.length} channels.`
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
    console.log("🎉 Output result: ", results);
  }

  async outputDataGoldPricePeriodSummary(
    goldPricePeriodSummary: GoldPricePeriodSummaryInfo
  ) {
    console.log(
      `⌯⌲ Start sending the gold price period summary to ${this._channels.length} channels.`
    );
    const message = convertGoldPricePeriodSummaryToString(
      goldPricePeriodSummary
    );
    const promises = this._channels.map(async (channel) => {
      await channel.outputMessage(message, goldPricePeriodSummary);
      return channel.toString();
    });
    const results = await Promise.allSettled(promises);
    console.log("🎉 Output result: ", results);
  }

  async outputDataGoldPricePeriodGraph(
    goldPricePeriodGraph: GoldPricePeriodGraphData
  ) {
    if (!goldPricePeriodGraph.chartAsBuffer) {
      console.log("Chart buffer is undefined, skipping the output.");
      return;
    }

    console.log(
      `⌯⌲ Start sending the gold price period graph to ${this._channels.length} channels.`
    );
    const promises = this._channels.map(async (channel) => {
      await channel.outputImage(
        goldPricePeriodGraph.chartAsBuffer!,
        goldPricePeriodGraph.description
      );
      return channel.toString();
    });
    const results = await Promise.allSettled(promises);
    console.log("🎉 Output result: ", results);
  }

  async outputMessage(message: string) {
    console.log(
      `⌯⌲ Start sending the message to ${this._channels.length} channels.`
    );
    const promises = this._channels.map(async (channel) => {
      await channel.outputMessage(message);
      return channel.toString();
    });
    const results = await Promise.allSettled(promises);
    console.log("🎉 Output result: ", results);
  }
}
