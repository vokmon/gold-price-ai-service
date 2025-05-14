// test/controllers/gold-price-period-graph.test.ts
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import GoldPricePeriodGraph from "../../src/controllers/gold-price-period-graph";
import { HuasenghengDataType, HGoldType } from "../../src/models/huasengheng";
import Huasengheng from "../../src/services/huasengheng/huasengheng-service";

// This is a more complete mock of FirestoreRepo
vi.mock("~/repositories/firebase/firestore/firestore.ts", () => {
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
  let huasenghengSpy: ReturnType<typeof vi.spyOn>;

  // Mock environment variable
  const originalEnv = process.env;

  beforeEach(() => {
    // Set environment variable before creating instance
    process.env.FIRESTORE_COLLECTION_PRICE_ALERT = "test-price-alerts";

    // Clear previous calls to mocks
    vi.clearAllMocks();

    // Create instance
    goldPricePeriodGraph = new GoldPricePeriodGraph();

    huasenghengSpy = vi.spyOn(
      Huasengheng.prototype,
      "getCurrentHuasenghengPrice"
    );

    const mockHuasenghengData = createMockHuasenghengData(36999);
    huasenghengSpy.mockResolvedValue(mockHuasenghengData);
  });

  afterEach(() => {
    // Restore environment
    process.env = originalEnv;
    vi.restoreAllMocks();
  });

  describe("getGoldPricePeriodGraph", () => {
    it("should fetch data from Firestore and generate chart", async () => {
      // Arrange
      const startDate = new Date("2023-01-01");
      const endDate = new Date();

      // Create mock data with the structure expected in Firestore documents
      const mockData = [
        {
          createdDateTime: { toDate: () => new Date("2023-01-01T10:00:00") },
          currentPrice: createMockHuasenghengData(35000),
        },
        {
          createdDateTime: { toDate: () => new Date("2023-01-01T14:00:00") },
          currentPrice: createMockHuasenghengData(35500),
        },
        {
          createdDateTime: { toDate: () => new Date("2023-01-02T10:00:00") },
          currentPrice: createMockHuasenghengData(36000),
        },
      ];

      // Mock the getDocumentsByDatetime call
      // We need to access the mock implementation
      const mockRepo = (goldPricePeriodGraph as any)._firestoreRepo;
      mockRepo.getDocumentsByDatetime.mockResolvedValue(mockData);

      // Act
      const result = await goldPricePeriodGraph.getGoldPricePeriodGraph(
        startDate,
        endDate
      );

      // Assert
      expect(mockRepo.getDocumentsByDatetime).toHaveBeenCalledWith(
        "test-price-alerts",
        startDate,
        endDate,
        {
          fields: ["createdDateTime", "currentPrice"],
        }
      );

      expect(result).toEqual({
        dataPeriod: {
          startDate,
          endDate,
        },
        chartAsBuffer: expect.any(Buffer),
        description: expect.stringContaining("ราคาทองคำ"),
      });
    });
  });
});

// Helper function to create a mock HuasenghengDataType object
function createMockHuasenghengData(sellPrice: number): HuasenghengDataType {
  return {
    id: new Date().getTime(),
    Buy: sellPrice - 50,
    Sell: sellPrice,
    TimeUpdate: "2023-01-01T10:00:00",
    BuyChange: 0,
    SellChange: 0,
    StrTimeUpdate: "อัพเดตล่าสุด วันที่ 1 ม.ค. 2566",
  };
}
