import { GoldPriceSummary } from "~/models/gold-price-summary.ts";

export interface OutputInterface {
  output: (summary: GoldPriceSummary) => Promise<void>;

  outputMessage: (message: string) => Promise<void>;
};
