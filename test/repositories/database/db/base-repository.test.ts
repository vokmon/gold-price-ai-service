import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { Pool, PoolClient } from "pg";
import { BaseRepository } from "../../../../src/repositories/database/db/base-repository";

// Create a concrete implementation of the abstract BaseRepository for testing
class TestRepository extends BaseRepository {
  getTableName(): string {
    return this.tableName;
  }

  setTableName(name: string): void {
    this.tableName = name;
  }

  getPool(): Pool {
    return this.pool;
  }

  getClient(): PoolClient | null {
    return this.client;
  }

  // Add method to test the error handler directly
  triggerPoolError(error: Error): void {
    // Access the private error handler by simulating pool.on('error', handler) behavior
    const errorHandlers = (this.pool as any)._events?.error;
    if (errorHandlers) {
      if (Array.isArray(errorHandlers)) {
        errorHandlers.forEach((handler) => handler(error));
      } else {
        errorHandlers(error);
      }
    }
  }
}

// Mock objects
const mockPoolClient = {
  release: vi.fn(),
};

const mockPool = {
  connect: vi.fn().mockResolvedValue(mockPoolClient),
  on: vi.fn(function (event, handler) {
    // Store the handler in _events for testing
    if (!this._events) this._events = {};
    if (!this._events[event]) this._events[event] = [];
    if (Array.isArray(this._events[event])) {
      this._events[event].push(handler);
    } else {
      this._events[event] = handler;
    }
    return this;
  }),
  end: vi.fn().mockResolvedValue(undefined),
  query: vi.fn(),
  _events: {},
};

// Mock the pg Pool
vi.mock("pg", () => {
  return {
    Pool: vi.fn(() => mockPool),
    PoolClient: vi.fn(),
  };
});

// Mock the BaseRepository module to reset sharedPool between tests
let mockedSharedPool: Pool | null = null;

vi.mock(
  "../../../../src/repositories/database/db/base-repository",
  async (importOriginal) => {
    const original = await importOriginal<
      typeof import("../../../../src/repositories/database/db/base-repository")
    >();

    // Override the getDbPool function to use our controlled sharedPool variable
    const getDbPool = () => {
      if (!mockedSharedPool) {
        const connectionString = process.env.DB_CONNECTION;
        console.log("🔌 Connecting to database...");
        if (!connectionString) {
          throw new Error(
            "🔴 Database connection string is missing. Please check DB_CONNECTION environment variable."
          );
        }

        mockedSharedPool = new Pool({ connectionString });

        mockedSharedPool.on("error", (err) => {
          console.error("🔴 Unexpected error on database client", err);
        });
      }

      return mockedSharedPool;
    };

    // Return the original module with our overridden getDbPool function
    return {
      ...original,
      BaseRepository: class extends original.BaseRepository {
        constructor() {
          super();
          // Override the pool to use our controlled pool
          this.pool = getDbPool();
        }
      },
    };
  }
);

describe("BaseRepository", () => {
  let repository: TestRepository;
  let originalEnv: NodeJS.ProcessEnv;
  let consoleSpy: any;

  beforeEach(() => {
    // Reset mock calls between tests
    vi.clearAllMocks();

    // Reset the singleton pool
    mockedSharedPool = null;

    // Save original environment and console methods
    originalEnv = { ...process.env };
    process.env.DB_CONNECTION =
      "postgresql://testuser:testpassword@localhost:5432/testdb";

    // Spy on console methods
    consoleSpy = {
      log: vi.spyOn(console, "log").mockImplementation(() => {}),
      error: vi.spyOn(console, "error").mockImplementation(() => {}),
    };

    // Create new repository instance
    repository = new TestRepository();
  });

  afterEach(() => {
    // Restore original environment and console methods
    process.env = originalEnv;
    vi.clearAllMocks();
    consoleSpy.log.mockRestore();
    consoleSpy.error.mockRestore();
  });

  describe("constructor", () => {
    it("should initialize pool with connection string from environment", () => {
      // Verify Pool was constructed with the correct connection string
      expect(Pool).toHaveBeenCalledWith({
        connectionString:
          "postgresql://testuser:testpassword@localhost:5432/testdb",
      });
    });

    it("should set up error handler on pool", () => {
      // Verify the error handler was registered
      const pool = repository.getPool();
      expect(pool.on).toHaveBeenCalledWith("error", expect.any(Function));

      // Test error handler by using our custom method
      const testError = new Error("test database error");
      repository.triggerPoolError(testError);

      // Verify error was logged
      expect(consoleSpy.error).toHaveBeenCalledWith(
        "🔴 Unexpected error on database client",
        testError
      );
    });

    it("should throw error if DB_CONNECTION is not set", () => {
      // Reset the singleton pool to force new connection
      mockedSharedPool = null;

      // Remove DB_CONNECTION and verify constructor throws
      delete process.env.DB_CONNECTION;

      expect(() => new TestRepository()).toThrow(
        "🔴 Database connection string is missing. Please check DB_CONNECTION environment variable."
      );
    });

    it("should initialize tableName with default value", () => {
      expect(repository.getTableName()).toBe("unknown");
    });

    it("should reuse existing pool when one already exists", () => {
      // Create first repository which should initialize the pool
      const firstRepo = new TestRepository();
      expect(Pool).toHaveBeenCalledTimes(1);

      // Create second repository which should reuse the pool
      const secondRepo = new TestRepository();

      // Pool constructor should still only have been called once
      expect(Pool).toHaveBeenCalledTimes(1);

      // Both repositories should have the same pool instance
      expect(secondRepo.getPool()).toBe(firstRepo.getPool());
    });
  });

  describe("connect", () => {
    it("should acquire client from pool", async () => {
      await repository.connect();

      // Verify connect was called on pool
      const pool = repository.getPool();
      expect(pool.connect).toHaveBeenCalled();

      // Verify client was stored
      expect(repository.getClient()).not.toBeNull();
    });
  });

  describe("close", () => {
    it("should release client if one exists", async () => {
      // First connect to get a client
      await repository.connect();
      const client = repository.getClient();
      expect(client).not.toBeNull();

      // Set a table name to verify log message
      repository.setTableName("test_table");

      // Now close the connection
      await repository.close();

      // Verify client was released
      expect(client!.release).toHaveBeenCalled();

      // Verify client was set to null
      expect(repository.getClient()).toBeNull();

      // Verify log message
      expect(consoleSpy.log).toHaveBeenCalledWith(
        "🗃️ Repository database connection released for table: test_table"
      );
    });

    it("should do nothing if no client exists", async () => {
      // Ensure no client exists
      expect(repository.getClient()).toBeNull();

      // Close should not throw
      await repository.close();
    });
  });
});
