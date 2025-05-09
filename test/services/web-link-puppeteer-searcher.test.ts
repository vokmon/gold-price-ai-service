import { Page } from "puppeteer";
import WebLinkPuppeteerSearcher from "../../src/services/loaders/web-link-puppeteer-searcher";
import { isValidUrl } from "../../src/utils/url";
import { vi, beforeAll, it, expect } from "vitest";
describe("retreive website links by given keywords by using Puppateer", async () => {
  let webLinkSearcher: WebLinkPuppeteerSearcher;

  beforeAll(() => {
    webLinkSearcher = new WebLinkPuppeteerSearcher([
      "intergold.co.th",
      "huasengheng.com",
      "youtube.com",
      "goldtraders.or.th",
      "goldshopping.huasengheng.com",
    ]);
  });

  it("should get list of urls", async () => {
    const linksToSearch = await webLinkSearcher.searchByKeywords([
      "คาดการณ์ราคาทองคำวันที่",
    ]);
    expect(linksToSearch.length).toBeGreaterThan(0);
    linksToSearch.forEach((url) => {
      expect(isValidUrl(url)).toBe(true);
    });
  }, 5000);

  it("should return empty list when exception is thrown", async () => {
    const pageSpy = vi
      .spyOn(Array.prototype, "filter")
      .mockRejectedValueOnce(new Error("Test puppeteer error"));

    const linksToSearch = await webLinkSearcher.searchByKeywords([
      "คาดการณ์ราคาทองคำวันที่",
    ]);
    expect(linksToSearch.length).toBe(0);
    expect(pageSpy).toHaveBeenCalled();
  });
});
