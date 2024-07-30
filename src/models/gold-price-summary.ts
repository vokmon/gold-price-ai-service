export type GoldPriceSummary = {
  hasEnoughData: boolean;
  currentPrice: { buy: number; sell: number };
  predictions: string[];
  information: string[];
  suggestions: string[];
  createdDate: Date;
};
