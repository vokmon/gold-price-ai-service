import { HuasenghengDataType } from "./huasengheng.ts";

export type GoldPriceSummary = {
  hasEnoughData: boolean;
  currentPrice: { buy: number; sell: number };
  predictions: string[];
  information: string[];
  suggestions: string[];
  createdDate: Date;
};

export type GoldPriceAlert = {
  priceAlert: boolean,
  currentPrice: HuasenghengDataType,
  priceDiff: number,
}