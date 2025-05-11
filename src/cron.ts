import cron from "node-cron";
import MainApplication from "./main-application.ts";

const cronSummarySchedule =
  process.env.CRON_SUMMARY_SCHEDULE || "0 9,17 * * 1-6";
const cronPriceDiffSchedule = process.env.CRON_MONITOR_PRICE || "*/15 * * * *";
const cronPeriodSummarySchedule =
  process.env.CRON_PERIOD_SUMMARY_SCHEDULE || "0 9,17 * * 1-6";

const cronPeriodMonthlySchedule =
  process.env.CRON_PERIOD_MONTHLY_SCHEDULE || "0 9 1 * *";
const cronPeriodYearlySchedule =
  process.env.CRON_PERIOD_YEARLY_SCHEDULE || "0 9 1 1 *";

const timezone = process.env.TIME_ZONE || "Asia/Bangkok";

const summaryCronName = "Gold price summary service cron job";
const priceMonitoringCronName = "Gold price price monitoring service cron job";
const periodSummaryCronName = "Gold price period summary service cron job";
const periodMonthlyCronName =
  "Gold price period monthly summary service cron job";
const periodYearlyCronName =
  "Gold price period yearly summary service cron job";

const mainApp = new MainApplication();

console.log("\n");
console.log(
  `Start summary cron job with the setup\nschedule: ${cronSummarySchedule}, timezone: ${timezone}`
);
console.log("\n");

cron.schedule(
  cronSummarySchedule,
  async () => {
    try {
      await mainApp.runProcess();
    } catch (e) {
      console.log("An error occurs");
      console.log(e);
    }
  },
  {
    timezone,
    name: summaryCronName,
  }
);

console.log("\n");
console.log(
  `🚀🚀🚀 Start price monitoring cron job with the setup\nschedule: ${cronPriceDiffSchedule}, timezone: ${timezone}`
);
console.log("\n");

const priceTreshold = Number(process.env.PRICE_DIFF_THRESHOLD || 100);

cron.schedule(
  cronPriceDiffSchedule,
  async () => {
    try {
      await mainApp.monitorPrice(priceTreshold);
    } catch (e) {
      console.log("An error occurs");
      console.log(e);
    }
  },
  {
    timezone,
    name: priceMonitoringCronName,
    runOnInit: true,
  }
);

console.log("\n");
console.log(
  `🚀🚀🚀 Start period summary cron job with the setup\nschedule: ${cronPeriodSummarySchedule}, timezone: ${timezone}`
);
console.log("\n");

cron.schedule(
  cronPeriodSummarySchedule,
  async () => {
    try {
      const startDate = new Date();
      startDate.setHours(0, 0, 0, 0);
      startDate.setDate(startDate.getDate() - 7);
      const endDate = new Date();
      await mainApp.summarizeGoldPricePeriod(startDate, endDate);
    } catch (e) {
      console.log("An error occurs");
      console.log(e);
    }
  },
  {
    timezone,
    name: periodSummaryCronName,
    runOnInit: false,
  }
);

console.log("\n");
console.log(
  `🚀🚀🚀 Start period monthly summary cron job with the setup\nschedule: ${cronPeriodMonthlySchedule}, timezone: ${timezone}`
);
console.log("\n");

cron.schedule(
  cronPeriodMonthlySchedule,
  async () => {
    try {
      const startDate = new Date();
      startDate.setDate(1);
      const endDate = new Date();
      endDate.setDate(endDate.getDate() - 1);
      endDate.setHours(23, 59, 59, 999);
      await mainApp.summarizeGoldPricePeriodWithGraph(startDate, endDate);
    } catch (e) {
      console.log("An error occurs");
      console.log(e);
    }
  },
  {
    timezone,
    name: periodMonthlyCronName,
    runOnInit: false,
  }
);

console.log("\n");
console.log(
  `🚀🚀🚀 Start period yearly summary cron job with the setup\nschedule: ${cronPeriodYearlySchedule}, timezone: ${timezone}`
);
console.log("\n");

cron.schedule(
  cronPeriodYearlySchedule,
  async () => {
    try {
      const startDate = new Date();
      startDate.setDate(1);
      startDate.setMonth(0);
      const endDate = new Date();
      endDate.setDate(endDate.getDate() - 1);
      endDate.setHours(23, 59, 59, 999);
      await mainApp.summarizeGoldPricePeriodWithGraph(startDate, endDate);
    } catch (e) {
      console.log("An error occurs");
      console.log(e);
    }
  },
  {
    timezone,
    name: periodYearlyCronName,
    runOnInit: false,
  }
);
