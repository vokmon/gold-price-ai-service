export type HuasenghengDataResponseType = {
  GoldType: HGoldType;
  GoldCode: string;
  Buy: string;
  Sell: string;
  TimeUpdate: string;
  BuyChange: number;
  SellChange: number;
  PresentDate: string;
  FxAsk: any;
  FxBid: any;
  Bid: any;
  Ask: any;
  QtyBid: any;
  QtyAsk: any;
  Discount: any;
  Premium: any;
  Increment: any;
  SourcePrice: any;
  StrTimeUpdate: string;
};

export type HuasenghengDataType = Pick<
  HuasenghengDataResponseType,
  "BuyChange" | "SellChange" | "StrTimeUpdate" | "TimeUpdate"
> & {
  id: number;
  Buy: number;
  Sell: number;
};

export enum HGoldType {
  HSH = "HSH",
  REF = "REF",
  JEWEL = "JEWEL",
}

export type GoldPrice = {
  buy: number;
  sell: number;
};

export type MarketStatus = { MarketStatus: "ON" | "OFF" };
