import {
  GoldPriceAlert,
  GoldPriceSummary,
} from "~/models/gold-price-summary.ts";
import { FirestoreRepo } from "~/repositories/firestore/firestore.ts";
import GoldPriceDataExtractor from "./gold-price-data-extractor.ts";
import { getArticleLinks } from "~/utils/url.ts";
import Huasengheng from "~/services/huasengheng/huasengheng-service.ts";
import { getChain } from "~/utils/chain.ts";
import { goldPriceInformationTemplate } from "~/constants/prompt-constants.ts";
import { JsonOutputParser } from "@langchain/core/output_parsers";
import {
  GoldPricePeriodSummaryInfo,
  GoldPricePeriodSummaryModel,
} from "~/models/gold-price-period-summary.ts";
import { getFormattedDate } from "~/utils/date-utils.ts";
export default class GoldPricePeriodSummary {
  private _firestoreRepo: FirestoreRepo;
  private _goldPriceDataExtractor;
  private _huasengheng;

  private FIRESTORE_COLLECTION_SUMMARY =
    process.env.FIRESTORE_COLLECTION_SUMMARY!;
  private FIRESTORE_COLLECTION_ALERT =
    process.env.FIRESTORE_COLLECTION_PRICE_ALERT!;

  constructor() {
    this._firestoreRepo = new FirestoreRepo();
    this._goldPriceDataExtractor = new GoldPriceDataExtractor();
    this._huasengheng = new Huasengheng();
  }

  async summarizeGoldPricePeriod(
    startDate: Date,
    endDate: Date
  ): Promise<GoldPricePeriodSummaryInfo> {
    console.log(
      `Summarizing gold price period from ${getFormattedDate(
        startDate
      )} to ${getFormattedDate(endDate)}`
    );
    const [summariesData, alertsData, goldPriceInformation, currentPrice] =
      await Promise.all([
        this._firestoreRepo.getDocumentsByDatetime<GoldPriceSummary>(
          this.FIRESTORE_COLLECTION_SUMMARY,
          startDate,
          endDate
        ),
        this._firestoreRepo.getDocumentsByDatetime<GoldPriceAlert>(
          this.FIRESTORE_COLLECTION_ALERT,
          startDate,
          endDate
        ),
        this._goldPriceDataExtractor.extractGoldPriceInformationFromWebLinks(
          getArticleLinks(startDate, endDate)
        ),
        this._huasengheng.getCurrentHuasenghengPrice(),
      ]);

    const goldPriceInformationFiltered = goldPriceInformation.filter(
      (info) =>
        info.result && info.result.trim().replace(/["'`\n\r]/g, "") !== ""
    );

    console.log("Found summaries: ", summariesData.length);
    console.log("Found alerts: ", alertsData.length);
    console.log("Gold price information: ", goldPriceInformationFiltered);
    console.log("Current price: ", currentPrice);

    const chain = await getChain(
      goldPriceInformationTemplate,
      new JsonOutputParser<GoldPricePeriodSummaryModel>()
    );

    const result = await chain.invoke({
      summariesText: this.convertToText(summariesData),
      alertsText: this.convertToText(alertsData),
      goldPriceInformationText: this.convertToText(
        goldPriceInformationFiltered
      ),
      currentPrice: this.convertToText(currentPrice),
    });

    console.log("Summary Result: ", result);

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
}
