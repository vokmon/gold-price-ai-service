import { createClient } from "jsr:@supabase/supabase-js@2";
import {
  GoldPriceAggregate,
  GoldPrice,
  GoldPriceCreate,
  PriceRangeData,
  TimePeriod,
} from "../types/gold-price.type.ts";
import { convertToThaiTimezone } from "../utils/date-utils.ts";

export class GoldPriceDbRepository {
  private readonly tableName = "goldprice";
  private readonly supabaseClient: ReturnType<typeof createClient>;

  constructor(req: any) {
    this.req = req;

    this.supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      {
        global: {
          headers: { Authorization: req.headers.get("Authorization")! },
        },
      }
    );
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

    const values = {
      id: id || new Date().getTime(),
      buy,
      sell,
      buy_change,
      sell_change,
      time_update_string,
      time_update,
      created_time: created_time || new Date(),
    };

    console.log("💾 Gold price record to insert: ", values);

    const { data, error } = await this.supabaseClient
      .from(this.tableName)
      .insert([values]);

    if (error) {
      console.error("🔴 Error inserting gold price record: ", error);
      throw new Error(error.message);
    }
    return values;
  }

  async getPriceRangeData(
    startDate: Date,
    endDate: Date
  ): Promise<PriceRangeData> {
    const { data: earliestData, error: earliestError } =
      await this.supabaseClient
        .from(this.tableName)
        .select("sell, created_time")
        .gte("created_time", startDate.toISOString())
        .lte("created_time", endDate.toISOString())
        .order("created_time", { ascending: true })
        .limit(1)
        .maybeSingle();

    const { data: latestData, error: latestError } = await this.supabaseClient
      .from(this.tableName)
      .select("sell, created_time")
      .gte("created_time", startDate.toISOString())
      .lte("created_time", endDate.toISOString())
      .order("created_time", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (earliestError || latestError || !earliestData || !latestData) {
      return {
        earliest_price: 0,
        earliest_time: new Date(),
        latest_price: 0,
        latest_time: new Date(),
      };
    }

    return {
      earliest_price: earliestData.sell,
      earliest_time: new Date(earliestData.created_time),
      latest_price: latestData.sell,
      latest_time: new Date(latestData.created_time),
    };
  }

  async getAggregatedDataByPeriod(
    period: TimePeriod,
    startDate: Date,
    endDate: Date
  ): Promise<GoldPriceAggregate[]> {
    console.log(
      `🔍 to get aggregated data by period: startDate: ${startDate.toISOString()} endDate: ${endDate.toISOString()}`
    );

    const { data, error } = await this.supabaseClient.rpc(
      "get_aggregated_gold_prices_by_period",
      {
        period,
        start_ts: startDate.toISOString(),
        end_ts: endDate.toISOString(),
      }
    );

    if (error) {
      console.error("Supabase RPC error:", error);
      return [];
    }

    // Convert date_time from string to Date object
    const convertedData = data.map((item: any) => ({
      ...item,
      date_time: convertToThaiTimezone(item.date_time),
    }));

    return convertedData as GoldPriceAggregate[];
  }
}
