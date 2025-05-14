import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { Pool } from "pg";

// Create a mock implementation for Pool
const mockPoolMethods = {
  on: vi.fn().mockReturnThis(),
  end: vi.fn().mockResolvedValue(undefined),
};

// Store event handlers
const eventHandlers: Record<string, Function[]> = {
  error: [],
  connect: [],
};

// Mock the pg Pool
vi.mock("pg", () => {
  return {
    Pool: vi.fn(() => {
      // Reset handler storage on new Pool creation
      mockPoolMethods.on.mockImplementation(
        (event: string, handler: Function) => {
          // Store the handler for later testing
          if (event === "error" || event === "connect") {
            eventHandlers[event] = eventHandlers[event] || [];
            eventHandlers[event].push(handler);
          }
          return mockPoolMethods;
        }
      );

      return mockPoolMethods;
    }),
  };
});

describe("Database Connection Utilities", () => {
  let originalEnv: NodeJS.ProcessEnv;
  let consoleSpy: any;

  beforeEach(() => {
    // Reset event handlers
    eventHandlers.error = [];
    eventHandlers.connect = [];

    // Save original environment
    originalEnv = { ...process.env };
    process.env.DB_CONNECTION =
      "postgresql://testuser:testpassword@localhost:5432/testdb";

    // Spy on console methods
    consoleSpy = {
      log: vi.spyOn(console, "log").mockImplementation(() => {}),
      error: vi.spyOn(console, "error").mockImplementation(() => {}),
    };

    // Reset module state between tests
    vi.resetModules();
    vi.clearAllMocks();
  });

  afterEach(() => {
    // Restore original environment and console methods
    process.env = originalEnv;
    consoleSpy.log.mockRestore();
    consoleSpy.error.mockRestore();
  });

  describe("getConnectionPool", () => {
    it("should create a new Pool with connection string if one does not exist", async () => {
      // Import the module under test
      const { getConnectionPool } = await import(
        "../../../../src/repositories/database/db/db"
      );

      // Get pool
      const pool = getConnectionPool();

      // Verify Pool constructor was called with the correct connection string
      expect(Pool).toHaveBeenCalledWith({
        connectionString:
          "postgresql://testuser:testpassword@localhost:5432/testdb",
      });

      // Verify error and connect handlers were set up
      expect(pool.on).toHaveBeenCalledTimes(2);
      expect(pool.on).toHaveBeenCalledWith("error", expect.any(Function));
      expect(pool.on).toHaveBeenCalledWith("connect", expect.any(Function));
    });

    it("should throw an error if DB_CONNECTION is missing", async () => {
      // Remove DB_CONNECTION env var
      delete process.env.DB_CONNECTION;

      // Import the module under test
      const { getConnectionPool } = await import(
        "../../../../src/repositories/database/db/db"
      );

      // Attempt to get connection pool should throw
      expect(() => getConnectionPool()).toThrow(
        "Database connection string is missing. Please check DB_CONNECTION environment variable."
      );
    });

    it("should return the existing pool on subsequent calls", async () => {
      // Import the module under test
      const { getConnectionPool } = await import(
        "../../../../src/repositories/database/db/db"
      );

      // First call should create a new pool
      const pool1 = getConnectionPool();
      expect(Pool).toHaveBeenCalledTimes(1);

      // Reset the mock call count
      vi.clearAllMocks();

      // Second call should reuse the existing pool
      const pool2 = getConnectionPool();
      expect(Pool).not.toHaveBeenCalled();
      expect(pool2).toBe(pool1);
    });

    it("should handle error events properly", async () => {
      // Mock process.exit
      const exitSpy = vi
        .spyOn(process, "exit")
        .mockImplementation(() => undefined as never);

      // Import the module and access Pool mock
      const { getConnectionPool } = await import(
        "../../../../src/repositories/database/db/db"
      );

      // Get pool
      getConnectionPool();

      // Verify error handler was stored
      expect(eventHandlers.error.length).toBeGreaterThan(0);

      // Call the error handler with a test error
      const testError = new Error("Test database error");
      eventHandlers.error[0](testError);

      // Verify error was logged and process exit was called
      expect(consoleSpy.error).toHaveBeenCalledWith(
        "🔴 Unexpected error on idle client",
        testError
      );
      expect(exitSpy).toHaveBeenCalledWith(1);

      // Restore process.exit mock
      exitSpy.mockRestore();
    });

    it("should log connect events", async () => {
      // Import the module and access Pool mock
      const { getConnectionPool } = await import(
        "../../../../src/repositories/database/db/db"
      );

      // Get pool
      getConnectionPool();

      // Verify connect handler was stored
      expect(eventHandlers.connect.length).toBeGreaterThan(0);

      // Call the connect handler
      eventHandlers.connect[0]();

      // Verify connect was logged
      expect(consoleSpy.log).toHaveBeenCalledWith(
        "🟢 Connected to PostgreSQL database"
      );
    });
  });

  describe("closeConnection", () => {
    it("should close the connection pool if it exists", async () => {
      // Import the module under test
      const { getConnectionPool, closeConnection } = await import(
        "../../../../src/repositories/database/db/db"
      );

      // First create a pool
      const pool = getConnectionPool();

      // Reset mock call counts
      vi.clearAllMocks();

      // Then close it
      await closeConnection();

      // Verify end was called on the pool
      expect(pool.end).toHaveBeenCalledTimes(1);

      // Verify log message
      expect(consoleSpy.log).toHaveBeenCalledWith(
        "PostgreSQL connection pool has been closed"
      );

      // Reset mock call counts
      vi.clearAllMocks();

      // Verify pool is nullified (test this by calling getConnectionPool again)
      getConnectionPool();
      expect(Pool).toHaveBeenCalledTimes(1); // Should create a new pool
    });

    it("should do nothing if pool does not exist", async () => {
      // Reset modules to clear any pool state
      vi.resetModules();

      // Import the module without initializing the pool
      const { closeConnection } = await import(
        "../../../../src/repositories/database/db/db"
      );

      // Clear any previous calls
      vi.clearAllMocks();

      // Directly call closeConnection without first calling getConnectionPool
      await closeConnection();

      // No log message should be output
      expect(consoleSpy.log).not.toHaveBeenCalledWith(
        "PostgreSQL connection pool has been closed"
      );
    });
  });
});
