import { HuasenghengDataType } from "./huasengheng.type.ts";

export type GoldPriceAlert = {
  priceAlert: boolean;
  currentPrice: HuasenghengDataType;
  priceDiff: number;
  lastCheckTime?: string;
};

export type LastCheckPricePersistence = {
  lastCheckTime: string;
  price: HuasenghengDataType;
  createdDateTime?: string;
  updatedDateTime?: string;
};

export type GoldPriceSummary = {
  hasEnoughData: boolean;
  currentPrice: { buy: number; sell: number };
  predictions: string[];
  information: string[];
  suggestions: string[];
  createdDate: Date;
};
