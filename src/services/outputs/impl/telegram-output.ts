import { TelegramNotifyChannel } from "~/models/telegram-notify-channels.ts";
import { GoldPriceSummary } from "../../../models/gold-price-summary.ts";
import { OutputInterface } from "../output-interface.ts";
import { convertSummaryDataToString } from "../output-utils.ts";

export default class TelegramOutput implements OutputInterface {
  private _telegramBotToken: string | undefined =
    process.env.TELEGRAM_BOT_TOKEN;
  private _telegramChannelIds: TelegramNotifyChannel[] | null = process.env
    .TELEGRAM_CHANNEL_IDS
    ? JSON.parse(process.env.TELEGRAM_CHANNEL_IDS)
    : null;

  async outputMessage(message: string) {
    console.log("\n");
    if (
      !this._telegramBotToken ||
      !this._telegramChannelIds ||
      this._telegramChannelIds.length === 0
    ) {
      console.log(
        "Telegram out is not setup - skip sending message via https://web.telegram.org"
      );
      return;
    }

    const telegramNotifyPromises = this._telegramChannelIds!.map(
      async (channelId) => {
        console.log(`Sending summary message to ${channelId.description}`);
        const result = await fetch(
          `https://api.telegram.org/bot${this._telegramBotToken}/sendMessage`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              chat_id: channelId.channelId,
              text: message,
            }),
          }
        );
        console.log(
          `Successfully sent summary message to ${channelId.description}`
        );
        return result;
      }
    );

    const result = await Promise.allSettled(telegramNotifyPromises);
    console.log("Telegram notify result", result);
  }
}
