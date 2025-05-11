import { HuasenghengDataType } from "./huasengheng.ts";
import { Timestamp } from "firebase-admin/firestore";
export type GoldPriceSummary = {
  hasEnoughData: boolean;
  currentPrice: { buy: number; sell: number };
  predictions: string[];
  information: string[];
  suggestions: string[];
  createdDate: Date;
};

export type GoldPriceAlert = {
  priceAlert: boolean;
  currentPrice: HuasenghengDataType;
  priceDiff: number;
  lastCheckTime?: string;
};

export type GoldPriceSummaryPersisted = GoldPriceSummary & {
  id: string;
  createdDateTime: Date;
};

export type GoldPriceAlertPersisted = GoldPriceAlert & {
  id: string;
  createdDateTime: Date | Timestamp;
};
