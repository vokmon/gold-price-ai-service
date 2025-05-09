import {
  HGoldType,
  HuasenghengDataType,
  MarketStatus,
} from "../../models/huasengheng.ts";

export default class Huasengheng {
  private _url = "https://apicheckprice.huasengheng.com/api/values/getprice/";
  private _urlGetStatus =
    "https://apicheckpricev3.huasengheng.com/api/values/GetMarketStatus";

  async getCurrentPrice(): Promise<HuasenghengDataType[]> {
    const result = await fetch(this._url);
    return (await result.json()) as HuasenghengDataType[];
  }

  async getCurrentHuasenghengPrice(): Promise<HuasenghengDataType | undefined> {
    const result = await this.getCurrentPrice();
    if (!result) {
      return undefined;
    }

    const h = result.find((r) => r.GoldType === HGoldType.HSH);
    return h;
  }

  async getMarketStatus(): Promise<MarketStatus> {
    const result = await fetch(this._urlGetStatus);
    return (await result.json()) as MarketStatus;
  }
}
