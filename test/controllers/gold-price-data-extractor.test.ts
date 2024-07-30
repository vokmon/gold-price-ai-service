import { describe, it } from "vitest";
import GoldPriceDataExtractor from "../../src/controllers/gold-price-data-extractor";
import { getAdditionalLinks } from "../../src/utils/url";

const timeout = 1000 * 60 * 5; // 5 minutes
describe("extract gold price data from website link", async () => {
  let goldPriceDataExtractor: GoldPriceDataExtractor;
  const links = getAdditionalLinks();

  beforeAll(() => {
    goldPriceDataExtractor = new GoldPriceDataExtractor();
  });

  it("should get gold price related information", async () => {
    const goldPriceInformation =
      await goldPriceDataExtractor.extractGoldPriceInformationFromWebLinks(
        links
      );
    expect(goldPriceInformation.length).toBeGreaterThan(0);
    const information = goldPriceInformation.map((info) => info.result).join("\n");
    expect(information).toBeDefined();
    
  }, timeout); // increate timeout
});
