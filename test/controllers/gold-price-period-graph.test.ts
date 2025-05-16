import { describe, it, vi, beforeEach, expect } from "vitest";
import GoldPricePeriodGraph from "../../src/controllers/gold-price-period-graph";
import { GoldPriceDbRepository } from "../../src/repositories/database/gold-price-db-repository";
import Huasengheng from "../../src/services/huasengheng/huasengheng-service";
import GeneratePriceGraph from "../../src/services/graph/generate-price-graph";
import { GoldPriceGraphType } from "../../src/models/gold-price-graph";
import {
  GoldPriceAggregate,
  PriceRangeData,
} from "../../src/models/gold-price";
import { huasengsengPriceData1 } from "../mock-data/huasengheng-data";
import { formatDateAsDDMMYYYY } from "../../src/utils/date-utils";

// Mock dependencies
vi.mock("../../src/repositories/database/gold-price-db-repository");
vi.mock("../../src/services/huasengheng/huasengheng-service");
vi.mock("../../src/services/graph/generate-price-graph");
vi.mock("../../src/utils/date-utils", async () => {
  const actual = await vi.importActual("../../src/utils/date-utils");
  return {
    ...actual,
    getFormattedDate: vi
      .fn()
      .mockImplementation((date) => formatDateAsDDMMYYYY(date)),
    formatDateAsDDMMYYYY: vi.fn().mockImplementation((date) => {
      if (!date) return "";
      return `${date.getDate().toString().padStart(2, "0")}/${(
        date.getMonth() + 1
      )
        .toString()
        .padStart(2, "0")}/${date.getFullYear()}`;
    }),
  };
});

describe("GoldPricePeriodGraph", () => {
  let goldPricePeriodGraph: GoldPricePeriodGraph;
  let mockGoldPriceDbRepo: GoldPriceDbRepository;
  let mockHuasengheng: Huasengheng;
  let mockGeneratePriceGraph: GeneratePriceGraph;

  const mockStartDate = new Date("2023-01-01");
  const mockEndDate = new Date("2023-01-07");
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Mock aggregated data
  const mockAggregatedData: GoldPriceAggregate[] = [
    {
      date_time: new Date("2023-01-01T09:00:00"),
      min_sell: 40000,
      max_sell: 40200,
    },
    {
      date_time: new Date("2023-01-02T09:00:00"),
      min_sell: 40100,
      max_sell: 40300,
    },
    {
      date_time: new Date("2023-01-03T09:00:00"),
      min_sell: 40200,
      max_sell: 40400,
    },
  ];

  // Mock price range data
  const mockPriceRangeData: PriceRangeData = {
    earliest_price: 40000,
    earliest_time: new Date("2023-01-01T09:00:00"),
    latest_price: 40400,
    latest_time: new Date("2023-01-03T09:00:00"),
  };

  // Mock image buffer
  const mockImageBuffer = Buffer.from("mock-image-data");

  beforeEach(() => {
    vi.clearAllMocks();

    // Setup mock implementations
    mockGoldPriceDbRepo = {
      getAggregatedDataByPeriod: vi.fn(),
      getPriceRangeData: vi.fn(),
    } as unknown as GoldPriceDbRepository;

    mockHuasengheng = {
      getCurrentHuasenghengPrice: vi.fn(),
    } as unknown as Huasengheng;

    mockGeneratePriceGraph = {
      generatePriceGraph: vi.fn(),
    } as unknown as GeneratePriceGraph;

    // Setup mock implementations
    vi.mocked(GoldPriceDbRepository).mockImplementation(
      () => mockGoldPriceDbRepo
    );
    vi.mocked(Huasengheng).mockImplementation(() => mockHuasengheng);
    vi.mocked(GeneratePriceGraph).mockImplementation(
      () => mockGeneratePriceGraph
    );

    // Create instance with mocked dependencies
    goldPricePeriodGraph = new GoldPricePeriodGraph();
  });

  describe("getGoldPricePeriodGraph", () => {
    it("should generate a chart with aggregated data", async () => {
      // Setup mock return values
      vi.mocked(
        mockGoldPriceDbRepo.getAggregatedDataByPeriod
      ).mockResolvedValue(mockAggregatedData);
      vi.mocked(mockGoldPriceDbRepo.getPriceRangeData).mockResolvedValue(
        mockPriceRangeData
      );
      vi.mocked(mockGeneratePriceGraph.generatePriceGraph).mockResolvedValue(
        mockImageBuffer
      );

      // End date is not today, so no need to mock huasengheng
      const result = await goldPricePeriodGraph.getGoldPricePeriodGraph(
        mockStartDate,
        mockEndDate,
        GoldPriceGraphType.DAY
      );

      // Verify method calls
      expect(
        mockGoldPriceDbRepo.getAggregatedDataByPeriod
      ).toHaveBeenCalledWith("day", mockStartDate, mockEndDate);
      expect(mockGoldPriceDbRepo.getPriceRangeData).toHaveBeenCalledWith(
        mockStartDate,
        mockEndDate
      );
      expect(mockHuasengheng.getCurrentHuasenghengPrice).not.toHaveBeenCalled();
      expect(mockGeneratePriceGraph.generatePriceGraph).toHaveBeenCalled();

      // Verify result
      expect(result).toEqual({
        dataPeriod: {
          startDate: mockStartDate,
          endDate: mockEndDate,
        },
        chartAsBuffer: mockImageBuffer,
        description: expect.stringContaining(
          `ราคาทองคำ (${formatDateAsDDMMYYYY(
            mockStartDate
          )} - ${formatDateAsDDMMYYYY(mockEndDate)})`
        ),
      });
    });

    it("should include real-time Huasengheng data when end date is today", async () => {
      // Setup mock return values
      vi.mocked(
        mockGoldPriceDbRepo.getAggregatedDataByPeriod
      ).mockResolvedValue(mockAggregatedData);
      vi.mocked(mockGoldPriceDbRepo.getPriceRangeData).mockResolvedValue(
        mockPriceRangeData
      );
      vi.mocked(mockHuasengheng.getCurrentHuasenghengPrice).mockResolvedValue(
        huasengsengPriceData1
      );
      vi.mocked(mockGeneratePriceGraph.generatePriceGraph).mockResolvedValue(
        mockImageBuffer
      );

      // Test with endDate as today
      const result = await goldPricePeriodGraph.getGoldPricePeriodGraph(
        mockStartDate,
        today,
        GoldPriceGraphType.DAY
      );

      // Verify Huasengheng was called
      expect(mockHuasengheng.getCurrentHuasenghengPrice).toHaveBeenCalled();

      // Verify result includes Huasengheng data
      expect(result).toEqual({
        dataPeriod: {
          startDate: mockStartDate,
          endDate: today,
        },
        chartAsBuffer: mockImageBuffer,
        description: expect.stringContaining(
          `ราคาทองคำ (${formatDateAsDDMMYYYY(
            mockStartDate
          )} - ${formatDateAsDDMMYYYY(today)})`
        ),
      });
    });

    it("should handle error from Huasengheng service", async () => {
      // Setup mock return values
      vi.mocked(
        mockGoldPriceDbRepo.getAggregatedDataByPeriod
      ).mockResolvedValue(mockAggregatedData);
      vi.mocked(mockGoldPriceDbRepo.getPriceRangeData).mockResolvedValue(
        mockPriceRangeData
      );
      vi.mocked(mockGeneratePriceGraph.generatePriceGraph).mockResolvedValue(
        mockImageBuffer
      );

      // Mock Huasengheng to throw an error
      vi.mocked(mockHuasengheng.getCurrentHuasenghengPrice).mockRejectedValue(
        new Error("Huasengheng API error")
      );

      // Test with endDate as today to trigger Huasengheng call
      const result = await goldPricePeriodGraph.getGoldPricePeriodGraph(
        mockStartDate,
        today,
        GoldPriceGraphType.DAY
      );

      // Verify Huasengheng was called and error was handled
      expect(mockHuasengheng.getCurrentHuasenghengPrice).toHaveBeenCalled();
      expect(result.chartAsBuffer).toBeDefined(); // Should still generate chart
      expect(result.description).not.toContain("Huasengheng API error"); // Error should be caught
    });

    it("should handle empty data properly", async () => {
      // Return empty data
      vi.mocked(
        mockGoldPriceDbRepo.getAggregatedDataByPeriod
      ).mockResolvedValue([]);
      vi.mocked(mockGoldPriceDbRepo.getPriceRangeData).mockResolvedValue({
        earliest_price: 0,
        earliest_time: new Date(),
        latest_price: 0,
        latest_time: new Date(),
      });
      vi.mocked(mockHuasengheng.getCurrentHuasenghengPrice).mockResolvedValue(
        undefined
      );

      const result = await goldPricePeriodGraph.getGoldPricePeriodGraph(
        mockStartDate,
        mockEndDate,
        GoldPriceGraphType.DAY
      );

      // Verify error message in description
      expect(result.chartAsBuffer).toBeUndefined();
      expect(result.description).toContain("❌ ไม่พบข้อมูลราคาทองคำสำหรับช่วง");
    });

    it("should handle errors gracefully", async () => {
      // Simulate an error
      vi.mocked(
        mockGoldPriceDbRepo.getAggregatedDataByPeriod
      ).mockRejectedValue(new Error("Database error"));

      const result = await goldPricePeriodGraph.getGoldPricePeriodGraph(
        mockStartDate,
        mockEndDate,
        GoldPriceGraphType.DAY
      );

      // Verify error message in description
      expect(result.chartAsBuffer).toBeUndefined();
      expect(result.description).toContain(
        "❌ เกิดข้อผิดพลาดในการดึงข้อมูลราคาทองคำ"
      );
    });

    it("should select the appropriate time period based on graph type", async () => {
      // Setup common mocks
      vi.mocked(mockGoldPriceDbRepo.getPriceRangeData).mockResolvedValue(
        mockPriceRangeData
      );
      vi.mocked(mockGeneratePriceGraph.generatePriceGraph).mockResolvedValue(
        mockImageBuffer
      );
      vi.mocked(
        mockGoldPriceDbRepo.getAggregatedDataByPeriod
      ).mockResolvedValue(mockAggregatedData);

      // Test HOUR graph type
      await goldPricePeriodGraph.getGoldPricePeriodGraph(
        mockStartDate,
        mockEndDate,
        GoldPriceGraphType.HOUR
      );
      expect(
        mockGoldPriceDbRepo.getAggregatedDataByPeriod
      ).toHaveBeenCalledWith("hour", mockStartDate, mockEndDate);
      vi.clearAllMocks();

      // Test MONTH graph type
      vi.mocked(
        mockGoldPriceDbRepo.getAggregatedDataByPeriod
      ).mockResolvedValue(mockAggregatedData);
      vi.mocked(mockGoldPriceDbRepo.getPriceRangeData).mockResolvedValue(
        mockPriceRangeData
      );

      await goldPricePeriodGraph.getGoldPricePeriodGraph(
        mockStartDate,
        mockEndDate,
        GoldPriceGraphType.MONTH
      );
      expect(
        mockGoldPriceDbRepo.getAggregatedDataByPeriod
      ).toHaveBeenCalledWith("month", mockStartDate, mockEndDate);
      vi.clearAllMocks();

      // Test YEAR graph type
      vi.mocked(
        mockGoldPriceDbRepo.getAggregatedDataByPeriod
      ).mockResolvedValue(mockAggregatedData);
      vi.mocked(mockGoldPriceDbRepo.getPriceRangeData).mockResolvedValue(
        mockPriceRangeData
      );

      await goldPricePeriodGraph.getGoldPricePeriodGraph(
        mockStartDate,
        mockEndDate,
        GoldPriceGraphType.YEAR
      );
      expect(
        mockGoldPriceDbRepo.getAggregatedDataByPeriod
      ).toHaveBeenCalledWith("year", mockStartDate, mockEndDate);

      vi.clearAllMocks();

      // Test HOUR_WITH_DAY graph type for line 104-105
      vi.mocked(
        mockGoldPriceDbRepo.getAggregatedDataByPeriod
      ).mockResolvedValue(mockAggregatedData);
      vi.mocked(mockGoldPriceDbRepo.getPriceRangeData).mockResolvedValue(
        mockPriceRangeData
      );

      await goldPricePeriodGraph.getGoldPricePeriodGraph(
        mockStartDate,
        mockEndDate,
        GoldPriceGraphType.HOUR_WITH_DAY
      );
      expect(
        mockGoldPriceDbRepo.getAggregatedDataByPeriod
      ).toHaveBeenCalledWith("hour", mockStartDate, mockEndDate);
    });

    it("should use a specific chart title format for HOUR type", async () => {
      vi.mocked(
        mockGoldPriceDbRepo.getAggregatedDataByPeriod
      ).mockResolvedValue(mockAggregatedData);
      vi.mocked(mockGoldPriceDbRepo.getPriceRangeData).mockResolvedValue(
        mockPriceRangeData
      );
      vi.mocked(mockGeneratePriceGraph.generatePriceGraph).mockResolvedValue(
        mockImageBuffer
      );

      // Test with HOUR type
      await goldPricePeriodGraph.getGoldPricePeriodGraph(
        mockStartDate,
        mockEndDate,
        GoldPriceGraphType.HOUR
      );

      // Verify the chart title format
      expect(mockGeneratePriceGraph.generatePriceGraph).toHaveBeenCalledWith(
        expect.objectContaining({
          chartTitle: expect.stringContaining(
            `ราคาทองคำ (${formatDateAsDDMMYYYY(mockEndDate)})`
          ),
        })
      );
    });
  });

  describe("prepareChartDataFromAggregates", () => {
    it("should properly format labels for DAY type", () => {
      const privateMethod = (
        goldPricePeriodGraph as any
      ).prepareChartDataFromAggregates.bind(goldPricePeriodGraph);

      const result = privateMethod(mockAggregatedData, GoldPriceGraphType.DAY);

      // Check if labels are formatted as DD/MM/YYYY
      expect(result.labels).toEqual([
        formatDateAsDDMMYYYY(new Date("2023-01-01")),
        formatDateAsDDMMYYYY(new Date("2023-01-02")),
        formatDateAsDDMMYYYY(new Date("2023-01-03")),
      ]);

      // Check if data array contains price ranges
      expect(result.dataArray).toEqual([
        [40000, 40200],
        [40100, 40300],
        [40200, 40400],
      ]);
    });

    it("should properly format labels for HOUR type", () => {
      const privateMethod = (
        goldPricePeriodGraph as any
      ).prepareChartDataFromAggregates.bind(goldPricePeriodGraph);

      const result = privateMethod(mockAggregatedData, GoldPriceGraphType.HOUR);

      // Check if labels are formatted as HH:00
      expect(result.labels).toEqual(["9:00", "9:00", "9:00"]);
    });

    it("should add a small buffer for equal min and max prices", () => {
      const privateMethod = (
        goldPricePeriodGraph as any
      ).prepareChartDataFromAggregates.bind(goldPricePeriodGraph);

      const equalPriceData: GoldPriceAggregate[] = [
        {
          date_time: new Date("2023-01-01"),
          min_sell: 40000,
          max_sell: 40000,
        },
      ];

      const result = privateMethod(equalPriceData, GoldPriceGraphType.DAY);

      // There should be a buffer added to display the bar (MIN_PRICE_BAR_HEIGHT = 20)
      expect(result.dataArray[0][0]).toBe(40000 - 20);
      expect(result.dataArray[0][1]).toBe(40000 + 20);
    });

    it("should format labels properly for MONTH type", () => {
      const privateMethod = (
        goldPricePeriodGraph as any
      ).prepareChartDataFromAggregates.bind(goldPricePeriodGraph);

      const monthData: GoldPriceAggregate[] = [
        {
          date_time: new Date("2023-01-15"),
          min_sell: 40000,
          max_sell: 40200,
        },
        {
          date_time: new Date("2023-02-15"),
          min_sell: 40100,
          max_sell: 40300,
        },
      ];

      const result = privateMethod(monthData, GoldPriceGraphType.MONTH);

      // Labels should be formatted as MM/YYYY
      expect(result.labels).toEqual(["1/2023", "2/2023"]);
    });

    it("should format labels properly for YEAR type", () => {
      const privateMethod = (
        goldPricePeriodGraph as any
      ).prepareChartDataFromAggregates.bind(goldPricePeriodGraph);

      const yearData: GoldPriceAggregate[] = [
        {
          date_time: new Date("2022-06-15"),
          min_sell: 40000,
          max_sell: 40200,
        },
        {
          date_time: new Date("2023-06-15"),
          min_sell: 40100,
          max_sell: 40300,
        },
      ];

      const result = privateMethod(yearData, GoldPriceGraphType.YEAR);

      // Labels should be formatted as YYYY
      expect(result.labels).toEqual(["2022", "2023"]);
    });

    it("should process and merge dates for HOUR_WITH_DAY type", () => {
      const privateMethod = (
        goldPricePeriodGraph as any
      ).prepareChartDataFromAggregates.bind(goldPricePeriodGraph);

      const hourlyData: GoldPriceAggregate[] = [
        {
          date_time: new Date("2023-01-01T09:00:00"),
          min_sell: 40000,
          max_sell: 40200,
        },
        {
          date_time: new Date("2023-01-01T10:00:00"),
          min_sell: 40100,
          max_sell: 40300,
        },
        {
          date_time: new Date("2023-01-02T09:00:00"),
          min_sell: 40200,
          max_sell: 40400,
        },
      ];

      const result = privateMethod(
        hourlyData,
        GoldPriceGraphType.HOUR_WITH_DAY
      );

      // First label should have full date+time, subsequent from same day should only have time
      expect(result.labels[0]).toContain("01/01/2023");
      expect(result.labels[1]).not.toContain("01/01/2023");
      expect(result.labels[2]).toContain("02/01/2023");
    });

    it("should handle unexpected format in HOUR_WITH_DAY labels", () => {
      const privateMethod = (
        goldPricePeriodGraph as any
      ).prepareChartDataFromAggregates.bind(goldPricePeriodGraph);

      // Add a record with unexpected date format
      const hourlyDataWithIssue: GoldPriceAggregate[] = [
        {
          date_time: new Date("2023-01-01T09:00:00"),
          min_sell: 40000,
          max_sell: 40200,
        },
        {
          date_time: new Date("Invalid Date"), // This will generate an invalid date
          min_sell: 40100,
          max_sell: 40300,
        },
      ];

      const result = privateMethod(
        hourlyDataWithIssue,
        GoldPriceGraphType.HOUR_WITH_DAY
      );

      // Should not crash with invalid date and return the original label for invalid format
      expect(result.labels.length).toBe(2);
    });
  });

  describe("extractPriceDataWithRangeData", () => {
    it("should extract price data from aggregated data and range data", () => {
      const privateMethod = (
        goldPricePeriodGraph as any
      ).extractPriceDataWithRangeData.bind(goldPricePeriodGraph);

      const result = privateMethod(mockAggregatedData, mockPriceRangeData);

      expect(result).toEqual({
        minPrice: 40000,
        maxPrice: 40400,
        priceDifference: 400,
        latestPrice: 40400,
        earliestPrice: 40000,
      });
    });

    it("should prioritize Huasengheng data when available", () => {
      const privateMethod = (
        goldPricePeriodGraph as any
      ).extractPriceDataWithRangeData.bind(goldPricePeriodGraph);

      const result = privateMethod(
        mockAggregatedData,
        mockPriceRangeData,
        huasengsengPriceData1
      );

      expect(result).toEqual({
        minPrice: 40000,
        maxPrice: 40460, // This comes from huasengsengPriceData1.Sell
        priceDifference: 460, // Difference between huasengsengPriceData1.Sell and earliestPrice
        latestPrice: 40460, // This comes from huasengsengPriceData1.Sell
        earliestPrice: 40000,
      });
    });

    it("should handle empty aggregated data when huasengheng is available", () => {
      const privateMethod = (
        goldPricePeriodGraph as any
      ).extractPriceDataWithRangeData.bind(goldPricePeriodGraph);

      const result = privateMethod(
        [],
        mockPriceRangeData,
        huasengsengPriceData1
      );

      expect(result.latestPrice).toBe(40460); // From huasengsengPriceData1.Sell
      expect(result.minPrice).toBe(40460); // Min should be the only available price
      expect(result.maxPrice).toBe(40460); // Max should be the only available price
    });

    it("should handle Number.MAX_VALUE and Number.MIN_VALUE edge cases with no data", () => {
      const privateMethod = (
        goldPricePeriodGraph as any
      ).extractPriceDataWithRangeData.bind(goldPricePeriodGraph);

      // Create a scenario where minPrice remains Number.MAX_VALUE and maxPrice remains Number.MIN_VALUE
      const result = privateMethod(
        [], // Empty aggregated data
        {
          earliest_price: 0,
          earliest_time: new Date(),
          latest_price: 0,
          latest_time: new Date(),
        },
        undefined // No huasengheng data
      );

      // Should set default values since minPrice would be MAX_VALUE and maxPrice would be MIN_VALUE
      expect(result.minPrice).toBe(0);
      expect(result.maxPrice).toBe(0);
    });

    it("should handle the case when no data is available", () => {
      const privateMethod = (
        goldPricePeriodGraph as any
      ).extractPriceDataWithRangeData.bind(goldPricePeriodGraph);

      const result = privateMethod([], {
        earliest_price: 0,
        earliest_time: new Date(),
        latest_price: 0,
        latest_time: new Date(),
      });

      expect(result).toEqual({
        minPrice: 0,
        maxPrice: 0,
        priceDifference: 0,
        latestPrice: 0,
        earliestPrice: 0,
      });
    });
  });
});
