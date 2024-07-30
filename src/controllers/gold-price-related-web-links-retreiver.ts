import WebLinkSearcher from "../services/loaders/web-link-searcher.ts";
import { getAdditionalLinks } from "../utils/url.ts";

/**
 * to collect web links related to gold prices from various online sources.
 */
export default class GoldPriceRelatedWebLinksRetreiver {
  keywordsList = (process.env.SEARCH_KEYWORD || "'คาดการณ์ราคาทองคำวันที่','วิเคราะห์ราคาทอง','แนวโน้มทองคำไทยวันนี้'").split(',');

  excludedDomains = ["intergold.co.th", "huasengheng.com", "youtube.com"];

  /**
   * To perform gold-price related search on the internet
   */
  async getGoldPriceLinks() {
    console.group("Search web related to the keywords", this.keywordsList);
    const webLinkSearcher = new WebLinkSearcher(this.excludedDomains);

    const links = await webLinkSearcher.searchByKeywords(this.keywordsList);
    const additionalLinks = getAdditionalLinks();
    const finalLinks = [...links, ...additionalLinks];

    console.log("Links to search: ", finalLinks);
    console.groupEnd();
    return finalLinks;
  }
}
