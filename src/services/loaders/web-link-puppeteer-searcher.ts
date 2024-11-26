import puppeteer from "puppeteer";

// Declaration
export default class WebLinkPuppeteerSearcher {
  sertApiKey = process.env.SERP_API_KEY;
  excludedDomains: string[];

  constructor(excludedDomains: string[]) {
    this.excludedDomains = excludedDomains;
  }

  async searchByKeywords(keywords: string[], additionalKeyword: string = ''): Promise<string[]> {
    const browser = await puppeteer.launch({ 
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--no-first-run',
        '--no-zygote',
        '--single-process',
        '--disable-gpu'
      ]
    });

    const searchPromises = keywords.map(async (keyword, index) => {
      const page = await browser.newPage();
      const searchKeyword = `${keyword} ${additionalKeyword}`;
      console.log(`Start Keyword: ${searchKeyword}`);

      await page.goto(
        `https://www.google.com/search?q=${searchKeyword}&location=Thailand&lang=TH`
      );

      await page.type("input[name='q']", searchKeyword);
      await page.keyboard.press("Enter");

      // Wait for results to load
      await page.waitForSelector("#search");

      // Extract URLs from search results
      const links = await page.$$eval("a", (anchors) =>
        // Ignore test coverage here. For some reason, it cannot detect this.
        /* v8 ignore next */
        anchors.map((anchor) => anchor.href)
      );

      const result = links.filter((href: any) => {
        const isValidUrl =
          href &&
          href.trim().length > 0 &&
          href.startsWith("http") &&
          href.startsWith("http") &&
          !href.includes("google");
        if (!isValidUrl) {
          return false;
        }
        const url = new URL(href);
        const domain = url.hostname.replace("www.", "");
        return !this.excludedDomains.some(
          (excludedDomain) =>
            domain === excludedDomain || domain.endsWith(`.${excludedDomain}`)
        );
      });
      console.log(`Result of Keyword: ${searchKeyword}`, result);
      await page.close();
      return result;
    });

    const searchResults = await Promise.allSettled(searchPromises);

    const resultLinks = searchResults
      .filter((result) => result.status === "fulfilled")
      .flatMap((result) => result.value);

    const uniqueList = Array.from(new Set(resultLinks));
    return uniqueList;
  }
}
