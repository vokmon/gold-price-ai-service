import { describe, it, vi, beforeEach, expect } from "vitest";
import GoldPricePeriodSummary from "../../src/controllers/gold-price-period-summary";
import { FirestoreRepo } from "../../src/repositories/firestore/firestore";
import GoldPriceDataExtractor from "../../src/controllers/gold-price-data-extractor";
import Huasengheng from "../../src/services/huasengheng/huasengheng-service";
import { getChain } from "../../src/utils/chain";
import * as urlUtils from "../../src/utils/url";
import {
  GoldPriceAlert,
  GoldPriceSummary,
} from "../../src/models/gold-price-summary";
import { HuasenghengDataType } from "../../src/models/huasengheng";
import { GoldPricePeriodSummaryModel } from "../../src/models/gold-price-period-summary";
import { goldPriceAlertMockedData1 } from "../mock-data/gold-price-alert-mocked-data";
import { goldPriceSummary } from "../mock-data/gold-price-summary";
import { huasengsengPriceData1 } from "../mock-data/huasengheng-data";
import { GoldPriceWebInformation } from "../../src/models/gold-price-information";
import { RunnableSequence } from "@langchain/core/runnables";

// Mock dependencies
vi.mock("../../src/repositories/firestore/firestore");
vi.mock("../../src/controllers/gold-price-data-extractor");
vi.mock("../../src/services/huasengheng/huasengheng-service");
vi.mock("../../src/utils/chain");
vi.mock("../../src/utils/url");
vi.mock("@langchain/core/runnables");

describe("GoldPricePeriodSummary", () => {
  let goldPricePeriodSummary: GoldPricePeriodSummary;
  let mockFirestoreRepo: FirestoreRepo;
  let mockGoldPriceDataExtractor: GoldPriceDataExtractor;
  let mockHuasengheng: Huasengheng;

  // Mock data
  const mockStartDate = new Date("2023-01-01");
  const mockEndDate = new Date("2023-01-07");

  const mockSummariesData: GoldPriceSummary[] = [goldPriceSummary];
  const mockAlertsData: GoldPriceAlert[] = [goldPriceAlertMockedData1];

  const mockGoldPriceInfo: GoldPriceWebInformation[] = [
    {
      link: "https://example.com",
      result: "Gold prices are expected to rise due to economic uncertainty",
    },
  ];

  const mockCurrentPrice: HuasenghengDataType = huasengsengPriceData1;

  const mockSummaryResult: GoldPricePeriodSummaryModel = {
    summaries: ["Gold price has increased by 500 baht over the week"],
    predictions: ["Gold price is expected to continue rising"],
  };

  beforeEach(() => {
    // Reset mocks before each test
    vi.clearAllMocks();

    // Setup mock implementations
    mockFirestoreRepo = {
      getDocumentsByDatetime: vi.fn(),
    } as unknown as FirestoreRepo;

    mockGoldPriceDataExtractor = {
      extractGoldPriceInformationFromWebLinks: vi.fn(),
    } as unknown as GoldPriceDataExtractor;

    mockHuasengheng = {
      getCurrentHuasenghengPrice: vi.fn(),
    } as unknown as Huasengheng;

    // Setup proper mocks for each module
    vi.mocked(FirestoreRepo).mockImplementation(() => mockFirestoreRepo);
    vi.mocked(GoldPriceDataExtractor).mockImplementation(
      () => mockGoldPriceDataExtractor
    );
    vi.mocked(Huasengheng).mockImplementation(() => mockHuasengheng);

    // Mock environment variables
    process.env.FIRESTORE_COLLECTION_SUMMARY = "gold-price-summaries";
    process.env.FIRESTORE_COLLECTION_PRICE_ALERT = "gold-price-alerts";

    // Create instance with mocked dependencies
    goldPricePeriodSummary = new GoldPricePeriodSummary();
  });

  it("should summarize gold price period successfully", async () => {
    // Setup mock return values
    vi.mocked(mockFirestoreRepo.getDocumentsByDatetime).mockImplementation(
      (collection, start, end) => {
        if (collection === "gold-price-summaries") {
          return Promise.resolve(mockSummariesData);
        } else if (collection === "gold-price-alerts") {
          return Promise.resolve(mockAlertsData);
        }
        return Promise.resolve([]);
      }
    );

    vi.mocked(
      mockGoldPriceDataExtractor.extractGoldPriceInformationFromWebLinks
    ).mockResolvedValue(mockGoldPriceInfo);
    vi.mocked(mockHuasengheng.getCurrentHuasenghengPrice).mockResolvedValue(
      mockCurrentPrice
    );

    vi.spyOn(urlUtils, "getArticleLinks").mockReturnValue([
      "https://example.com",
    ]);

    // Create a proper mock for RunnableSequence
    const mockInvoke = vi.fn().mockResolvedValue(mockSummaryResult);
    const mockRunnableSequence = {
      invoke: mockInvoke,
      // Add required properties from RunnableSequence
      first: null,
      middle: [],
      last: null,
      omitSequenceTags: false,
    } as unknown as RunnableSequence;

    // Mock the getChain function to return our mock RunnableSequence
    vi.mocked(getChain).mockResolvedValue(mockRunnableSequence);

    // Execute the method being tested
    const result = await goldPricePeriodSummary.summarizeGoldPricePeriod(
      mockStartDate,
      mockEndDate
    );

    // Assertions
    expect(mockFirestoreRepo.getDocumentsByDatetime).toHaveBeenCalledTimes(2);
    expect(mockFirestoreRepo.getDocumentsByDatetime).toHaveBeenCalledWith(
      "gold-price-summaries",
      mockStartDate,
      mockEndDate
    );
    expect(mockFirestoreRepo.getDocumentsByDatetime).toHaveBeenCalledWith(
      "gold-price-alerts",
      mockStartDate,
      mockEndDate
    );

    expect(
      mockGoldPriceDataExtractor.extractGoldPriceInformationFromWebLinks
    ).toHaveBeenCalledWith(["https://example.com"]);

    expect(mockHuasengheng.getCurrentHuasenghengPrice).toHaveBeenCalled();

    expect(mockInvoke).toHaveBeenCalledWith({
      summariesText: expect.any(String),
      alertsText: expect.any(String),
      goldPriceInformationText: expect.any(String),
      currentPrice: expect.any(String),
    });

    // Check the final result structure
    expect(result).toEqual({
      startDate: mockStartDate,
      endDate: mockEndDate,
      summary: mockSummaryResult,
      currentPrice: mockCurrentPrice,
    });
  });

  it("should handle empty data from repositories", async () => {
    // Setup mock return values for empty data
    vi.mocked(mockFirestoreRepo.getDocumentsByDatetime).mockResolvedValue([]);
    vi.mocked(
      mockGoldPriceDataExtractor.extractGoldPriceInformationFromWebLinks
    ).mockResolvedValue([]);
    vi.mocked(mockHuasengheng.getCurrentHuasenghengPrice).mockResolvedValue(
      mockCurrentPrice
    );

    vi.spyOn(urlUtils, "getAdditionalLinks").mockReturnValue([
      "https://example.com",
    ]);

    // Create a proper mock for RunnableSequence
    const mockInvoke = vi.fn().mockResolvedValue(mockSummaryResult);
    const mockRunnableSequence = {
      invoke: mockInvoke,
      // Add required properties from RunnableSequence
      first: null,
      middle: [],
      last: null,
      omitSequenceTags: false,
    } as unknown as RunnableSequence;

    // Mock the getChain function to return our mock RunnableSequence
    vi.mocked(getChain).mockResolvedValue(mockRunnableSequence);

    // Execute the method being tested
    const result = await goldPricePeriodSummary.summarizeGoldPricePeriod(
      mockStartDate,
      mockEndDate
    );

    // Assertions
    expect(mockInvoke).toHaveBeenCalled();

    expect(result).toEqual({
      startDate: mockStartDate,
      endDate: mockEndDate,
      summary: mockSummaryResult,
      currentPrice: mockCurrentPrice,
    });
  });

  it("should filter out empty goldPriceInformation results", async () => {
    // Setup mock return values with some empty information
    vi.mocked(mockFirestoreRepo.getDocumentsByDatetime).mockImplementation(
      (collection) => {
        if (collection === "gold-price-summaries") {
          return Promise.resolve(mockSummariesData);
        } else {
          return Promise.resolve(mockAlertsData);
        }
      }
    );

    const mixedGoldPriceInfo: GoldPriceWebInformation[] = [
      { link: "https://example1.com", result: "Useful information" },
      { link: "https://example2.com", result: "" },
      { link: "https://example3.com", result: "  " },
      { link: "https://example4.com", result: "''" },
      { link: "https://example5.com", result: "More useful information" },
    ];

    vi.mocked(
      mockGoldPriceDataExtractor.extractGoldPriceInformationFromWebLinks
    ).mockResolvedValue(mixedGoldPriceInfo);
    vi.mocked(mockHuasengheng.getCurrentHuasenghengPrice).mockResolvedValue(
      mockCurrentPrice
    );

    vi.spyOn(urlUtils, "getAdditionalLinks").mockReturnValue([
      "https://example.com",
    ]);

    // Create a proper mock for RunnableSequence
    const mockInvoke = vi.fn().mockResolvedValue(mockSummaryResult);
    const mockRunnableSequence = {
      invoke: mockInvoke,
      // Add required properties from RunnableSequence
      first: null,
      middle: [],
      last: null,
      omitSequenceTags: false,
    } as unknown as RunnableSequence;

    // Mock the getChain function to return our mock RunnableSequence
    vi.mocked(getChain).mockResolvedValue(mockRunnableSequence);

    // Execute the method being tested
    await goldPricePeriodSummary.summarizeGoldPricePeriod(
      mockStartDate,
      mockEndDate
    );

    // The filtered goldPriceInformation should only contain non-empty items
    expect(mockInvoke).toHaveBeenCalledWith(
      expect.objectContaining({
        goldPriceInformationText: expect.stringContaining("Useful information"),
      })
    );

    // The filtered text should not contain the empty items
    const invokeArg = mockInvoke.mock.calls[0][0];
    expect(invokeArg.goldPriceInformationText).not.toContain("''");
    expect(invokeArg.goldPriceInformationText).toContain("Useful information");
    expect(invokeArg.goldPriceInformationText).toContain(
      "More useful information"
    );
  });

  it("should handle errors from dependencies", async () => {
    // Setup mock to throw an error
    vi.mocked(mockFirestoreRepo.getDocumentsByDatetime).mockRejectedValue(
      new Error("Database connection error")
    );

    // Execute and verify the method throws the expected error
    await expect(
      goldPricePeriodSummary.summarizeGoldPricePeriod(
        mockStartDate,
        mockEndDate
      )
    ).rejects.toThrow("Database connection error");
  });

  it("should correctly convert data to text", () => {
    // Access the private method using type assertion
    const convertToText = (goldPricePeriodSummary as any).convertToText.bind(
      goldPricePeriodSummary
    );

    // Test with different data types
    expect(convertToText({ key: "value" })).toBe("{key:value}");
    expect(convertToText([1, 2, 3])).toBe("[1,2,3]");
    expect(convertToText("Already a string")).toBe("Already a string");
    expect(convertToText(null)).toBe("");
    expect(convertToText(undefined)).toBe("");
  });
});
