import { Pool, PoolClient } from "pg";

// Singleton database pool
let sharedPool: Pool | null = null;

/**
 * Get or create the shared database pool instance
 */
function getDbPool(): Pool {
  if (!sharedPool) {
    const connectionString = process.env.DB_CONNECTION;
    console.log("🔌 Connecting to database...");

    sharedPool = new Pool({ connectionString });

    sharedPool.on("error", (err) => {
      console.error("🔴 Unexpected error on database client", err);
    });
  }

  return sharedPool;
}

export abstract class BaseRepository {
  protected pool: Pool;
  protected tableName: string = "unknown";
  protected client: PoolClient | null = null;

  constructor() {
    // Use the shared pool instead of creating a new one
    this.pool = getDbPool();
  }

  async connect() {
    this.client = await this.pool.connect();
  }

  /**
   * Release the client back to the pool without ending the entire pool
   */
  async close(): Promise<void> {
    if (this.client) {
      this.client.release();
      this.client = null;
      console.log(
        `🗃️ Repository database connection released for table: ${this.tableName}`
      );
    }
  }
}
