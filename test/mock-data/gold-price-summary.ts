import { GoldPriceSummary } from "../../src/models/gold-price-summary";

export const goldPriceSummary: GoldPriceSummary = {
  currentPrice: { buy: 40650, sell: 40650 },
  predictions: [
    "ราคาทองคำวันนี้อาจจะปรับตัวสูงขึ้นเล็กน้อย  📈",
    "เนื่องจากราคาทองคำเมื่อวานนี้ปรับตัวขึ้น +23.1 ดอลลาร์ คิดเป็น +0.97% 💰",
  ],
  information: [
    "ราคาทองคำเมื่อวานนี้ (28 กรกฎาคม 2567) ปิดตลาดที่ระดับ 2,387 ดอลลาร์",
    "Gold spot สูงสุด - 2,390 ดอลลาร์ ต่ำสุด – 2,355 ดอลลาร์",
    "ราคาทองคำแท่งสูงสุด – 40,650 บาท ต่ำสุด 40,650 บาท",
  ],
  suggestions: [
    "ติดตามข่าวสารเศรษฐกิจและการเมืองอย่างใกล้ชิด เพราะอาจมีผลต่อราคาทองคำ 📰",
    "พิจารณาซื้อขายทองคำตามความเสี่ยงที่คุณยอมรับได้  ⚖️",
  ],
  hasEnoughData: true,
  createdDate: new Date(),
};