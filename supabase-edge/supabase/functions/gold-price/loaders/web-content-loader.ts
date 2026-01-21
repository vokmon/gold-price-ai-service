import cheerio from "https://esm.sh/cheerio@1.0.0-rc.12";

export class WebContentLoader {
  private url: string;

  constructor(url: string) {
    this.url = url;
  }

  async load() {
    try {
      // Fetch the web content
      const response = await fetch(this.url, {
        headers: {
          // Add a user agent to avoid being blocked by some websites
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
        },
      });

      if (!response.ok) {
        throw new Error(
          `⚠️ Failed to fetch ${this.url}: ${response.status} ${response.statusText}`
        );
      }

      // Get the HTML content
      const html = await response.text();

      // Load the HTML content with Cheerio
      const $ = cheerio.load(html);

      // Remove script, style, and other non-content elements
      $("script, style, noscript, iframe, embed, object, svg").remove();
      
      // Remove elements with style attributes that might contain CSS
      $("[style]").removeAttr("style");
      
      // Extract the text content from the HTML
      const pageContent = $("body").text();

      // Return a document object similar to LangChain's format
      return [
        {
          pageContent,
          metadata: {
            source: this.url,
          },
        },
      ];
    } catch (error) {
      console.log(`🌐 Error loading ${this.url}:`, error);
      return [];
    }
  }
}
