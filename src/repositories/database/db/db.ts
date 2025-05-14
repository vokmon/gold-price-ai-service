import { Pool } from "pg";

let pool: Pool | null = null;

export const getConnectionPool = (): Pool => {
  if (!pool) {
    const connectionString = process.env.DB_CONNECTION;

    if (!connectionString) {
      throw new Error(
        "Database connection string is missing. Please check DB_CONNECTION environment variable."
      );
    }

    pool = new Pool({ connectionString });

    // Log connection events
    pool.on("error", (err) => {
      console.error("🔴 Unexpected error on idle client", err);
      process.exit(1);
    });

    pool.on("connect", () => {
      console.log("🟢 Connected to PostgreSQL database");
    });
  }

  return pool;
};

export const closeConnection = async (): Promise<void> => {
  if (pool) {
    await pool.end();
    pool = null;
    console.log("PostgreSQL connection pool has been closed");
  }
};
