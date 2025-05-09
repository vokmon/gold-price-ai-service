import {
  beforeEach,
  describe,
  expect,
  it,
  beforeAll,
  afterAll,
  vi,
} from "vitest";
import { test_data } from "../mock-data/gold-price-test-data";
import GoldPriceRelatedWebLinksRetreiver from "../../src/controllers/gold-price-related-web-links-retreiver";
import { isValidUrl } from "../../src/utils/url";
import { mockSerpApi } from "../test-utils/mock-serpapi";
import WebLinkPuppeteerSearcher from "../../src/services/loaders/web-link-puppeteer-searcher";
describe("retreive website links related to the gold price", async () => {
  let goldPriceRelatedWebLinksRetreiver: GoldPriceRelatedWebLinksRetreiver;
  let mock;

  beforeAll(() => {
    goldPriceRelatedWebLinksRetreiver = new GoldPriceRelatedWebLinksRetreiver();
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
      await goldPriceRelatedWebLinksRetreiver.getGoldPriceLinks();
    linksToSearch.forEach((url) => {
      expect(isValidUrl(url)).toBe(true);
    });
  }, 5000);
});

describe("retreive website links related to the gold price with env", async () => {
  let goldPriceRelatedWebLinksRetreiver: GoldPriceRelatedWebLinksRetreiver;
  let mock;
  let envCache;

  beforeAll(() => {
    envCache = process.env;
    process.env.SEARCH_KEYWORD = "";
    goldPriceRelatedWebLinksRetreiver = new GoldPriceRelatedWebLinksRetreiver();
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
      await goldPriceRelatedWebLinksRetreiver.getGoldPriceLinks();
    linksToSearch.forEach((url) => {
      expect(isValidUrl(url)).toBe(true);
    });
  }, 5000);

  it("should get only additional links when exception is thrown", async () => {
    const getLinksSpy = vi
      .spyOn(WebLinkPuppeteerSearcher.prototype, "searchByKeywords")
      .mockRejectedValueOnce(new Error("Test search by keyword error"));

    const linksToSearch =
      await goldPriceRelatedWebLinksRetreiver.getGoldPriceLinks();
    expect(linksToSearch.length).toBe(4);
  });

  afterAll(() => {
    process.env = envCache;
  });
});
