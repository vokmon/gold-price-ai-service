import GoldPriceDataExtractor from "./controllers/gold-price-data-extractor.ts";
import GoldPriceDataSummarization from "./controllers/gold-price-data-summarization.ts";
import GoldPriceRelatedWebLinksRetreiver from "./controllers/gold-price-related-web-links-retreiver.ts";
import OutputChannels from "./controllers/output-channels.ts";
import Huasengheng from "./services/huasengheng/huasengheng-service.ts";
import LineNotifyOutput from "./services/outputs/impl/line-output.ts";
import TerminalOutput from "./services/outputs/impl/terminal-output.ts";
import { getCurrentDate } from "./utils/date-utils.ts";

/**
 * Maximum number of retry
 */
const MAX_RETRY = 3;

/**
 * Base timeout for retry process
 * The test environment is 100 ms
 * The prod and hand-test is 1 hour
 */
const baseTimeoutTime = process.env.TEST ? 100 : 1000 * 60 * 60;

const getGoldPriceSummary = async () => {
  const goldPriceRelatedWebLinksRetreiver =
    new GoldPriceRelatedWebLinksRetreiver();
  const links = await goldPriceRelatedWebLinksRetreiver.getGoldPriceLinks();
  const goldPriceDataExtractor = new GoldPriceDataExtractor();
  const huasengheng = new Huasengheng();

  const promises = await Promise.all([
    huasengheng.getCurrentPriceString(),
    goldPriceDataExtractor.extractGoldPriceInformationFromWebLinks(links),
  ]);

  const huasenghengInformation = promises[0];
  const goldPriceInformation = promises[1];

  const information = goldPriceInformation
    .map((info) => info.result)
    .join("\n");
  const goldPriceDataSummarization = new GoldPriceDataSummarization();
  const result =
    await goldPriceDataSummarization.summarizeGoldPriceDataByContext(
      `${huasenghengInformation}\n${information}`
    );
  return result;
};

export async function runProcess(numberOfRun: number = 1) {
  console.log(`Base timeout: ${baseTimeoutTime}`);
  const label = `Gold Price AI Service ${getCurrentDate("en-UK")}, number of run: ${numberOfRun}`;
  console.log(label);
  console.time(label);

  const summary = await getGoldPriceSummary();
  if (!summary.hasEnoughData) {
    console.log("No information about the gold price to be outputed.", summary);
    if (numberOfRun > MAX_RETRY) {
      console.log("Reach maximu retry");
      return;
    }
    const timeout = baseTimeoutTime * numberOfRun;
    setTimeout(() => {
      runProcess(numberOfRun + 1);
    }, timeout);

    return;
  }
  const outputChannel = new OutputChannels([
    new TerminalOutput(),
    new LineNotifyOutput(),
  ]);

  await outputChannel.outputData(summary);
  console.timeEnd(label);
  console.timeLog(`Process ${label} finished.`);
}

await runProcess();
