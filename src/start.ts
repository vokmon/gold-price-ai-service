import MainApplication from "./main-application.ts";
const mainApp = new MainApplication();
await mainApp.runProcess();
// await mainApp.monitorPrice(-10);

await mainApp.summarizeGoldPricePeriod(new Date("2025-05-03"), new Date());
process.exit(0);
