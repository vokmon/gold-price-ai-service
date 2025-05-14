import {
  HGoldType,
  HuasenghengDataResponseType,
  HuasenghengDataType,
  MarketStatus,
} from "../../models/huasengheng.ts";

export default class Huasengheng {
  private _url = "https://apicheckprice.huasengheng.com/api/values/getprice/";
  private _urlGetStatus =
    "https://apicheckpricev3.huasengheng.com/api/values/GetMarketStatus";

  async getCurrentPrice(): Promise<HuasenghengDataResponseType[]> {
    const result = await fetch(this._url);
    return (await result.json()) as HuasenghengDataResponseType[];
  }

  async getCurrentHuasenghengPrice(): Promise<HuasenghengDataType | undefined> {
    const result = await this.getCurrentPrice();
    if (!result) {
      return undefined;
    }

    const h = result.find((r) => r.GoldType === HGoldType.HSH);
    if (!h) {
      return undefined;
    }

    const hResult: HuasenghengDataType = {
      id: new Date().getTime(),
      Sell: Number((h?.Sell /* c8 ignore next */ || "0").replace(/,/g, "")),
      Buy: Number((h?.Buy /* c8 ignore next */ || "0").replace(/,/g, "")),
      BuyChange: h?.BuyChange /* c8 ignore next */ || 0,
      SellChange: h?.SellChange /* c8 ignore next */ || 0,
      StrTimeUpdate: h?.StrTimeUpdate /* c8 ignore next */ || "",
      TimeUpdate: h?.TimeUpdate /* c8 ignore next */ || "",
    };
    return hResult;
  }

  async getMarketStatus(): Promise<MarketStatus> {
    const result = await fetch(this._urlGetStatus);
    return (await result.json()) as MarketStatus;
  }
}
