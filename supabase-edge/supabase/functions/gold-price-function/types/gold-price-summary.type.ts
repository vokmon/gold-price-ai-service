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
};
