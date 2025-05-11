import MainApplication from "./main-application.ts";
const mainApp = new MainApplication();
// await mainApp.runProcess();
// await mainApp.monitorPrice(-10);

// await mainApp.summarizeGoldPricePeriod(new Date("2025-05-04"), new Date());

await mainApp.summarizeGoldPricePeriodWithGraph(
  new Date("2025-05-01"),
  new Date("2025-05-11")
);

process.exit(0);
