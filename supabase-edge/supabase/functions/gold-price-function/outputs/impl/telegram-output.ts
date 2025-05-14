import { OutputInterface } from "../output-interface.ts";

type TelegramNotifyChannel = {
  channelId: string;
  description: string;
};

export default class TelegramOutput implements OutputInterface {
  private _telegramBotToken: string | undefined =
    Deno.env.get("TELEGRAM_BOT_TOKEN");
  private _telegramChannelIds: TelegramNotifyChannel[] | null = Deno.env.get(
    "TELEGRAM_CHANNEL_IDS"
  )
    ? JSON.parse(Deno.env.get("TELEGRAM_CHANNEL_IDS")!)
    : null;

  async outputMessage(message: string) {
    if (!this.checkTelegramSetup()) {
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
    console.log("Telegram send summary notify result", result);
  }

  async outputImage(imageBuffer: Buffer, description: string) {
    if (!this.checkTelegramSetup()) {
      return;
    }

    console.log("Output image to Telegram with description: ", description);
    const telegramNotifyPromises = this._telegramChannelIds!.map(
      async (channelId) => {
        console.log(`Sending image to ${channelId.description}`);

        // Create form data with the image buffer
        const formData = new FormData();
        formData.append("chat_id", channelId.channelId);
        formData.append("photo", new Blob([imageBuffer]), "chart.png");

        if (description) {
          formData.append("caption", description);
        }

        const result = await fetch(
          `https://api.telegram.org/bot${this._telegramBotToken}/sendPhoto`,
          {
            method: "POST",
            body: formData,
          }
        );

        console.log(`Successfully sent image to ${channelId.description}`);
        return result;
      }
    );

    const result = await Promise.allSettled(telegramNotifyPromises);
    console.log("Telegram send image notify result", result);
  }

  private checkTelegramSetup() {
    console.log("\n");
    if (
      !this._telegramBotToken ||
      !this._telegramChannelIds ||
      this._telegramChannelIds.length === 0
    ) {
      console.log(
        "Telegram out is not setup - skip sending image via https://web.telegram.org"
      );
      return false;
    }
    return true;
  }

  toString() {
    return `TelegramOutput(telegramBotToken: ${this._telegramBotToken}, telegramChannelIds: ${this._telegramChannelIds})`;
  }
}
