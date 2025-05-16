import GoldPriceDataSummarization from "./controllers/gold-price-data-summarization.ts";
import GoldPriceMonitoring from "./controllers/gold-price-monitoring.ts";
import OutputChannels from "./controllers/output-channels.ts";
import FirestoreOutput from "./services/outputs/impl/firestore-output.ts";
import TelegramOutput from "./services/outputs/impl/telegram-output.ts";
import TerminalOutput from "./services/outputs/impl/terminal-output.ts";
import GoldPricePeriodSummary from "./controllers/gold-price-period-summary.ts";
import GoldPricePeriodGraph from "./controllers/gold-price-period-graph.ts";
import { GoldPriceDataRecorder } from "./controllers/gold-price-data-recorder.ts";
import { GoldPriceGraphType } from "./models/gold-price-graph.ts";
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
  baseTimeoutTime = process.env.TEST === "true" ? 100 : 1000 * 60 * 60;
  FIRESTORE_COLLECTION_SUMMARY = process.env.FIRESTORE_COLLECTION_SUMMARY!;
  FIRESTORE_COLLECTION_ALERT = process.env.FIRESTORE_COLLECTION_PRICE_ALERT!;
  FIRESTORE_COLLECTION_PERIOD_SUMMARY =
    process.env.FIRESTORE_COLLECTION_PERIOD_SUMMARY!;

  _goldPriceDataSummarization: GoldPriceDataSummarization;
  _goldPriceMonitoring: GoldPriceMonitoring;
  _goldPricePeriodSummary: GoldPricePeriodSummary;
  _goldPricePeriodGraph: GoldPricePeriodGraph;
  _goldPriceDataRecorder: GoldPriceDataRecorder;

  constructor() {
    this._goldPriceDataSummarization = new GoldPriceDataSummarization();
    this._goldPriceMonitoring = new GoldPriceMonitoring();
    this._goldPricePeriodSummary = new GoldPricePeriodSummary();
    this._goldPricePeriodGraph = new GoldPricePeriodGraph();
    this._goldPriceDataRecorder = new GoldPriceDataRecorder();
  }

  async runProcess() {
    console.log("\n");
    console.log(`Base timeout: ${this.baseTimeoutTime}`);
    const label = `🏁🏁🏁 Gold Price AI Service ${new Date()}`;
    console.log(label);
    console.time(label);

    const startDate = new Date();
    startDate.setHours(0, 0, 0, 0);
    const endDate = new Date();

    const summary =
      await this._goldPriceDataSummarization.getGoldPriceSummary();

    if (summary) {
      const outputChannels = new OutputChannels([
        new TerminalOutput(),
        new TelegramOutput(),
        new FirestoreOutput(this.FIRESTORE_COLLECTION_SUMMARY),
      ]);
      await outputChannels.outputData(summary);

      const graph = await this._goldPricePeriodGraph.getGoldPricePeriodGraph(
        startDate,
        endDate,
        GoldPriceGraphType.HOUR
      );

      if (graph.chartAsBuffer) {
        const outputChannels = new OutputChannels([new TelegramOutput()]);
        await outputChannels.outputDataGoldPricePeriodGraph(graph);
      }
    }

    console.timeEnd(label);
    console.timeLog(`🏁🏁🏁 Process ${label} finished.`);
    console.log("\n");
  }

  async monitorPrice(priceTreshold: number) {
    console.log("\n");
    const label = `🔔🔔🔔 Gold Price Monitoring Service: ${new Date()} with threshold of ${priceTreshold}`;
    console.log(label);
    console.time(label);

    const result = await this._goldPriceMonitoring.monitorPrice(priceTreshold);
    if (result.priceAlert) {
      console.log("🔔🔔🔔 Price alert triggered.");
      const outputChannels = new OutputChannels([
        new TerminalOutput(),
        new TelegramOutput(),
        new FirestoreOutput(this.FIRESTORE_COLLECTION_ALERT),
      ]);
      await outputChannels.outputDataPriceAlert(result);
    } else {
      console.log(
        `🔔🔔🔔 Does not need to alert as the price change does not hit the threshold`
      );
    }

    console.timeEnd(label);
    console.timeLog(`🔔🔔🔔 Process ${label} finished.`);
    console.log("\n");
  }

  async summarizeGoldPricePeriod(startDate: Date, endDate: Date) {
    console.log("\n");
    const label = `🔖🔖🔖 Gold Price Period Summary Service: ${new Date()} with start date of ${startDate} and end date of ${endDate}`;
    console.log(label);
    console.time(label);

    const [summary, graph] = await Promise.all([
      this._goldPricePeriodSummary.summarizeGoldPricePeriod(startDate, endDate),
      this._goldPricePeriodGraph.getGoldPricePeriodGraph(
        startDate,
        endDate,
        GoldPriceGraphType.DAY
      ),
    ]);

    console.log("🔖🔖🔖 Gold Price Period Summary: ", summary);

    const outputChannels = new OutputChannels([
      new TerminalOutput(),
      new TelegramOutput(),
      new FirestoreOutput(this.FIRESTORE_COLLECTION_PERIOD_SUMMARY),
    ]);

    console.log("🔖🔖🔖 Gold Price Period Graph: ", graph);
    await outputChannels.outputDataGoldPricePeriodSummary(summary);
    if (graph.chartAsBuffer) {
      await outputChannels.outputDataGoldPricePeriodGraph(graph);
    }

    console.timeEnd(label);
    console.timeLog(`🔖🔖🔖 Process ${label} finished.`);
    console.log("\n");
  }

  async summarizeGoldPricePeriodWithGraph(
    startDate: Date,
    endDate: Date,
    graphType: GoldPriceGraphType
  ) {
    console.log("\n");
    const label = `💹💹💹 Gold Price Period Price Graph Summary Service: ${new Date()} with start date of ${startDate} and end date of ${endDate} and graph type of ${graphType}`;
    console.log(label);
    console.time(label);

    const graph = await this._goldPricePeriodGraph.getGoldPricePeriodGraph(
      startDate,
      endDate,
      graphType
    );

    const outputChannels = new OutputChannels([
      new TerminalOutput(),
      new TelegramOutput(),
    ]);

    if (graph.chartAsBuffer) {
      await outputChannels.outputDataGoldPricePeriodGraph(graph);
    } else {
      await outputChannels.outputMessage(graph.description);
    }

    console.timeEnd(label);
    console.timeLog(`💹💹💹Process ${label} finished.`);
    console.log("\n");
  }

  async recordGoldPriceData() {
    console.log("\n");
    const label = `🧈🧈🧈 Gold Price Data Recorder Service: ${new Date()}`;
    console.log(label);
    console.time(label);

    await this._goldPriceDataRecorder.recordGoldPriceData();

    console.timeEnd(label);
    console.timeLog(`🧈🧈🧈 Process ${label} finished.`);
    console.log("\n");
  }
}
