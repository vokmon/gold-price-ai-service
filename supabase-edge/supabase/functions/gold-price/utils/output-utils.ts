import { getCurrentDateTime } from "./date-utils.ts";
import { HuasenghengDataType } from "../types/huasengheng.type.ts";
import { GoldPriceSummary } from "../types/gold-price-summary.type.ts";

export const convertSummaryDataToString = (summary: GoldPriceSummary) => {
  const currentDate = getCurrentDateTime("th-TH");
  let message = `
🔔 ข้อมูลราคาทองคำ ${currentDate}

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
  🔔🔔🔔 ราคามีการเปลี่ยนแปลงสูง
  จากเวลา: ${diffTime}
  ราคา${priceDiff > 0 ? "ขึ้น 🔺 " : "ลง 🔻"}: ${priceDiff.toLocaleString()}

  💰 ราคาปัจจุบัน
    ซื้อ: ${data.Buy.toLocaleString()} บาท
    ขาย: ${data.Sell.toLocaleString()} บาท
  `;

  return message;
};
