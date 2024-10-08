import GoldPriceDataSummarization from "./controllers/gold-price-data-summarization.ts";
import GoldPriceMonitoring from "./controllers/gold-price-monitoring.ts";
import OutputChannels from "./controllers/output-channels.ts";
import LineNotifyOutput from "./services/outputs/impl/line-output.ts";
import TelegramOutput from "./services/outputs/impl/telegram-output.ts";
import TerminalOutput from "./services/outputs/impl/terminal-output.ts";
import { OutputInterface } from "./services/outputs/output-interface.ts";
import { convertHuasenghengDataToString } from "./services/outputs/output-utils.ts";
import { getCurrentDate } from "./utils/date-utils.ts";

export default class MainApplication {
  /**
   * Maximum number of retry
   */
  MAX_RETRY = 2;

  /**
   * Base timeout for retry process
   * The test environment is 100 ms
   * The prod and hand-test is 1 hour
   */
  baseTimeoutTime = process.env.TEST === 'true' ? 100 : 1000 * 60 * 60;
  
  _goldPriceDataSummarization: GoldPriceDataSummarization;
  _goldPriceMonitoring: GoldPriceMonitoring;
  _outputChannels: OutputChannels;

  constructor(goldPriceDataSummarization?: GoldPriceDataSummarization, goldPriceMonitoring?: GoldPriceMonitoring, outputChannels?: OutputInterface[]) {
    this._goldPriceDataSummarization = goldPriceDataSummarization || new GoldPriceDataSummarization();
    this._goldPriceMonitoring = goldPriceMonitoring || new GoldPriceMonitoring();
    this._outputChannels = new OutputChannels(outputChannels || [
        new TerminalOutput(),
        new LineNotifyOutput(),
        new TelegramOutput(),
      ]);
  }

  async runProcess() {
    console.log("\n");
    console.log(`Base timeout: ${this.baseTimeoutTime}`);
    const label = `Gold Price AI Service ${new Date()}`;
    console.log(label);
    console.time(label);
  
    const summary = await this._goldPriceDataSummarization.getGoldPriceSummary();
    await this._outputChannels.outputData(summary);
    console.timeEnd(label);
    console.timeLog(`Process ${label} finished.`);
    console.log("\n");
  }

  async monitorPrice(priceTreshold: number) {
    console.log("\n");
    const label = `Gold Price Monitoring Service: ${new Date()} with threshold of ${priceTreshold}`;
    console.log(label);
    console.time(label);

    const result = await this._goldPriceMonitoring.monitorPrice(priceTreshold);
    if (result.priceAlert) {
      const message = convertHuasenghengDataToString(result.currentPrice, result.priceDiff, result.lastCheckTime);
      await this._outputChannels.outputMessage(message);
    } else {
      console.log(`Does not need to alert as the price change does not hit the threshold`);
    }

    console.timeEnd(label);
    console.timeLog(`Process ${label} finished.`);
    console.log("\n");
  }
}
