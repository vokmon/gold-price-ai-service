import { Pool, PoolClient } from "pg";

export abstract class BaseRepository {
  protected pool: Pool;
  protected tableName: string = "unknown";
  protected client: PoolClient | null = null;

  constructor() {
    const connectionString = process.env.DB_CONNECTION;
    console.log("🔌 Connecting to database...", connectionString);
    if (!connectionString) {
      throw new Error(
        "🔴 Database connection string is missing. Please check DB_CONNECTION environment variable."
      );
    }

    this.pool = new Pool({ connectionString });

    this.pool.on("error", (err) => {
      console.error("🔴 Unexpected error on database client", err);
    });
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
