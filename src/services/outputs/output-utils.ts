import {
  getCurrentDate,
  getCurrentDateTime,
  getTimeOfDay,
} from "../../utils/date-utils.ts";
import { GoldPriceSummary } from "../../models/gold-price-summary.ts";
import { HuasenghengDataType } from "../../models/huasengheng.ts";

export const convertSummaryDataToString = (summary: GoldPriceSummary) => {
  const currentDate = getCurrentDate("th-TH");
  const timeOfDay = getTimeOfDay();
  let message = `
ข้อมูลราคาทองคำ ${currentDate} รอบ${timeOfDay}

💰 ราคาทองคำแท่ง 96.5% 
  ซื้อ: ${
    summary.currentPrice.buy ? summary.currentPrice.buy.toLocaleString() : "-"
  } บาท
  ขาย: ${
    summary.currentPrice.sell ? summary.currentPrice.sell.toLocaleString() : "-"
  } บาท
`;

  if (summary.hasEnoughData) {
    message = `${message}
🔍 คาดการณ์ราคาทองคำวันนี้
${summary.predictions.map((st) => `  ✅ ${st}`).join("\n")} 

📊 ข้อมูลเพิ่มเติม
${summary.information.map((st) => `  🔸 ${st}`).join("\n")} 

***** คำแนะนำ *****
${summary.suggestions.map((st) => `  ❗ ${st}`).join("\n")}
  `;
  }

  return message;
};

export const convertHuasenghengDataToString = (
  data: HuasenghengDataType,
  priceDiff: number,
  diffTime?: string
) => {
  const message = `
  ${getCurrentDateTime("th-TH")}
  ราคาทองคำมีการเปลี่ยนแปลงสูง
  จากเวลา: ${diffTime}
  ราคา${priceDiff > 0 ? "ขึ้น 📈" : "ลง 📉"}: ${priceDiff.toLocaleString()}

  💰 ราคาปัจจุบัน
    ซื้อ: ${data.Buy} บาท
    ขาย: ${data.Sell} บาท
  `;

  return message;
};
