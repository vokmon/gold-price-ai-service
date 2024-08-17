import { describe, expect, it } from "vitest";
import { isValidUrl, getAdditionalLinks } from "../../src/utils/url";

describe("test isValidUrl", () => {
  it("should return true for valid URLs", () => {
    const validUrls = [
      "https://www.example.com",
      "http://localhost:3000",
      "https://google.com/search?q=something",
    ];

    validUrls.forEach((url) => {
      expect(isValidUrl(url)).toBe(true);
    });
  });

  it("should return false for invalid URLs", () => {
    const invalidUrls = [
      "not a url",
      "http://",
      "www.example.com", // Missing protocol
    ];

    invalidUrls.forEach((url) => {
      expect(isValidUrl(url)).toBe(false);
    });
  });
});

describe("getAdditionalLinks", () => {
  it("should return list of urls", () => {
    const urls = getAdditionalLinks();
    expect(urls).toBeDefined();
    urls.forEach((url) => {
      expect(isValidUrl(url)).toBeTruthy();
    });
  });
});
