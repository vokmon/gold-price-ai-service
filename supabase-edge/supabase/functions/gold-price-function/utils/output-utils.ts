import { getCurrentDateTime } from "./date-utils.ts";
import { HuasenghengDataType } from "../types/huasengheng.type.ts";

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
