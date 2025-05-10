import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import GoldPricePeriodGraph from "../../src/controllers/gold-price-period-graph";

vi.mock("~/repositories/firestore/firestore.ts", () => {
  const mockGetDocumentsByDatetime = vi.fn();

  return {
    FirestoreRepo: vi.fn().mockImplementation(() => {
      return {
        getDocumentsByDatetime: mockGetDocumentsByDatetime,
      };
    }),
  };
});

describe("GoldPricePeriodGraph", () => {
  let goldPricePeriodGraph: GoldPricePeriodGraph;

  // Mock environment variable
  const originalEnv = process.env;

  beforeEach(() => {
    // Set environment variable before creating instance
    process.env.FIRESTORE_COLLECTION_PRICE_ALERT = "test-price-alerts";

    // Clear previous calls to mocks
    vi.clearAllMocks();

    // Create instance
    goldPricePeriodGraph = new GoldPricePeriodGraph();
  });

  afterEach(() => {
    // Restore environment
    process.env = originalEnv;
    vi.restoreAllMocks();
  });

  describe("GoldPricePeriodGraph - no data", () => {
    it("should handle case with no data", async () => {
      // Arrange
      const startDate = new Date("2023-01-01");
      const endDate = new Date("2023-01-07");

      // Mock the getDocumentsByDatetime call to return empty array
      const mockRepo = (goldPricePeriodGraph as any)._firestoreRepo;
      mockRepo.getDocumentsByDatetime.mockResolvedValue([]);

      // Act
      const result = await goldPricePeriodGraph.getGoldPricePeriodGraph(
        startDate,
        endDate
      );

      // Assert
      expect(result).toEqual({
        dataPeriod: {
          startDate,
          endDate,
        },
        chartAsBuffer: undefined,
        description: expect.stringContaining("ไม่พบข้อมูลราคาทองคำ"),
      });
    });
  });
});
