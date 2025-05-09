import puppeteer from "puppeteer";

// Declaration
export default class WebLinkPuppeteerSearcher {
  excludedDomains: string[];

  constructor(excludedDomains: string[]) {
    this.excludedDomains = excludedDomains;
  }

  async searchByKeywords(
    keywords: string[],
    additionalKeyword: string = ""
  ): Promise<string[]> {
    try {
      console.log("Launch puppeteer");
      const browser = await puppeteer.launch({
        headless: true,
        args: [
          "--no-sandbox",
          "--disable-setuid-sandbox",
          "--disable-dev-shm-usage",
          "--disable-accelerated-2d-canvas",
          "--no-first-run",
          "--no-zygote",
          "--single-process",
          "--disable-gpu",
          "--window-size=1920,1080",
          "--disable-infobars",
          "--disable-blink-features=AutomationControlled",
          "--disable-extensions",
        ],
      });

      const searchPromises = keywords.map(async (keyword, index) => {
        console.log(`Launch browser for ${keyword}`);
        const page = await browser!.newPage();
        await page.setUserAgent(
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
        );

        // Set default viewport
        await page.setViewport({ width: 1920, height: 1080 });

        const searchKeyword = `${keyword} ${additionalKeyword}`;
        console.log(`Start Keyword: ${searchKeyword}`);

        const response = await page.goto(
          `https://www.google.com/search?q=${searchKeyword}&location=Thailand&lang=TH`
        );

        if (!response?.ok()) {
          console.log("Failed to navigate to Google");
          return [];
        }

        // await page.type("input[name='q']", searchKeyword);
        // await page.keyboard.press("Enter");

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

      await browser.disconnect();
      await browser.close();

      const resultLinks = searchResults
        .filter((result) => result.status === "fulfilled")
        .flatMap((result) => result.value);

      const uniqueList = Array.from(new Set(resultLinks));
      return uniqueList;
    } catch (e) {
      console.log(e);
      return [];
    }
  }
}
