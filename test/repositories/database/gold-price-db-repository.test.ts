import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { Pool, QueryResult } from "pg";
import { GoldPriceDbRepository } from "../../../src/repositories/database/gold-price-db-repository";
import { GoldPriceCreate } from "../../../src/models/gold-price.ts";

// Mock the pg Pool
vi.mock("pg", () => {
  const mockQueryResult: QueryResult = {
    rows: [],
    command: "",
    rowCount: 0,
    oid: 0,
    fields: [],
  };

  const mockQuery = vi.fn().mockResolvedValue(mockQueryResult);

  return {
    Pool: vi.fn(() => ({
      query: mockQuery,
      on: vi.fn(),
      connect: vi.fn(),
    })),
    QueryResult: vi.fn(),
  };
});

describe("GoldPriceDbRepository", () => {
  let repository: GoldPriceDbRepository;
  let originalEnv: NodeJS.ProcessEnv;

  beforeEach(() => {
    originalEnv = { ...process.env };
    process.env.DB_CONNECTION =
      "postgresql://testuser:testpassword@localhost:5432/testdb";
    process.env.GOLD_PRICE_TABLE_NAME = "gold_prices_test";
    repository = new GoldPriceDbRepository();
  });

  afterEach(() => {
    process.env = originalEnv;
    vi.clearAllMocks();
  });

  describe("constructor", () => {
    it("should throw an error if GOLD_PRICE_TABLE_NAME is not set", () => {
      delete process.env.GOLD_PRICE_TABLE_NAME;

      expect(() => new GoldPriceDbRepository()).toThrow(
        "Gold price table name is missing. Please check GOLD_PRICE_TABLE_NAME environment variable."
      );
    });

    it("should initialize with the correct table name", () => {
      expect((repository as any).tableName).toBe("gold_prices_test");
    });
  });

  describe("insert", () => {
    it("should insert a gold price record successfully", async () => {
      // Setup mock data
      const mockGoldPrice: GoldPriceCreate = {
        buy: 2100.5,
        sell: 2080.25,
        buy_change: 10.5,
        sell_change: 9.75,
        time_update_string: "2023-10-15 14:30:00",
        time_update: "2023-10-15T14:30:00.000Z",
        created_time: new Date("2023-10-15T14:30:00.000Z"),
      };

      const mockReturnedGoldPrice = {
        id: 1698245631421,
        ...mockGoldPrice,
      };

      // Setup mock query response
      const mockPool = (repository as any).pool;
      mockPool.query.mockResolvedValueOnce({
        rows: [mockReturnedGoldPrice],
        rowCount: 1,
      });

      // Execute the method
      const result = await repository.insert(mockGoldPrice);

      // Verify the query was called with correct parameters
      expect(mockPool.query).toHaveBeenCalledTimes(1);
      expect(mockPool.query.mock.calls[0][0]).toContain(
        "INSERT INTO gold_prices_test"
      );
      expect(mockPool.query.mock.calls[0][1]).toHaveLength(8);
      expect(mockPool.query.mock.calls[0][1][1]).toBe(2100.5); // buy
      expect(mockPool.query.mock.calls[0][1][2]).toBe(2080.25); // sell

      // Verify the returned result
      expect(result).toEqual(mockReturnedGoldPrice);
    });

    it("should use provided id if available", async () => {
      const mockGoldPrice: GoldPriceCreate = {
        id: 12345,
        buy: 2100.5,
        sell: 2080.25,
        buy_change: 10.5,
        sell_change: 9.75,
        time_update_string: "2023-10-15 14:30:00",
        time_update: "2023-10-15T14:30:00.000Z",
        created_time: null,
      };

      const mockReturnedGoldPrice = {
        ...mockGoldPrice,
        created_time: new Date(),
      };

      // Setup mock query response
      const mockPool = (repository as any).pool;
      mockPool.query.mockResolvedValueOnce({
        rows: [mockReturnedGoldPrice],
        rowCount: 1,
      });

      await repository.insert(mockGoldPrice);

      // Verify the query was called with the provided id
      expect(mockPool.query.mock.calls[0][1][0]).toBe(12345);
    });

    it("should throw an error if insert fails", async () => {
      const mockGoldPrice: GoldPriceCreate = {
        buy: 2100.5,
        sell: 2080.25,
        buy_change: 10.5,
        sell_change: 9.75,
        time_update_string: "2023-10-15 14:30:00",
        time_update: "2023-10-15T14:30:00.000Z",
        created_time: null,
      };

      // Setup mock query response with empty rows
      const mockPool = (repository as any).pool;
      mockPool.query.mockResolvedValueOnce({
        rows: [],
        rowCount: 0,
      });

      // Execute and expect error
      await expect(repository.insert(mockGoldPrice)).rejects.toThrow(
        "Failed to insert gold price record"
      );
    });
  });
});
