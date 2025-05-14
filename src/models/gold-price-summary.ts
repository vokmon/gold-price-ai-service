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

type PersistedData = {
  id: string;
  createdDateTime: Timestamp;
};

export type GoldPriceSummaryPersisted = GoldPriceSummary & PersistedData;

export type GoldPriceAlertPersisted = GoldPriceAlert & PersistedData;
