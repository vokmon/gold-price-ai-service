import cron from "node-cron";
import { runProcess } from "./index.ts";

const cronSchedule = process.env.CRON_SCHEDULE || "0 9,17 * * 1-6";
const timezone = process.env.TIME_ZONE || "Asia/Bangkok";
const name = "Gold price service cron";

console.log("\n");
console.log(`Start cron with schedule ${cronSchedule}, timezone: ${timezone}`);
console.log("\n");

cron.schedule(cronSchedule, () => {
  runProcess();
}, {
  timezone,
  name,
});
