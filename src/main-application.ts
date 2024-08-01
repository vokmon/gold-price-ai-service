import GoldPriceDataSummarization from "./controllers/gold-price-data-summarization.ts";
import OutputChannels from "./controllers/output-channels.ts";
import LineNotifyOutput from "./services/outputs/impl/line-output.ts";
import TerminalOutput from "./services/outputs/impl/terminal-output.ts";
import { OutputInterface } from "./services/outputs/output-interface.ts";
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
  _outputChannels: OutputChannels;

  constructor(goldPriceDataSummarization?: GoldPriceDataSummarization, outputChannels?: OutputInterface[]) {
    this._goldPriceDataSummarization = goldPriceDataSummarization || new GoldPriceDataSummarization();
    this._outputChannels = new OutputChannels(outputChannels || [
        new TerminalOutput(),
        new LineNotifyOutput(),
      ]);
  }

  async runProcess(numberOfRun: number = 1) {
    console.log(`Base timeout: ${this.baseTimeoutTime}`);
    const label = `Gold Price AI Service ${getCurrentDate("en-UK")}, number of run: ${numberOfRun}`;
    console.log(label);
    console.time(label);
  
    const summary = await this._goldPriceDataSummarization.getGoldPriceSummary();
    if (!summary.hasEnoughData) {
      console.log("No information about the gold price to be outputed.", summary);
      if (numberOfRun > this.MAX_RETRY) {
        console.log("Reach maximum retry");
        return;
      }
      
      const timeout = this.baseTimeoutTime * numberOfRun;
      console.log(`Try again in ${timeout / 1000} seconds`)
      setTimeout(async () => {
        await this.runProcess(numberOfRun + 1);
      }, timeout);
  
      return;
    }
    
    await this._outputChannels.outputData(summary);
    console.timeEnd(label);
    console.timeLog(`Process ${label} finished.\n`);
  }
}
