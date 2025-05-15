import { HuasenghengDataType } from "./huasengheng.type.ts";

export type GoldPricePeriodSummaryModel = {
  summaries: string[];
  predictions: string[];
};

export type GoldPricePeriodSummaryInfo = {
  startDate: Date;
  endDate: Date;
  summary: GoldPricePeriodSummaryModel;
  currentPrice?: HuasenghengDataType;
};
