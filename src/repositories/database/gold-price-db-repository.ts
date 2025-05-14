import { QueryResult } from "pg";
import { GoldPrice, GoldPriceCreate } from "../../models/gold-price.ts";
import { BaseRepository } from "./db/base-repository.ts";

export class GoldPriceDbRepository extends BaseRepository {
  constructor() {
    super();

    const tableName = process.env.GOLD_PRICE_TABLE_NAME;
    if (!tableName) {
      throw new Error(
        "Gold price table name is missing. Please check GOLD_PRICE_TABLE_NAME environment variable."
      );
    }
    this.tableName = tableName;
  }

  /**
   * Insert a new gold price record
   */
  async insert(goldPrice: GoldPriceCreate): Promise<GoldPrice> {
    const {
      id,
      buy,
      sell,
      buy_change,
      sell_change,
      time_update_string,
      time_update,
      created_time,
    } = goldPrice;

    const query = `
      INSERT INTO ${this.tableName} 
      (id, buy, sell, buy_change, sell_change, time_update_string, time_update, created_time) 
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8) 
      RETURNING *
    `;

    const values = [
      id || new Date().getTime(),
      buy,
      sell,
      buy_change,
      sell_change,
      time_update_string,
      time_update,
      created_time || new Date(),
    ];

    const result: QueryResult<GoldPrice> = await this.pool.query(query, values);
    if (!result.rows[0]) {
      throw new Error("Failed to insert gold price record");
    }
    return result.rows[0];
  }
}
