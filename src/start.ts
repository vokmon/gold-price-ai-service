import MainApplication from "./main-application.ts";
const mainApp = new MainApplication();
// await mainApp.runProcess();
// await mainApp.monitorPrice(-10);

// await mainApp.summarizeGoldPricePeriod(new Date("2025-05-04"), new Date());

await mainApp.summarizeGoldPricePeriodWithGraph(
  new Date("2025-05-12"),
  new Date("2025-05-12:23:59:00")
);

process.exit(0);
