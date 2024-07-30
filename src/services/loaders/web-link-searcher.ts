import { getJson } from "serpapi";
import { getCurrentDate } from "../../utils/date-utils.ts";

// Declaration
export default class WebLinkSearcher {
  sertApiKey = process.env.SERP_API_KEY;
  excludedDomains: string[];

  constructor(excludedDomains: string[]) {
    this.excludedDomains = excludedDomains;
  }

  async searchByKeywords(keywords: string[]): Promise<string[]> {
    const currentDate = getCurrentDate("th-TH");
    const searchPromises = keywords.map(async (keyword, index) => {
      const searchKeyword = `${keyword} ${currentDate}`;
      console.log(`Start Keyword: ${searchKeyword}`);

      const searchResult = await getJson({
        engine: "google",
        api_key: this.sertApiKey,
        q: searchKeyword,
        location: "Thailand",
      });

      const links = searchResult?.organic_results
        .filter((organicResult: any) => {
          const url = new URL(organicResult.link);
          const domain = url.hostname.replace("www.", "");
          return !this.excludedDomains.includes(domain);
        })
        .map((organicResult: any) => organicResult.link);
      console.log(`Result of Keyword: ${searchKeyword}`, links);
      return links;
    });

    const searchResults = await Promise.allSettled(searchPromises);

    const resultLinks = searchResults
      .filter((result) => result.status === "fulfilled")
      .flatMap((result) => result.value);
    return resultLinks;
  }
}
