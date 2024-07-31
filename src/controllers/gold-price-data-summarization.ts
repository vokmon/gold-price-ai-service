import { getChain } from "../utils/chain.ts";
import { getCurrentDate } from "../utils/date-utils.ts";
import { summaryPageTemplate } from "../constants/prompt-constants.ts";
import { GoldPriceSummary } from "../models/gold-price-summary.ts";
import { JsonOutputParser } from "@langchain/core/output_parsers";
import { GoldPrice } from "../models/huasengheng.ts";

export default class GoldPriceDataSummarization {
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
}
