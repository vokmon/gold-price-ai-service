import GoldPriceDataExtractor from "./controllers/gold-price-data-extractor.ts";
import GoldPriceDataSummarization from "./controllers/gold-price-data-summarization.ts";
import GoldPriceRelatedWebLinksRetreiver from "./controllers/gold-price-related-web-links-retreiver.ts";
import OutputChannels from "./controllers/output-channels.ts";
import Huasengheng from "./services/huasengheng/huasengheng-service.ts";
import LineNotifyOutput from "./services/outputs/impl/line-output.ts";
import TerminalOutput from "./services/outputs/impl/terminal-output.ts";

const label = "Gold Price AI Service";
console.time(label);
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

const information = goldPriceInformation.map((info) => info.result).join("\n");
const goldPriceDataSummarization = new GoldPriceDataSummarization();
const result = await goldPriceDataSummarization.summarizeGoldPriceDataByContext(
  `${huasenghengInformation}\n${information}`
);

const outputChannel = new OutputChannels([
  new TerminalOutput(),
  new LineNotifyOutput(),
]);
await outputChannel.outputData(result);
console.timeEnd(label);
console.timeLog("Process finished.");
