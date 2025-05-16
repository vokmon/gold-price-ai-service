import MainApplication from "./main-application.ts";
import { GoldPriceGraphType } from "./models/gold-price-graph.ts";
const mainApp = new MainApplication();
// await mainApp.runProcess();
// await mainApp.monitorPrice(-10);

// await mainApp.summarizeGoldPricePeriod(new Date("2025-05-13"), new Date());

await mainApp.summarizeGoldPricePeriodWithGraph(
  new Date("2025-05-16:00:00:00"),
  new Date("2025-05-16:23:01:00"),
  GoldPriceGraphType.HOUR_WITH_DAY
);

// await mainApp.recordGoldPriceData();
process.exit(0);
