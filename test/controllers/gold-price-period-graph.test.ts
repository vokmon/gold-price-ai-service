import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { GoldPriceGraphType } from "../../src/models/gold-price-graph";
import { Timestamp } from "firebase-admin/firestore";
import GoldPricePeriodGraph from "../../src/controllers/gold-price-period-graph";

// Mock dependencies
vi.mock("../../src/repositories/firebase/firestore/firestore", () => ({
  FirestoreRepo: vi.fn(() => ({
    getDocumentsByDatetime: vi.fn(),
  })),
}));

vi.mock("../../src/services/huasengheng/huasengheng-service", () => ({
  default: vi.fn(() => ({
    getCurrentHuasenghengPrice: vi.fn(),
  })),
}));

vi.mock("../../src/services/graph/generate-price-graph", () => ({
  default: vi.fn(() => ({
    generatePriceGraph: vi.fn(),
  })),
}));

describe("GoldPricePeriodGraph", () => {
  let goldPricePeriodGraph: GoldPricePeriodGraph;
  let mockFirestoreRepo: any;
  let mockHuasengheng: any;
  let mockGeneratePriceGraph: any;
  let consoleSpy: any;

  beforeEach(() => {
    // Save original environment variables
    process.env.FIRESTORE_COLLECTION_PRICE_RECORD = "gold_prices_test";

    // Setup spies
    consoleSpy = {
      log: vi.spyOn(console, "log").mockImplementation(() => {}),
      error: vi.spyOn(console, "error").mockImplementation(() => {}),
    };

    goldPricePeriodGraph = new GoldPricePeriodGraph();

    // Get instances of mocks
    mockFirestoreRepo = (goldPricePeriodGraph as any)._firestoreRepo;
    mockHuasengheng = (goldPricePeriodGraph as any)._huasengheng;
    mockGeneratePriceGraph = (goldPricePeriodGraph as any)._generatePriceGraph;
  });

  afterEach(() => {
    vi.clearAllMocks();
    consoleSpy.log.mockRestore();
    consoleSpy.error.mockRestore();
  });

  describe("getGoldPricePeriodGraph", () => {
    it("should return data with chart for valid date range with data", async () => {
      // Setup mock data
      const startDate = new Date("2023-10-01");
      const endDate = new Date("2023-10-03");
      const graphType = GoldPriceGraphType.DAY;

      const mockGoldPriceData = [
        {
          id: "1",
          Sell: 2000,
          Buy: 2050,
          createdDateTime: Timestamp.fromDate(new Date("2023-10-01T10:00:00Z")),
        },
        {
          id: "2",
          Sell: 2100,
          Buy: 2150,
          createdDateTime: Timestamp.fromDate(new Date("2023-10-02T10:00:00Z")),
        },
        {
          id: "3",
          Sell: 2050,
          Buy: 2100,
          createdDateTime: Timestamp.fromDate(new Date("2023-10-03T10:00:00Z")),
        },
      ];

      const mockImageBuffer = Buffer.from("mock-image-data");

      // Setup mock responses
      mockFirestoreRepo.getDocumentsByDatetime.mockResolvedValue(
        mockGoldPriceData
      );
      mockGeneratePriceGraph.generatePriceGraph.mockResolvedValue(
        mockImageBuffer
      );

      // Execute the method
      const result = await goldPricePeriodGraph.getGoldPricePeriodGraph(
        startDate,
        endDate,
        graphType
      );

      // Verify firestore was called with correct parameters
      expect(mockFirestoreRepo.getDocumentsByDatetime).toHaveBeenCalledWith(
        "gold_prices_test",
        startDate,
        endDate
      );

      // Verify chart generation was called
      expect(mockGeneratePriceGraph.generatePriceGraph).toHaveBeenCalled();

      // Verify returned result
      expect(result).toEqual({
        dataPeriod: {
          startDate,
          endDate,
        },
        chartAsBuffer: mockImageBuffer,
        description: expect.stringContaining("ราคาทองคำ"),
      });
    });

    it("should include huasengheng data when end date is today", async () => {
      // Setup today's date
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      // Setup mock data
      const startDate = new Date(today);
      startDate.setDate(startDate.getDate() - 2); // 2 days ago
      const endDate = new Date(today);
      const graphType = GoldPriceGraphType.DAY;

      const mockGoldPriceData = [
        {
          id: "1",
          Sell: 2000,
          Buy: 2050,
          createdDateTime: Timestamp.fromDate(new Date(startDate)),
        },
      ];

      const mockHuasenghengData = {
        sell: 2100,
        buy: 2150,
        sell_change: 50,
        buy_change: 50,
      };

      const mockImageBuffer = Buffer.from("mock-image-data");

      // Setup mock responses
      mockFirestoreRepo.getDocumentsByDatetime.mockResolvedValue(
        mockGoldPriceData
      );
      mockHuasengheng.getCurrentHuasenghengPrice.mockResolvedValue(
        mockHuasenghengData
      );
      mockGeneratePriceGraph.generatePriceGraph.mockResolvedValue(
        mockImageBuffer
      );

      // Execute the method
      const result = await goldPricePeriodGraph.getGoldPricePeriodGraph(
        startDate,
        endDate,
        graphType
      );

      // Verify huasengheng service was called
      expect(mockHuasengheng.getCurrentHuasenghengPrice).toHaveBeenCalled();

      // Verify chart generation was called
      expect(mockGeneratePriceGraph.generatePriceGraph).toHaveBeenCalled();

      // Verify returned result
      expect(result).toEqual({
        dataPeriod: {
          startDate,
          endDate,
        },
        chartAsBuffer: mockImageBuffer,
        description: expect.stringContaining("ราคาทองคำ"),
      });
    });

    it("should return error message when no data found", async () => {
      // Setup mock data
      const startDate = new Date("2023-12-01");
      const endDate = new Date("2023-12-03");
      const graphType = GoldPriceGraphType.DAY;

      // Return empty data
      mockFirestoreRepo.getDocumentsByDatetime.mockResolvedValue([]);

      // Execute the method
      const result = await goldPricePeriodGraph.getGoldPricePeriodGraph(
        startDate,
        endDate,
        graphType
      );

      // Verify generatePriceGraph was not called
      expect(mockGeneratePriceGraph.generatePriceGraph).not.toHaveBeenCalled();

      // Verify returned result
      expect(result).toEqual({
        dataPeriod: {
          startDate,
          endDate,
        },
        chartAsBuffer: undefined,
        description: expect.stringContaining(
          "❌ ไม่พบข้อมูลราคาทองคำสำหรับช่วงวันที่"
        ),
      });
    });
  });

  describe("prepareChartData", () => {
    it("should correctly prepare chart data with min and max prices", async () => {
      // Mock grouped data
      const groupedData = {
        "01/10/2023": [
          {
            Sell: 2000,
            createdDateTime: Timestamp.fromDate(
              new Date("2023-10-01T08:00:00Z")
            ),
          },
          {
            Sell: 2050,
            createdDateTime: Timestamp.fromDate(
              new Date("2023-10-01T16:00:00Z")
            ),
          },
        ],
        "02/10/2023": [
          {
            Sell: 2100,
            createdDateTime: Timestamp.fromDate(
              new Date("2023-10-02T10:00:00Z")
            ),
          },
        ],
      };

      // Call the private method
      // @ts-ignore - accessing private method for testing
      const result = goldPricePeriodGraph.prepareChartData(
        groupedData,
        GoldPriceGraphType.DAY
      );

      // Verify result
      expect(result).toEqual({
        labels: ["01/10/2023", "02/10/2023"],
        dataArray: [
          [2000, 2050],
          [2100, 2120],
        ], // Second bar has MIN_PRICE_BAR_HEIGHT (20) added
      });
    });

    it("should process HOUR_WITH_DAY format labels correctly", async () => {
      // Mock grouped data with HOUR_WITH_DAY format
      const groupedData = {
        "01/10/2023 10:00": [
          {
            Sell: 2000,
            createdDateTime: Timestamp.fromDate(
              new Date("2023-10-01T10:00:00Z")
            ),
          },
        ],
        "01/10/2023 14:00": [
          {
            Sell: 2050,
            createdDateTime: Timestamp.fromDate(
              new Date("2023-10-01T14:00:00Z")
            ),
          },
        ],
        "02/10/2023 10:00": [
          {
            Sell: 2100,
            createdDateTime: Timestamp.fromDate(
              new Date("2023-10-02T10:00:00Z")
            ),
          },
        ],
      };

      // Call the private method
      // @ts-ignore - accessing private method for testing
      const result = goldPricePeriodGraph.prepareChartData(
        groupedData,
        GoldPriceGraphType.HOUR_WITH_DAY
      );

      // Verify result - for the second label of the same day, only time should be shown
      expect(result.labels).toEqual([
        "01/10/2023 10:00",
        "14:00",
        "02/10/2023 10:00",
      ]);
    });
  });

  describe("extractPriceData", () => {
    it("should correctly extract price data with min, max, and price difference", async () => {
      // Mock gold price data
      const goldPriceData = [
        {
          Sell: 2000,
          createdDateTime: Timestamp.fromDate(new Date("2023-10-01T10:00:00Z")),
        },
        {
          Sell: 2050,
          createdDateTime: Timestamp.fromDate(new Date("2023-10-02T10:00:00Z")),
        },
        {
          Sell: 2100,
          createdDateTime: Timestamp.fromDate(new Date("2023-10-03T10:00:00Z")),
        },
      ];

      // Call the private method
      // @ts-ignore - accessing private method for testing
      const result = goldPricePeriodGraph.extractPriceData(goldPriceData);

      // Verify result
      expect(result).toEqual({
        minPrice: 2000,
        maxPrice: 2100,
        priceDifference: 100, // 2100 - 2000
        earliestPrice: 2000,
        latestPrice: 2100,
      });
    });

    it("should return default values for empty data", async () => {
      // Call the private method with empty data
      // @ts-ignore - accessing private method for testing
      const result = goldPricePeriodGraph.extractPriceData([]);

      // Verify result
      expect(result).toEqual({
        minPrice: 0,
        maxPrice: 0,
        priceDifference: 0,
        earliestPrice: 0,
        latestPrice: 0,
      });
    });
  });
});
