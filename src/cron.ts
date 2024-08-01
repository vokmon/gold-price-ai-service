import cron from "node-cron";
import MainApplication from "./main-application.ts";

const cronSchedule = process.env.CRON_SCHEDULE || "0 9,17 * * 1-6";
const timezone = process.env.TIME_ZONE || "Asia/Bangkok";
const name = "Gold price service cron job";

const mainApp = new MainApplication();

console.log("\n");
console.log(`Start cron job with the setup\nschedule: ${cronSchedule}, timezone: ${timezone}`);
console.log("\n");

cron.schedule(cronSchedule, async () => {
  try {
    await mainApp.runProcess();
  } catch (e) {
    console.log("An error occurs");
    console.log(e);
  }
}, {
  timezone,
  name,
});
