import { LineNotifyToken } from "../../../models/line-notify-tokens.ts";
import { GoldPriceSummary } from "../../../models/gold-price-summary.ts";
import { OutputInterface } from "../output-interface.ts";
import { convertSummaryDataToString } from "../output-utils.ts";

/* @deprecated
Obsolete. Line Notify is not available anymore.
Use TelegramOutput instead.
 */
export default class LineNotifyOutput implements OutputInterface {
  private _lineNotifyTokens: LineNotifyToken[] | null = process.env
    .LINE_NOTIFY_TOKENS
    ? JSON.parse(process.env.LINE_NOTIFY_TOKENS)
    : null;

  async output(summary: GoldPriceSummary) {
    console.log("\n");
    if (!this._lineNotifyTokens) {
      console.log(
        "Line notify is not setup - skip sending message via Line Notify"
      );
      return;
    }

    const message = convertSummaryDataToString(summary);
    await this.outputMessage(message);
  }

  async outputMessage(message: string) {
    const lineNotifyTokenPromises = this._lineNotifyTokens!.map(
      async (lineNotifyToken) => {
        console.log(
          `Sending summary message to ${lineNotifyToken.description}`
        );
        const result = await fetch("https://notify-api.line.me/api/notify", {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            Authorization: `Bearer ${lineNotifyToken.token}`,
          },
          body: new URLSearchParams({
            message,
          }),
        });

        await fetch("https://notify-api.line.me/api/notify", {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            Authorization: `Bearer ${lineNotifyToken.token}`,
          },
          body: new URLSearchParams({
            message: `
            LINE Notification จะยุติการให้บริการในวันที่ 31 มี.ค. 2568 ติดตามช่องทางใหม่ได้ที่ https://t.me/+Dpa2HWiqxHRjM2E1
            `,
          }),
        });

        console.log(
          `Successfully sent summary message to ${lineNotifyToken.description}`
        );
        return result;
      }
    );

    const result = await Promise.allSettled(lineNotifyTokenPromises);
    console.log("Line notify result", result);
  }
}
