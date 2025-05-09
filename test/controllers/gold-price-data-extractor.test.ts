import { describe, it, vi, beforeAll, expect } from "vitest";
import GoldPriceDataExtractor from "../../src/controllers/gold-price-data-extractor";
import { getAdditionalLinks } from "../../src/utils/url";
import { CheerioWebBaseLoader } from "@langchain/community/document_loaders/web/cheerio";

const timeout = 1000 * 60 * 5; // 5 minutes
describe("extract gold price data from website link", async () => {
  let goldPriceDataExtractor: GoldPriceDataExtractor;
  const links = getAdditionalLinks();

  beforeAll(() => {
    goldPriceDataExtractor = new GoldPriceDataExtractor();
  });

  it(
    "should get gold price related information",
    async () => {
      const goldPriceInformation =
        await goldPriceDataExtractor.extractGoldPriceInformationFromWebLinks(
          links
        );
      expect(goldPriceInformation.length).toBeGreaterThan(0);
      const information = goldPriceInformation
        .map((info) => info.result)
        .join("\n");
      expect(information).toBeDefined();
    },
    timeout
  ); // increase timeout

  it(
    "should return empty result",
    async () => {
      const runProcessSpy = vi
        .spyOn(CheerioWebBaseLoader.prototype, "load")
        .mockReturnValueOnce(Promise.resolve([]));
      const goldPriceInformation =
        await goldPriceDataExtractor.extractGoldPriceInformationFromWebLink("");
      expect(goldPriceInformation).toBeDefined();
      expect(goldPriceInformation.result).toBe("");
      expect(runProcessSpy).toHaveBeenCalled();
    },
    timeout
  );

  it(
    "should return empty result when exception is thrown",
    async () => {
      const runProcessSpy = vi
        .spyOn(CheerioWebBaseLoader.prototype, "load")
        .mockRejectedValueOnce(new Error("Test Cheerio error"));
      const goldPriceInformation =
        await goldPriceDataExtractor.extractGoldPriceInformationFromWebLink("");
      expect(goldPriceInformation).toBeDefined();
      expect(goldPriceInformation.result).toBe("");
      expect(runProcessSpy).toHaveBeenCalled();
    },
    timeout
  );
});
