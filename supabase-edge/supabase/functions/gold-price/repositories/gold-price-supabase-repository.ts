import { createClient } from "jsr:@supabase/supabase-js@2";
import { GoldPrice, GoldPriceCreate } from "../types/gold-price.type.ts";

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
}
