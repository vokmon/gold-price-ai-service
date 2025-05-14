import cron from "node-cron";
import MainApplication from "./main-application.ts";

// Environment variables with defaults
const cronConfig = {
  summary: process.env.CRON_SUMMARY_SCHEDULE || "0 9,17 * * 1-6",
  priceMonitoring: process.env.CRON_MONITOR_PRICE,
  priceRecord: process.env.CRON_PRICE_RECORD,

  periodSummary: process.env.CRON_PERIOD_SUMMARY_SCHEDULE || "0 9,17 * * 1-6",
  periodMonthly: process.env.CRON_PERIOD_MONTHLY_SCHEDULE || "0 9 1 * *",
  periodYearly: process.env.CRON_PERIOD_YEARLY_SCHEDULE || "0 9 1 1 *",

  timezone: process.env.TIME_ZONE || "Asia/Bangkok",
  priceTreshold: Number(process.env.PRICE_DIFF_THRESHOLD || 100),
};

const mainApp = new MainApplication();

/**
 * Helper function to setup and register a cron job
 * @param name Job name
 * @param schedule Cron schedule
 * @param handler Function to execute on schedule
 * @param runImmediately Whether to run the job immediately
 * @returns The created cron job
 */
function setupCronJob({
  name,
  schedule,
  handler,
  runImmediately = false,
}: {
  name: string;
  schedule?: string;
  handler: () => Promise<void>;
  runImmediately?: boolean;
}) {
  console.log("\n");

  if (!schedule) {
    console.log(`🔴🔴🔴 ${name} is not scheduled to run`);
    return;
  }
  console.log(
    `🚀🚀🚀 Start ${name} with the setup\nschedule: ${schedule}, timezone: ${cronConfig.timezone}`
  );
  console.log("\n");

  const job = cron.schedule(
    schedule,
    async () => {
      try {
        await handler();
      } catch (e) {
        console.log(`An error occurred in ${name}:`);
        console.log(e);
      }
    },
    {
      timezone: cronConfig.timezone,
      name,
    }
  );

  if (runImmediately) {
    job.execute();
  }

  return job;
}

// Setup all cron jobs
setupCronJob({
  name: "Gold price summary service",
  schedule: cronConfig.summary,
  handler: async () => await mainApp.runProcess(),
});

setupCronJob({
  name: "Gold price monitoring service",
  schedule: cronConfig.priceMonitoring,
  handler: async () => await mainApp.monitorPrice(cronConfig.priceTreshold),
  runImmediately: true,
});

setupCronJob({
  name: "Gold price period summary service",
  schedule: cronConfig.periodSummary,
  handler: async () => {
    const startDate = new Date();
    startDate.setHours(0, 0, 0, 0);
    startDate.setDate(startDate.getDate() - 7);
    const endDate = new Date();
    await mainApp.summarizeGoldPricePeriod(startDate, endDate);
  },
});

setupCronJob({
  name: "Gold price period monthly summary service",
  schedule: cronConfig.periodMonthly,
  handler: async () => {
    const startDate = new Date();
    startDate.setDate(1);
    const endDate = new Date();
    endDate.setDate(endDate.getDate() - 1);
    endDate.setHours(23, 59, 59, 999);
    await mainApp.summarizeGoldPricePeriodWithGraph(startDate, endDate);
  },
});

setupCronJob({
  name: "Gold price period yearly summary service",
  schedule: cronConfig.periodYearly,
  handler: async () => {
    const startDate = new Date();
    startDate.setDate(1);
    startDate.setMonth(0);
    const endDate = new Date();
    endDate.setDate(endDate.getDate() - 1);
    endDate.setHours(23, 59, 59, 999);
    await mainApp.summarizeGoldPricePeriodWithGraph(startDate, endDate);
  },
});

setupCronJob({
  name: "Gold price record service",
  schedule: cronConfig.priceRecord,
  handler: async () => await mainApp.recordGoldPriceData(),
  runImmediately: true,
});
