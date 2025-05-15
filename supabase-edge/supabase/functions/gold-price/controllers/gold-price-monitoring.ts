import Huasengheng from "../services/huasengheng-service.ts";
import {
  GoldPriceAlert,
  LastCheckPricePersistence,
} from "../types/gold-price-summary.type.ts";
import { HuasenghengDataType } from "../types/huasengheng.type.ts";
import { getCurrentDateTime } from "../utils/date-utils.ts";
import OutputChannels from "../outputs/output-channels.ts";
import TelegramOutput from "../outputs/impl/telegram-output.ts";
import FirestoreOutput from "../outputs/impl/firestore-output.ts";
import { FirestoreRepo } from "../repositories/firestore.ts";

export default class GoldPriceMonitoring {
  private GOLD_PRICE_ALERT_COLLECTION_NAME = "gold_price_alert";
  private lastCheckPriceCollectionName = "last_check_price";
  private lastCheckCheckPriceId = "last_check_alert_id";

  private _huasengheng: Huasengheng;
  private _firestore: FirestoreRepo;
  private lastCheckPrice: LastCheckPricePersistence | null;

  constructor() {
    this._firestore = new FirestoreRepo();
    this._huasengheng = new Huasengheng();
    this.lastCheckPrice = null;
  }

  async monitorPrice(priceThreshold: number): Promise<GoldPriceAlert> {
    const marketStatus = await this._huasengheng.getMarketStatus();
    console.log("🛒 Market status: ", marketStatus);

    if (marketStatus.MarketStatus !== "ON") {
      console.log("🔴 Market is off. No price monitoring.");
      return {
        priceAlert: false,
      } as GoldPriceAlert;
    }

    const currentPrice = await this._huasengheng.getCurrentHuasenghengPrice();
    if (!currentPrice) {
      console.log("Unable to get current gold price from huasengheng.");
      return {
        priceAlert: false,
      } as GoldPriceAlert;
    }

    if (!this.lastCheckPrice) {
      console.log("No price to compare from the cache, Fetch from firestore.");
      const lastCheckPriceFromFireStore =
        await this._firestore.getDataFromFireStoreById<LastCheckPricePersistence>(
          this.lastCheckPriceCollectionName,
          this.lastCheckCheckPriceId
        );

      if (lastCheckPriceFromFireStore) {
        console.log(
          "🎯 Found last check price from firestore - Last check price: ",
          lastCheckPriceFromFireStore
        );
        this.lastCheckPrice = lastCheckPriceFromFireStore;
      }
    }

    if (!this.lastCheckPrice) {
      console.log("No price to compare from cache and firestore.");

      const dateTime = getCurrentDateTime("th-TH");
      await this.outputPriceAlertToFirestore({
        price: currentPrice,
        lastCheckTime: dateTime,
      });
      this.lastCheckPrice = {
        price: currentPrice,
        lastCheckTime: dateTime,
      };
      return {
        priceAlert: false,
        currentPrice: currentPrice,
        priceDiff: 0,
        lastCheckTime: this.lastCheckPrice.lastCheckTime,
      } as GoldPriceAlert;
    }

    if (
      this.lastCheckPrice.price.StrTimeUpdate === currentPrice.StrTimeUpdate
    ) {
      console.log("No price update.", this.lastCheckPrice.price.StrTimeUpdate);
      this.lastCheckPrice.lastCheckTime = getCurrentDateTime("th-TH");
      await this.outputPriceAlertToFirestore({
        lastCheckTime: this.lastCheckPrice.lastCheckTime,
        price: this.lastCheckPrice.price,
        createdDateTime: this.lastCheckPrice.createdDateTime,
      });
      return {
        priceAlert: false,
        currentPrice: currentPrice,
        priceDiff: 0,
        lastCheckTime: this.lastCheckPrice.lastCheckTime,
      } as GoldPriceAlert;
    }

    console.log(
      `Start checking the price with the threshold ${priceThreshold}. Current price: ${currentPrice.Sell}, Previous price: ${this.lastCheckPrice.price.Sell}`
    );
    const priceDiff = currentPrice.Sell - this.lastCheckPrice.price.Sell;

    const result: GoldPriceAlert = {
      priceAlert: Math.abs(priceDiff) >= priceThreshold,
      currentPrice: currentPrice,
      priceDiff,
      lastCheckTime: this.lastCheckPrice.lastCheckTime,
    };
    console.log(`Monitoring result: `, result);
    this.lastCheckPrice = {
      price: currentPrice,
      lastCheckTime: getCurrentDateTime("th-TH"),
      createdDateTime: this.lastCheckPrice.createdDateTime,
    };

    if (result.priceAlert) {
      console.log(
        `🔔🔔🔔 Price alert triggered, price diff is ${priceDiff} which greater than ${priceThreshold}.`
      );
      const promises = [
        this.outputPriceAlert(result),
        this.outputPriceAlertToFirestore({
          lastCheckTime: this.lastCheckPrice.lastCheckTime,
          price: currentPrice,
          createdDateTime: this.lastCheckPrice.createdDateTime,
        }),
      ];
      const results = await Promise.allSettled(promises);
      console.log("🔔🔔🔔 Output results: ", results);
    } else {
      console.log(
        `⛔ No price alert triggered, price diff is ${priceDiff} which less than ${priceThreshold}, save to firestore for next comparison.`
      );
      await this.outputPriceAlertToFirestore({
        lastCheckTime: this.lastCheckPrice.lastCheckTime,
        price: currentPrice,
        createdDateTime: this.lastCheckPrice.createdDateTime,
      });
    }
    return result;
  }

  async outputPriceAlert(result: GoldPriceAlert) {
    const outputChannels = new OutputChannels([
      new TelegramOutput(),
      new FirestoreOutput(this.GOLD_PRICE_ALERT_COLLECTION_NAME),
    ]);
    const outputResult = await outputChannels.outputDataPriceAlert(result);
    console.log("🔔🔔🔔 Output result: ", outputResult);
  }

  async outputPriceAlertToFirestore(result: LastCheckPricePersistence) {
    if (!this.lastCheckPrice) {
      await this._firestore.saveDataToFireStore<LastCheckPricePersistence>(
        this.lastCheckPriceCollectionName,
        result,
        {
          id: this.lastCheckCheckPriceId,
        }
      );
      console.log(
        "🔔🔔🔔 Save - Insert last price alert for next comparison to firestore: ",
        result
      );
    } else {
      await this._firestore.updateDataToFireStore<LastCheckPricePersistence>(
        this.lastCheckPriceCollectionName,
        result,
        this.lastCheckCheckPriceId
      );
      console.log(
        "🔔🔔🔔 Save - Update last price alert for next comparison to firestore: ",
        result
      );
    }
  }
}
