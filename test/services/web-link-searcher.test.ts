import { beforeEach, beforeAll, describe, expect, it } from "vitest";
import { test_data } from "../mock-data/gold-price-test-data";
import { isValidUrl } from "../../src/utils/url";
import { mockSerpApi } from "../test-utils/mock-serpapi";
import WebLinkSearcher from "../../src/services/loaders/web-link-searcher";

describe("retreive website links by given keywords", async () => {
  let webLinkSearcher: WebLinkSearcher;
  let mock;

  beforeAll(() => {
    webLinkSearcher = new WebLinkSearcher(["intergold.co.th", "huasengheng.com", "youtube.com"]);
    mock = mockSerpApi();
  });

  beforeEach(() => {
    mock.getJson
      .mockReturnValueOnce(test_data[0])
      .mockReturnValueOnce(test_data[1])
      .mockReturnValueOnce(test_data[2]);
  });

  it("should get list of urls", async () => {
    const linksToSearch =
      await webLinkSearcher.searchByKeywords(['คาดการณ์ราคาทองคำวันที่','วิเคราะห์ราคาทอง','แนวโน้มทองคำไทยวันนี้']);
    linksToSearch.forEach((url) => {
      expect(isValidUrl(url)).toBe(true);
    });
  });
});
