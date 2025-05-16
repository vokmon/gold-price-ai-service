import { QueryResult } from "pg";
import {
  GoldPrice,
  GoldPriceCreate,
  GoldPriceAggregate,
  TimePeriod,
} from "../../models/gold-price.ts";
import { BaseRepository } from "./db/base-repository.ts";

/**
 * Interface for earliest and latest price data
 */
export interface PriceRangeData {
  earliest_price: number;
  earliest_time: Date;
  latest_price: number;
  latest_time: Date;
}

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

  /**
   * Get earliest and latest prices within a date range
   * @param startDate Start date for the query range
   * @param endDate End date for the query range
   * @returns Object containing earliest and latest price data
   */
  async getPriceRangeData(
    startDate: Date,
    endDate: Date
  ): Promise<PriceRangeData> {
    const query = `
      SELECT 
        (SELECT sell FROM ${this.tableName} 
         WHERE created_time BETWEEN $1 AND $2
         ORDER BY created_time ASC LIMIT 1) AS earliest_price,
        (SELECT created_time FROM ${this.tableName} 
         WHERE created_time BETWEEN $1 AND $2
         ORDER BY created_time ASC LIMIT 1) AS earliest_time,
        (SELECT sell FROM ${this.tableName} 
         WHERE created_time BETWEEN $1 AND $2
         ORDER BY created_time DESC LIMIT 1) AS latest_price,
        (SELECT created_time FROM ${this.tableName} 
         WHERE created_time BETWEEN $1 AND $2
         ORDER BY created_time DESC LIMIT 1) AS latest_time
    `;

    const values = [startDate, endDate];
    const result: QueryResult<PriceRangeData> = await this.pool.query(
      query,
      values
    );

    if (!result.rows[0]) {
      return {
        earliest_price: 0,
        earliest_time: new Date(),
        latest_price: 0,
        latest_time: new Date(),
      };
    }

    return result.rows[0];
  }

  /**
   * Get aggregated min/max gold price data by the specified time period
   * @param period The time period to aggregate by ('hour', 'day', 'month', 'year')
   * @param startDate Start date for the query range
   * @param endDate End date for the query range
   * @returns Array of aggregated data points with min and max values
   */
  async getAggregatedDataByPeriod(
    period: TimePeriod,
    startDate: Date,
    endDate: Date
  ): Promise<GoldPriceAggregate[]> {
    const query = `
      SELECT
        DATE_TRUNC($1, created_time) AS date_time,
        MIN(sell) AS min_sell,
        MAX(sell) AS max_sell
      FROM
        ${this.tableName}
      WHERE
        created_time BETWEEN $2 AND $3
      GROUP BY
        date_time
      ORDER BY
        date_time
    `;

    const values = [period, startDate, endDate];
    const result: QueryResult<GoldPriceAggregate> = await this.pool.query(
      query,
      values
    );
    return result.rows;
  }
}
