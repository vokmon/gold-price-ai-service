import { HGoldType, HuasenghengDataType } from "../../models/huasengheng.ts";

export default class Huasengheng {
  private _url = "https://apicheckprice.huasengheng.com/api/values/getprice/";

  async getCurrentPrice(): Promise<HuasenghengDataType[]> {
    const result = await fetch(this._url);
    return (await result.json()) as HuasenghengDataType[];
  }

  async getCurrentPriceString(): Promise<string> {
    const result = await this.getCurrentPrice();
    if (!result) {
      return "";
    }

    const h = result.find((r) => r.GoldType === HGoldType.HSH);
    const message = `** The current gold price from huasengheng.com is Buy: ${h?.Buy}, Sell: ${h?.Sell}`;
    console.log(`Huasengheng: ${message}`)
    return message;
  }
}
