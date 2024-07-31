import { getCurrentDate, getTimeOfDay } from "../../utils/date-utils.ts";
import { GoldPriceSummary } from "../../models/gold-price-summary.ts";

export const convertSummaryDataToString = (summary: GoldPriceSummary) => {
  const currentDate = getCurrentDate("th-TH");
  const timeOfDay = getTimeOfDay();
  const message = `
ข้อมูลราคาทองคำวันนี้ ${currentDate} รอบ ${timeOfDay}

💰 ราคาทองคำแท่ง 96.5% 
  ซื้อ: ${summary.currentPrice.buy ? summary.currentPrice.buy.toLocaleString() : '-'} บาท
  ขาย: ${summary.currentPrice.sell ? summary.currentPrice.sell.toLocaleString() : '-'} บาท

🔍 คาดการณ์ราคาทองคำวันนี้
${summary.predictions.map((st) => `  ✅ ${st}`).join("\n")} 

📊 ข้อมูลเพิ่มเติม
${summary.information.map((st) => `  🔸 ${st}`).join("\n")} 

***** คำแนะนำ *****
${summary.suggestions.map((st) => `  ❗ ${st}`).join("\n")}
`;

  return message;
};
