export interface GoldPrice {
  id: number;
  buy: number;
  sell: number | null;
  buy_change: number | null;
  sell_change: number | null;
  time_update_string: string | null;
  time_update: string | null;
  created_time: Date | null;
}

export interface GoldPriceCreate extends Omit<GoldPrice, "id"> {
  id?: number;
}

export interface GoldPriceAggregate {
  date_time: Date;
  min_sell: number;
  max_sell: number;
}

export type TimePeriod = "hour" | "day" | "month" | "year";

export interface PriceRangeData {
  earliest_price: number;
  earliest_time: Date;
  latest_price: number;
  latest_time: Date;
}
