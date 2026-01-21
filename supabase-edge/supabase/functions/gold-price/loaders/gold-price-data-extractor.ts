import { convert } from "https://esm.sh/html-to-text";
import { extractInformationPageTemplate } from "../prompt-constants.ts";
import { GoldPriceWebInformation } from "../types/gold-price-information.type.ts";
import { getCurrentDate, getFormattedDate } from "../utils/date-utils.ts";
import { GoogleAIService } from "../ai/google-ai.service.ts";
import { WebContentLoader } from "./web-content-loader.ts";
/**
 * Extracting gold price data from web links.
 */
export default class GoldPriceDataExtractor {
  async extractGoldPriceInformationFromWebLinks(
    resultLinks: string[],
    startDate?: Date,
    endDate?: Date
  ): Promise<GoldPriceWebInformation[]> {
    console.group("Fetch web content");
    console.log(`🌐 Start fetching data for ${resultLinks.length} links`);

    const webContentResultPromiseList = resultLinks.map(async (link) => {
      return await this.extractGoldPriceInformationFromWebLink(
        link,
        startDate,
        endDate
      );
    });

    const webContentResultResultList = await Promise.allSettled(
      webContentResultPromiseList
    );

    const documents = webContentResultResultList
      .filter((result) => result.status === "fulfilled")
      .flatMap((result) => result.value);
    console.log("🌐 Result", documents);
    console.groupEnd();
    return documents;
  }

  async extractGoldPriceInformationFromWebLink(
    link: string,
    startDate?: Date,
    endDate?: Date
  ): Promise<GoldPriceWebInformation> {
    try {
      let dateRange = getCurrentDate("th-TH");
      if (startDate && endDate) {
        dateRange = `${getFormattedDate(startDate)} - ${getFormattedDate(
          endDate
        )}`;
      }
      console.log(`🌐 Start fetching data for ${link} with time ${dateRange}`);

      const loader = new WebContentLoader(link!);
      const docs = await loader.load();

      if (docs && docs[0]) {
        const content = docs[0].pageContent;

        const text = convert(content, {
          wordwrap: 300,
          // Explicitly ignore script and style tags
          ignoreHref: false,
          ignoreImage: false,
          // Remove selectors that might contain CSS/JS
          selectors: [
            { selector: "script", format: "skip" },
            { selector: "style", format: "skip" },
            { selector: "noscript", format: "skip" },
          ],
        });

        // Additional cleanup: remove any remaining CSS variable patterns and excessive whitespace
        const cleanedText = text
          .replace(/:root\s*\{[^}]*\}/gi, "") // Remove :root CSS blocks
          .replace(/--[a-zA-Z0-9-]+:\s*[^;]+;/g, "") // Remove CSS variable declarations
          .replace(/\{[^}]*\}/g, "") // Remove any remaining CSS blocks
          .replace(/\s+/g, " ") // Replace multiple whitespace with single space
          .trim();

        // Reduce the number of calls to the AI service to save cost
        // const result = await GoogleAIService.getInstance().generateFromTemplate(
        //   extractInformationPageTemplate,
        //   {
        //     text,
        //     dateRange: dateRange,
        //   }
        // );

        // console.log(`🌐 Result of ${link} is ${result}`);
        // return {
        //   link,
        //   result,
        // };
        return {
          link,
          result: cleanedText,
        };
      }

      return {
        link,
        result: "",
      };
    } catch (e) {
      console.error(e);
      return {
        link,
        result: "",
      };
    }
  }
}
