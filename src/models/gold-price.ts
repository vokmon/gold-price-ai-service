import { HuasenghengDataType } from "./huasengheng.ts";

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

export type GoldPricePersisted = HuasenghengDataType & {
  id: number;
  createdDateTime: Date;
};
