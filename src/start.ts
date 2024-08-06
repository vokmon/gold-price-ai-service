import MainApplication from "./main-application.ts";
const mainApp = new MainApplication();
await mainApp.runProcess();
await mainApp.monitorPrice();