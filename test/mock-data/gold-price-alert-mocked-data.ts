import { GoldPriceAlert } from "../../src/models/gold-price-summary";
import { HGoldType } from "../../src/models/huasengheng";

export const goldPriceAlertMockedData1: GoldPriceAlert = {
  priceAlert: true,
  currentPrice: {
    GoldType: HGoldType.HSH,
    GoldCode: "TH_BLG965",
    Buy: "40000",
    Sell: "41000",
    TimeUpdate: "10:00",
    BuyChange: 100,
    SellChange: 100,
    PresentDate: "2023-01-03",
    FxAsk: null,
    FxBid: null,
    Bid: null,
    Ask: null,
    QtyBid: null,
    QtyAsk: null,
    Discount: null,
    Premium: null,
    Increment: null,
    SourcePrice: null,
    StrTimeUpdate: "10:00",
  },
  priceDiff: 100,
  lastCheckTime: "2023-01-03T10:00:00",
};
