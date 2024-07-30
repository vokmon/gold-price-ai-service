import { CheerioWebBaseLoader } from "@langchain/community/document_loaders/web/cheerio";
import { convert } from "html-to-text";
import { extractInformationPageTemplate } from "../constants/prompt-constants.ts";
import { GoldPriceWebInformation } from "../models/gold-price-information.ts";
import { getCurrentDate } from "../utils/date-utils.ts";
import { getChain } from "../utils/chain.ts";

/**
 * Extracting gold price data from web links.
 */
export default class GoldPriceDataExtractor {
  async extractGoldPriceInformationFromWebLinks(
    resultLinks: string[]
  ): Promise<GoldPriceWebInformation[]> {
    console.group("Fetch web content");
    console.log(`Start fetching data for ${resultLinks.length} links`);

    const webContentResultPromiseList = resultLinks.map(async (link) => {
      return await this.extractGoldPriceInformationFromWebLink(link);
    });

    const webContentResultResultList = await Promise.allSettled(
      webContentResultPromiseList
    );

    const documents = webContentResultResultList
      .filter((result) => result.status === "fulfilled")
      .flatMap((result) => result.value);
    console.log("Result", documents);
    console.groupEnd();
    return documents;
  }

  async extractGoldPriceInformationFromWebLink(
    link: string
  ): Promise<GoldPriceWebInformation> {
    const currentDate = getCurrentDate("th-TH");
    console.log(`Start fetching data for ${link} with time ${currentDate}`);

    const loader = new CheerioWebBaseLoader(link!);
    const docs = await loader.load();

    if (docs && docs[0]) {
      const content = docs[0].pageContent;

      const text = convert(content, {
        wordwrap: 300,
      });

      const chain = await getChain(extractInformationPageTemplate);
      const result = await chain.invoke({ text, currentDate }) as string;
      console.log(`Result of ${link} is ${result}`);
      console.log("\n");
      return {
        link,
        result,
      };
    }

    return {
      link,
      result: "",
    };
  }
}
