import { FirestoreRepo } from "~/repositories/firebase/firestore/firestore.ts";
import { GoldPriceDbRepository } from "../repositories/database/gold-price-db-repository.ts";
import Huasengheng from "~/services/huasengheng/huasengheng-service.ts";
import { HuasenghengDataType } from "~/models/huasengheng.ts";

export class GoldPriceDataRecorder {
  private readonly goldPriceDbRepository: GoldPriceDbRepository;
  private readonly huasenheng;
  private readonly firestoreRepo;

  private readonly collectionName =
    process.env.FIRESTORE_COLLECTION_PRICE_RECORD;

  constructor() {
    this.goldPriceDbRepository = new GoldPriceDbRepository();
    this.huasenheng = new Huasengheng();
    this.firestoreRepo = new FirestoreRepo();
  }

  async recordGoldPriceData() {
    const price = await this.huasenheng.getCurrentHuasenghengPrice();
    if (!price) {
      console.log("🔴 No price data found.");
      return;
    }

    const promises = [
      this.recordToFirestore(price),
      this.recordToDatabase(price),
    ];
    const results = await Promise.allSettled(promises);

    console.log("💾 Results recording gold price data: ", results);
  }

  private async recordToFirestore(price: HuasenghengDataType) {
    console.log("\n\n\n\n\n\n\n");
    console.log(this.collectionName);
    if (!this.collectionName) {
      console.log("🔴 No collection name found. Skip recording to Firestore.");
      return;
    }
    await this.firestoreRepo.saveDataToFireStore(this.collectionName, price);
    console.log("💾-🔥 Gold price data recorded successfully to Firestore.");
  }

  private async recordToDatabase(price: HuasenghengDataType) {
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
      await this.goldPriceDbRepository.connect();
      await this.goldPriceDbRepository.insert(goldPrice);
      console.log("💾-🗄️ Gold price data recorded successfully");
    } catch (error) {
      console.error("🔴 Error recording gold price data: ", error);
    } finally {
      console.log("🗃️ close database connection");
      await this.goldPriceDbRepository.close();
    }
  }
}
