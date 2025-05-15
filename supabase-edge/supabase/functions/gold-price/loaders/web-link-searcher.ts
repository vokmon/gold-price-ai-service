import { getCurrentDate } from "../utils/date-utils.ts";

// Declaration
export default class WebLinkSearcher {
  apiKey = Deno.env.get("SERPAPI_API_KEY")!;
  excludedDomains: string[];

  constructor(excludedDomains: string[]) {
    this.excludedDomains = excludedDomains;
  }

  async searchByKeywords(
    keywords: string[],
    additionalKeyword: string = ""
  ): Promise<string[]> {
    const currentDate = getCurrentDate("th-TH");
    const searchPromises = keywords.map(async (keyword, index) => {
      const searchKeyword = `${keyword} ${currentDate} ${additionalKeyword}`;
      console.log(`🔍 Start Keyword: ${searchKeyword}`);

      const params = new URLSearchParams({
        engine: "google",
        q: searchKeyword,
        api_key: this.apiKey,
      });

      const response = await fetch(`https://serpapi.com/search.json?${params}`);
      const searchResult = await response.json();

      const links = searchResult?.organic_results
        .filter((organicResult: any) => {
          const url = new URL(organicResult.link);
          const domain = url.hostname.replace("www.", "");
          return !this.excludedDomains.includes(domain);
        })
        .map((organicResult: any) => organicResult.link);
      console.log(`🔍 Result of Keyword: ${searchKeyword}`, links);
      return links;
    });

    const searchResults = await Promise.allSettled(searchPromises);

    const resultLinks = searchResults
      .filter((result) => result.status === "fulfilled")
      .flatMap((result) => result.value);
    return resultLinks;
  }
}
