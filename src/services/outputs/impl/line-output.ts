import { LineNotifyToken } from "../../../models/line-notify-tokens.ts";
import { GoldPriceSummary } from "../../../models/gold-price-summary.ts";
import { OutputInterface } from "../output-interface.ts";
import { convertSummaryDataToString } from "../output-utils.ts";

export default class LineNotifyOutput implements OutputInterface {
  private _lineNotifyTokens: LineNotifyToken[] | null = process.env
    .LINE_NOTIFY_TOKENS
    ? JSON.parse(process.env.LINE_NOTIFY_TOKENS)
    : null;

  async output(summary: GoldPriceSummary) {
    if (!this._lineNotifyTokens) {
      console.log(
        "Line notify is not setup - skip sending message via Line Notify"
      );
      return;
    }
    const message = convertSummaryDataToString(summary);
    const lineNotifyTokenPromises = this._lineNotifyTokens.map(async (lineNotifyToken) => {
      console.log(`Sending summary message to ${lineNotifyToken.description}`);
      const result = await fetch("https://notify-api.line.me/api/notify", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Authorization: `Bearer ${lineNotifyToken.token}`,
        },
        body: new URLSearchParams({
          message,
          stickerPackageId: "789",
          stickerId: "10855",
        }),
      });
      console.log(`Successfully sent summary message to ${lineNotifyToken.description}`);
      return result;
    });
    
    const result = await Promise.allSettled(lineNotifyTokenPromises);
    console.log("Line notify result", result);
  }
}
