import { FirestoreRepo } from "../repositories/firestore.ts";
import { GoldPriceDbRepository } from "../repositories/gold-price-supabase-repository.ts";
import Huasengheng from "../services/huasengheng-service.ts";
import { HuasenghengDataType } from "../types/huasengheng.type.ts";

export class GoldPriceDataRecorder {
  private readonly huasenheng;
  private readonly firestoreRepo;

  private readonly collectionName = "gold_price";

  constructor() {
    this.huasenheng = new Huasengheng();
    this.firestoreRepo = new FirestoreRepo();
  }

  async recordGoldPriceData(req: any) {
    const price = await this.huasenheng.getCurrentHuasenghengPrice();
    if (!price) {
      console.log("🔴 No price data found.");
      return;
    }

    const promises = [
      this.recordToFirestore(price),
      this.recordToDatabase(price, req),
    ];
    const results = await Promise.allSettled(promises);

    console.log("💾 Results recording gold price data: ", results);
    return price;
  }

  private async recordToFirestore(price: HuasenghengDataType) {
    if (!this.collectionName) {
      console.log("🔴 No collection name found. Skip recording to Firestore.");
      return;
    }
    await this.firestoreRepo.saveDataToFireStore(this.collectionName, price);
    console.log("💾-🔥 Gold price data recorded successfully to Firestore.");
    return "💾-🔥 save to firestore successfully";
  }

  private async recordToDatabase(price: HuasenghengDataType, req: any) {
    const goldPriceDbRepository = new GoldPriceDbRepository(req);

    const goldPrice = {
      id: price.id,
      buy: price.Buy,
      sell: price.Sell,
      buy_change: price.BuyChange,
      sell_change: price.SellChange,
      time_update_string: price.StrTimeUpdate,
      time_update: price.TimeUpdate,
      created_time: new Date(),
    };

    try {
      await goldPriceDbRepository.insert(goldPrice);
      console.log("💾-🗄️ Gold price data recorded successfully");
    } catch (error) {
      console.error("🔴 Error recording gold price data: ", error);
    }

    return "💾-🗄️ Gold price data recorded successfully";
  }
}
