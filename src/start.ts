import MainApplication from "./main-application.ts";
const mainApp = new MainApplication();
await mainApp.runProcess();
await mainApp.monitorPrice(100);
process.exit(0);