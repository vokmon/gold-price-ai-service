import { getChain } from "../utils/chain.ts";
import { getCurrentDate } from "../utils/date-utils.ts";
import { summaryPageTemplate } from "../constants/prompt-constants.ts";
import { GoldPriceSummary } from "../models/gold-price-summary.ts";
import { JsonOutputParser } from "@langchain/core/output_parsers";

export default class GoldPriceDataSummarization {
  async summarizeGoldPriceDataByContext(
    context: string
  ): Promise<GoldPriceSummary> {
    console.log(`Summarizing data with context\n${context}`);
    const currentDate = getCurrentDate("th-TH");
    const chain = await getChain(
      summaryPageTemplate,
      new JsonOutputParser<GoldPriceSummary>()
    );

    const result = await chain.invoke({ context, currentDate });
    const summary: GoldPriceSummary = {
      ...(result as GoldPriceSummary),
      createdDate: new Date(),
    };
    return summary;
  }
}
