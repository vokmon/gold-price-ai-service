import GoldPriceDataExtractor from "../loaders/gold-price-data-extractor.ts";
import { getArticleLinks } from "../utils/url.ts";
import Huasengheng from "../services/huasengheng-service.ts";
import { goldPriceInformationTemplate } from "../prompt-constants.ts";
import {
  GoldPricePeriodSummaryInfo,
  GoldPricePeriodSummaryModel,
} from "../types/gold-price-period-summary.type.ts";
import { getFormattedDate } from "../utils/date-utils.ts";
import { GoogleAIService } from "../ai/google-ai.service.ts";
import { convertGoldPricePeriodSummaryToString } from "../utils/output-utils.ts";
import OutputChannels from "../outputs/output-channels.ts";
import TelegramOutput from "../outputs/impl/telegram-output.ts";
import FirestoreOutput from "../outputs/impl/firestore-output.ts";

export default class GoldPricePeriodSummary {
  private _goldPriceDataExtractor;
  private _huasengheng;
  private GOLD_PRICE_PERIOD_SUMMARY_COLLECTION_NAME =
    "gold_price_period_summary";

  constructor() {
    this._goldPriceDataExtractor = new GoldPriceDataExtractor();
    this._huasengheng = new Huasengheng();
  }

  async summarizeGoldPricePeriod(
    startDate: Date,
    endDate: Date
  ): Promise<GoldPricePeriodSummaryInfo> {
    console.log(
      `📝 Summarizing gold price period from ${getFormattedDate(
        startDate
      )} to ${getFormattedDate(endDate)}`
    );

    const articleLinks = getArticleLinks(startDate, endDate);
    console.log("🔗 Article links: ", articleLinks);

    const [goldPriceInformation, currentPrice] = await Promise.all([
      this._goldPriceDataExtractor.extractGoldPriceInformationFromWebLinks(
        getArticleLinks(startDate, endDate),
        startDate,
        endDate
      ),
      this._huasengheng.getCurrentHuasenghengPrice(),
    ]);

    const goldPriceInformationFiltered = goldPriceInformation.filter(
      (info) =>
        info.result && info.result.trim().replace(/["'`\n\r]/g, "") !== ""
    );

    console.log("📝🗄️ Gold price information: ", goldPriceInformationFiltered);
    console.log("📝🗄️ Current price: ", currentPrice);

    const result = await GoogleAIService.getInstance().generateFromTemplate(
      goldPriceInformationTemplate,
      {
        goldPriceInformationText: this.convertToText(
          goldPriceInformationFiltered
        ),
        currentPrice: this.convertToText(currentPrice),
      }
    );

    console.log("📝 Summary Result: ", result);

    await this.outputGoldPricePeriodSummary({
      startDate: startDate,
      endDate: endDate,
      summary: result as GoldPricePeriodSummaryModel,
      currentPrice: currentPrice,
    });

    return {
      startDate: startDate,
      endDate: endDate,
      summary: result as GoldPricePeriodSummaryModel,
      currentPrice: currentPrice,
    };
  }

  private convertToText<T>(data: T) {
    return data ? JSON.stringify(data).replace(/["]/g, "") : "";
  }

  async outputGoldPricePeriodSummary(summary: GoldPricePeriodSummaryInfo) {
    const message = convertGoldPricePeriodSummaryToString(summary);
    console.log("🖊️📖✏️📚 Output result: ", message);

    const outputChannels = new OutputChannels([
      new TelegramOutput(),
      new FirestoreOutput(this.GOLD_PRICE_PERIOD_SUMMARY_COLLECTION_NAME),
    ]);
    await outputChannels.outputDataGoldPricePeriodSummary(summary);
  }
}
