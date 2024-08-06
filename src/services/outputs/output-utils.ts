import { getCurrentDate, getCurrentDateTime, getTimeOfDay } from "../../utils/date-utils.ts";
import { GoldPriceSummary } from "../../models/gold-price-summary.ts";
import { HuasenghengDataType } from "../../models/huasengheng.ts";

export const convertSummaryDataToString = (summary: GoldPriceSummary) => {
  const currentDate = getCurrentDate("th-TH");
  const timeOfDay = getTimeOfDay();
  const message = `
ข้อมูลราคาทองคำ ${currentDate} รอบ${timeOfDay}

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

export const convertHuasenghengDataToString = (data: HuasenghengDataType) => {
  const message = `
  ${getCurrentDateTime("th-TH")}
  ราคาทองคำมีการเปลี่ยนแปลงสูง
  เปลี่ยนแปลง: ${data.BuyChange}

  💰 ราคาปัจจุบัน
    ซื้อ: ${data.Buy} บาท
    ขาย: ${data.Sell} บาท
  `;
  
  return message;
};
  