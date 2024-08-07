import cron from "node-cron";
import MainApplication from "./main-application.ts";

const cronSummarySchedule = process.env.CRON_SUMMARY_SCHEDULE || "0 9,17 * * 1-6";
const cronPriceDiffSchedule = process.env.CRON_MONITOR_PRICE || "*/15 * * * *"
const timezone = process.env.TIME_ZONE || "Asia/Bangkok";
const summaryCronName = "Gold price summary service cron job";
const priceMonitoringCronName = "Gold price price monitoring service cron job";

const mainApp = new MainApplication();

console.log("\n");
console.log(`Start summary cron job with the setup\nschedule: ${cronSummarySchedule}, timezone: ${timezone}`);
console.log("\n");

cron.schedule(cronSummarySchedule, async () => {
  try {
    await mainApp.runProcess();
  } catch (e) {
    console.log("An error occurs");
    console.log(e);
  }
}, {
  timezone,
  name: summaryCronName,
});


console.log("\n");
console.log(`Start price monitoring cron job with the setup\nschedule: ${cronPriceDiffSchedule}, timezone: ${timezone}`);
console.log("\n");

const priceTreshold = Number(process.env.PRICE_DIFF_THRESHOLD || 100);

cron.schedule(cronPriceDiffSchedule, async () => {
  try {
    await mainApp.monitorPrice(priceTreshold);
  } catch (e) {
    console.log("An error occurs");
    console.log(e);
  }
}, {
  timezone,
  name: priceMonitoringCronName,
  runOnInit: true,
});

