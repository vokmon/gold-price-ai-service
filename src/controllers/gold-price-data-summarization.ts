import { getChain } from "../utils/chain.ts";
import { getCurrentDate } from "../utils/date-utils.ts";
import { summaryPageTemplate } from "../constants/prompt-constants.ts";
import { GoldPriceSummary } from "../models/gold-price-summary.ts";
import { JsonOutputParser } from "@langchain/core/output_parsers";
import { GoldPrice } from "../models/huasengheng.ts";
import GoldPriceRelatedWebLinksRetreiver from "./gold-price-related-web-links-retreiver.ts";
import GoldPriceDataExtractor from "./gold-price-data-extractor.ts";
import Huasengheng from "../services/huasengheng/huasengheng-service.ts";

export default class GoldPriceDataSummarization {
  private _goldPriceRelatedWebLinksRetreiver;
  private _goldPriceDataExtractor;
  private _huasengheng;

  constructor() {
    this._goldPriceRelatedWebLinksRetreiver = new GoldPriceRelatedWebLinksRetreiver();
    this._goldPriceDataExtractor = new GoldPriceDataExtractor();
    this._huasengheng = new Huasengheng();
  }

  async summarizeGoldPriceDataByContext(
    context: string,
    currentGoldPrice?: GoldPrice
  ): Promise<GoldPriceSummary> {
    console.log(`Summarizing data with context\n${context}`);
    const currentDate = getCurrentDate("th-TH");
    const chain = await getChain(
      summaryPageTemplate,
      new JsonOutputParser<GoldPriceSummary>()
    );

    const currentGoldPriceString = currentGoldPrice
      ? `** The current 96.5% gold price is Buy: ${currentGoldPrice.buy}, Sell: ${currentGoldPrice.sell}`
      : "";

    const result = await chain.invoke({
      context: `${currentGoldPriceString}\n${context}`,
      currentDate,
    });

    let summary: GoldPriceSummary = {
      ...(result as GoldPriceSummary),
      createdDate: new Date(),
    };

    if (currentGoldPrice) {
      summary = {
        ...summary,
        currentPrice: {
          ...currentGoldPrice,
        }
      };
    }
    return summary;
  }

  async getGoldPriceSummary(): Promise<GoldPriceSummary> {
    const links = await this._goldPriceRelatedWebLinksRetreiver.getGoldPriceLinks();
    const promises = await Promise.all([
      this._huasengheng.getCurrentHuasenghengPrice(),
      this._goldPriceDataExtractor.extractGoldPriceInformationFromWebLinks(links),
    ]);

    const huasenghengInformation = promises[0];
    const goldPriceInformation = promises[1];

    const information = goldPriceInformation
      .map((info) => info.result)
      .join("\n");
    const goldPriceHsh: GoldPrice = {
      buy: Number(huasenghengInformation?.Buy.replaceAll(",", "")),
      sell: Number(huasenghengInformation?.Sell.replaceAll(",", "")),
    };
    const result =
      await this.summarizeGoldPriceDataByContext(
        information,
        goldPriceHsh
      );
    return result;
  }
}
