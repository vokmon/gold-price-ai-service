import { getCurrentDate } from "../utils/date-utils.ts";
import { summaryPageTemplate } from "../prompt-constants.ts";
import { GoldPriceSummary } from "../types/gold-price-summary.type.ts";
import { GoldPrice } from "../types/huasengheng.type.ts";
import GoldPriceRelatedWebLinksRetreiver from "../loaders/gold-price-related-web-links-retreiver.ts";
import GoldPriceDataExtractor from "../loaders/gold-price-data-extractor.ts";
import Huasengheng from "../services/huasengheng-service.ts";
import { convertSummaryDataToString } from "../utils/output-utils.ts";
import TelegramOutput from "../outputs/impl/telegram-output.ts";
import OutputChannels from "../outputs/output-channels.ts";
import FirestoreOutput from "../outputs/impl/firestore-output.ts";
import { GoogleAIService } from "../ai/google-ai.service.ts";

export default class GoldPriceDataSummarization {
  private _goldPriceRelatedWebLinksRetreiver;
  private _goldPriceDataExtractor;
  private _huasengheng;

  private GOLD_PRICE_SUMMARY_COLLECTION_NAME = "gold_price_summary";

  constructor() {
    this._goldPriceRelatedWebLinksRetreiver =
      new GoldPriceRelatedWebLinksRetreiver();
    this._goldPriceDataExtractor = new GoldPriceDataExtractor();
    this._huasengheng = new Huasengheng();
  }

  async getGoldPriceSummary(): Promise<GoldPriceSummary | undefined> {
    const marketStatus = await this._huasengheng.getMarketStatus();
    console.log("🛒 Market status: ", marketStatus);

    if (marketStatus.MarketStatus !== "ON") {
      console.log("🔴 Market is off. No price summary.");
      return undefined;
    }

    const links =
      await this._goldPriceRelatedWebLinksRetreiver.getGoldPriceLinks();
    const promises = await Promise.all([
      this._huasengheng.getCurrentHuasenghengPrice(),
      this._goldPriceDataExtractor.extractGoldPriceInformationFromWebLinks(
        links
      ),
    ]);

    const huasenghengInformation = promises[0];
    const goldPriceInformation = promises[1];

    const information = goldPriceInformation
      .map((info) => info.result)
      .join("\n");
    const goldPriceHsh: GoldPrice = {
      buy: Number(huasenghengInformation?.Buy),
      sell: Number(huasenghengInformation?.Sell),
    };
    const result = await this.summarizeGoldPriceDataByContext(
      information,
      goldPriceHsh
    );

    await this.outputGoldPriceSummary(result);

    return result;
  }

  async summarizeGoldPriceDataByContext(
    context: string,
    currentGoldPrice?: GoldPrice
  ): Promise<GoldPriceSummary> {
    console.log(`📝 Summarizing data with context\n${context}`);
    const currentDate = getCurrentDate("th-TH");

    const currentGoldPriceString = currentGoldPrice
      ? `** The current 96.5% gold price is Buy: ${currentGoldPrice.buy.toLocaleString()}, Sell: ${currentGoldPrice.sell.toLocaleString()}`
      : "";

    const result = await GoogleAIService.getInstance().generateFromTemplate(
      summaryPageTemplate,
      {
        context: `${currentGoldPriceString}\n${context}`,
        currentDate,
      }
    );

    console.log(`📝 Result of summarization: ${result}`);

    let summary: GoldPriceSummary = {
      ...(result as GoldPriceSummary),
      createdDate: new Date(),
    };

    if (currentGoldPrice) {
      summary = {
        ...summary,
        currentPrice: {
          ...currentGoldPrice,
        },
      };
    }
    return summary;
  }

  async outputGoldPriceSummary(summary: GoldPriceSummary) {
    const message = convertSummaryDataToString(summary);
    console.log("🖊️📖✏️📚 Output result: ", message);

    const outputChannels = new OutputChannels([
      new TelegramOutput(),
      new FirestoreOutput(this.GOLD_PRICE_SUMMARY_COLLECTION_NAME),
    ]);
    await outputChannels.outputData(summary);
  }
}
