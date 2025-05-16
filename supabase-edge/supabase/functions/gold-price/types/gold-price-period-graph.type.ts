export type GoldPricePeriodGraphData = {
  dataPeriod: {
    startDate: Date;
    endDate: Date;
  };
  chartAsBuffer?: Buffer;
  description: string;
};
