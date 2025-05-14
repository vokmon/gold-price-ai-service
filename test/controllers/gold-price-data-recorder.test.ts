import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { GoldPriceDataRecorder } from "../../src/controllers/gold-price-data-recorder";
import { GoldPriceDbRepository } from "../../src/repositories/database/gold-price-db-repository";
import Huasengheng from "../../src/services/huasengheng/huasengheng-service";
import { FirestoreRepo } from "../../src/repositories/firebase/firestore/firestore";

// Create mock implementation objects
const mockGoldPriceDbRepository = {
  connect: vi.fn().mockResolvedValue(undefined),
  insert: vi.fn().mockResolvedValue({
    id: 1698245631421,
    buy: 2100.5,
    sell: 2080.25,
    buy_change: 10.5,
    sell_change: 9.75,
    time_update_string: "2023-10-15 14:30:00",
    time_update: "2023-10-15T14:30:00.000Z",
    created_time: new Date("2023-10-15T14:30:00.000Z"),
  }),
  close: vi.fn().mockResolvedValue(undefined),
};

const mockHuasenghengService = {
  getCurrentHuasenghengPrice: vi.fn().mockResolvedValue({
    id: 1698245631421,
    Buy: 2100.5,
    Sell: 2080.25,
    BuyChange: 10.5,
    SellChange: 9.75,
    StrTimeUpdate: "2023-10-15 14:30:00",
    TimeUpdate: "2023-10-15T14:30:00.000Z",
  }),
};

const mockFirestoreRepo = {
  saveDataToFireStore: vi.fn().mockResolvedValue(undefined),
};

// Mock dependencies
vi.mock("../../src/repositories/database/gold-price-db-repository", () => {
  return {
    GoldPriceDbRepository: vi
      .fn()
      .mockImplementation(() => mockGoldPriceDbRepository),
  };
});

vi.mock("../../src/services/huasengheng/huasengheng-service", () => {
  return {
    default: vi.fn().mockImplementation(() => mockHuasenghengService),
  };
});

vi.mock("../../src/repositories/firebase/firestore/firestore", () => {
  return {
    FirestoreRepo: vi.fn().mockImplementation(() => mockFirestoreRepo),
  };
});

describe("GoldPriceDataRecorder", () => {
  let recorder: GoldPriceDataRecorder;
  let consoleSpy: any;
  let originalEnv: NodeJS.ProcessEnv;

  beforeEach(() => {
    // Save original environment
    originalEnv = { ...process.env };
    process.env.FIRESTORE_COLLECTION_PRICE_RECORD = "gold_prices_test";

    // Spy on console methods
    consoleSpy = {
      log: vi.spyOn(console, "log").mockImplementation(() => {}),
      error: vi.spyOn(console, "error").mockImplementation(() => {}),
    };

    // Reset mock implementations for each test
    vi.clearAllMocks();

    // Create instance
    recorder = new GoldPriceDataRecorder();
  });

  afterEach(() => {
    process.env = originalEnv;
    consoleSpy.log.mockRestore();
    consoleSpy.error.mockRestore();
  });

  describe("recordGoldPriceData", () => {
    it("should fetch and record gold price data to both Firestore and database", async () => {
      // Act
      await recorder.recordGoldPriceData();

      // Assert
      // Check that data was fetched
      expect(
        mockHuasenghengService.getCurrentHuasenghengPrice
      ).toHaveBeenCalled();

      // Check that data was recorded to Firestore
      expect(mockFirestoreRepo.saveDataToFireStore).toHaveBeenCalledWith(
        "gold_prices_test",
        expect.objectContaining({
          id: 1698245631421,
          Buy: 2100.5,
          Sell: 2080.25,
        })
      );

      // Check that data was recorded to database
      expect(mockGoldPriceDbRepository.connect).toHaveBeenCalled();
      expect(mockGoldPriceDbRepository.insert).toHaveBeenCalledWith(
        expect.objectContaining({
          id: 1698245631421,
          buy: 2100.5,
          sell: 2080.25,
          buy_change: 10.5,
          sell_change: 9.75,
          time_update_string: "2023-10-15 14:30:00",
          time_update: "2023-10-15T14:30:00.000Z",
        })
      );
      expect(mockGoldPriceDbRepository.close).toHaveBeenCalled();

      // Check that success logs were written
      expect(consoleSpy.log).toHaveBeenCalledWith(
        expect.stringContaining(
          "Gold price data recorded successfully to Firestore"
        )
      );
      expect(consoleSpy.log).toHaveBeenCalledWith(
        expect.stringContaining("Gold price data recorded successfully")
      );
    });

    it("should handle case when no price data is found", async () => {
      // Setup mock to return no data
      mockHuasenghengService.getCurrentHuasenghengPrice.mockResolvedValueOnce(
        undefined
      );

      // Act
      await recorder.recordGoldPriceData();

      // Assert
      expect(
        mockHuasenghengService.getCurrentHuasenghengPrice
      ).toHaveBeenCalled();
      expect(consoleSpy.log).toHaveBeenCalledWith(
        expect.stringContaining("No price data found.")
      );

      // Verify nothing else was called
      expect(mockFirestoreRepo.saveDataToFireStore).not.toHaveBeenCalled();
      expect(mockGoldPriceDbRepository.connect).not.toHaveBeenCalled();
      expect(mockGoldPriceDbRepository.insert).not.toHaveBeenCalled();
    });

    it("should handle missing Firestore collection name", async () => {
      // Setup env before creating recorder instance
      delete process.env.FIRESTORE_COLLECTION_PRICE_RECORD;

      // Create a new recorder instance with the updated environment
      const recorderWithoutCollection = new GoldPriceDataRecorder();

      // Clear mocks to ensure we're only tracking calls from this test
      vi.clearAllMocks();

      // Act
      await recorderWithoutCollection.recordGoldPriceData();

      // Assert
      expect(
        mockHuasenghengService.getCurrentHuasenghengPrice
      ).toHaveBeenCalled();

      // Verify log message about missing collection name
      expect(consoleSpy.log).toHaveBeenCalledWith(
        expect.stringContaining(
          "No collection name found. Skip recording to Firestore."
        )
      );

      // This is the critical assertion - Firestore save should NOT be called
      expect(mockFirestoreRepo.saveDataToFireStore).not.toHaveBeenCalled();

      // Database recording should still work
      expect(mockGoldPriceDbRepository.connect).toHaveBeenCalled();
      expect(mockGoldPriceDbRepository.insert).toHaveBeenCalled();
    });

    it("should handle database error", async () => {
      // Setup mock to throw error during insert
      const testError = new Error("Test database error");
      mockGoldPriceDbRepository.insert.mockRejectedValueOnce(testError);

      // Act
      await recorder.recordGoldPriceData();

      // Assert
      // Firestore recording should still work
      expect(mockFirestoreRepo.saveDataToFireStore).toHaveBeenCalled();

      // Database error should be caught and logged
      expect(mockGoldPriceDbRepository.connect).toHaveBeenCalled();
      expect(mockGoldPriceDbRepository.insert).toHaveBeenCalled();
      expect(consoleSpy.error).toHaveBeenCalledWith(
        expect.stringContaining("Error recording gold price data: "),
        testError
      );

      // Close should be called even after error
      expect(mockGoldPriceDbRepository.close).toHaveBeenCalled();
    });
  });
});
