import WebLinkSearcher from "./web-link-searcher.ts";
import { getAdditionalLinks } from "../utils/url.ts";

/**
 * to collect web links related to gold prices from various online sources.
 */
export default class GoldPriceRelatedWebLinksRetreiver {
  keywordsList = (
    Deno.env.get("SEARCH_KEYWORD") ||
    "'คาดการณ์ราคาทองคำวันที่','วิเคราะห์ราคาทอง','แนวโน้มทองคำไทยวันนี้'"
  ).split(",");

  excludedDomains = (
    Deno.env.get("EXCLUDE_DOMAINS") ||
    "intergold.co.th,huasengheng.com,youtube.com,goldtraders.or.th,goldshopping.huasengheng.com,xn--42cah7d0cxcvbbb9x.com,ylgbullion.co.th"
  ).split(",");

  /**
   * To perform gold-price related search on the internet
   */
  async getGoldPriceLinks() {
    console.group("🔍 Search web related to the keywords", this.keywordsList);
    const webLinkSearcher = new WebLinkSearcher(this.excludedDomains);

    let links: string[] = [];
    try {
      links = await webLinkSearcher.searchByKeywords(
        this.keywordsList,
        "today"
      );
    } catch (e) {
      console.warn(e);
    }

    const additionalLinks = getAdditionalLinks();
    const finalLinks = [...links, ...additionalLinks];

    console.log("🔗 Links to search: ", finalLinks);
    console.groupEnd();
    return finalLinks;
  }
}
