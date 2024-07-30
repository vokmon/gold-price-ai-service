import GoldPriceDataExtractor from "./controllers/gold-price-data-extractor.ts";
import GoldPriceDataSummarization from "./controllers/gold-price-data-summarization.ts";
import GoldPriceRelatedWebLinksRetreiver from "./controllers/gold-price-related-web-links-retreiver.ts";
import OutputChannels from "./controllers/output-channels.ts";
import LineNotifyOutput from "./services/outputs/impl/line-output.ts";
import TerminalOutput from "./services/outputs/impl/terminal-output.ts";

const label = "Gold Price AI Service"
console.time(label);
const goldPriceRelatedWebLinksRetreiver = new GoldPriceRelatedWebLinksRetreiver();
const links = await goldPriceRelatedWebLinksRetreiver.getGoldPriceLinks();
const goldPriceDataExtractor = new GoldPriceDataExtractor();
const goldPriceInformation = await goldPriceDataExtractor.extractGoldPriceInformationFromWebLinks(links);
const information = goldPriceInformation.map((info) => info.result).join("\n");
const goldPriceDataSummarization = new GoldPriceDataSummarization();
const result = await goldPriceDataSummarization.summarizeGoldPriceDataByContext(information);

const outputChannel = new OutputChannels([
  new TerminalOutput(),
  new LineNotifyOutput()
]);
await outputChannel.outputData(result);
console.timeEnd(label);
console.timeLog("Process finished.");