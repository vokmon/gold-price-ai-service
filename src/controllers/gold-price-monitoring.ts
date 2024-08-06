import Huasengheng from "../services/huasengheng/huasengheng-service.ts";
import {
  GoldPriceAlert,
} from "../models/gold-price-summary.ts";
import { HuasenghengDataType } from "../models/huasengheng.ts";
import { getCurrentDateTime } from "../utils/date-utils.ts";

export default class GoldPriceMonitoring {
  private priceTreshold = Number(process.env.PRICE_DIFF_THRESHOLD || 100);
  private _huasengheng;
  private lastCheckPrice: HuasenghengDataType | null;
  private lastCheckTime: string | undefined;

  constructor() {
    this._huasengheng = new Huasengheng();
    this.lastCheckPrice = null;
  }

  async monitorPrice(): Promise<GoldPriceAlert> {
    const currentPrice = await this._huasengheng.getCurrentHuasenghengPrice();
    if (!currentPrice) {
      console.log("Unable to get current gold price from huasengheng.");
      return {
        priceAlert: false,
      } as GoldPriceAlert;
    }

    if (!this.lastCheckPrice) {
      console.log("No price to compare yet.");
      this.lastCheckPrice = currentPrice;
      this.lastCheckTime = getCurrentDateTime('th-TH');
      return {
        priceAlert: false,
      } as GoldPriceAlert;
    }

    if (this.lastCheckPrice.StrTimeUpdate === currentPrice.StrTimeUpdate) {
      console.log("No price update.", this.lastCheckPrice.StrTimeUpdate);
      this.lastCheckTime = getCurrentDateTime('th-TH');
      return {
        priceAlert: false,
      } as GoldPriceAlert;
    }

    console.log(`Start checking the price with the threshold ${this.priceTreshold}. Current price: ${currentPrice.Buy}, Previous price: ${this.lastCheckPrice.Buy}`,);
    const priceDiff = Number(currentPrice.Buy.replaceAll(",", "")) - Number(this.lastCheckPrice.Buy.replaceAll(",", ""));

    const result: GoldPriceAlert = {
      priceAlert: Math.abs(priceDiff) >= this.priceTreshold,
      currentPrice: currentPrice,
      priceDiff,
      lastCheckTime: this.lastCheckTime,
    };
    console.log(`Monitoring result: `, result)
    this.lastCheckPrice = currentPrice;
    this.lastCheckTime = getCurrentDateTime('th-TH');

    return result;
  }
}
