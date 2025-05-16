import { FirestoreRepo } from "~/repositories/firebase/firestore/firestore.ts";
import { formatDateAsDDMMYYYY, getFormattedDate } from "~/utils/date-utils.ts";
import { GoldPricePeriodGraphData } from "~/models/gold-price-period-graph.ts";
import { Timestamp } from "firebase-admin/firestore";
import { convertGoldPricePeriodGraphToString } from "~/services/outputs/output-utils.ts";
import Huasengheng from "~/services/huasengheng/huasengheng-service.ts";
import { GoldPriceGraphType } from "~/models/gold-price-graph.ts";
import { GoldPricePersisted } from "~/models/gold-price.ts";
import GeneratePriceGraph from "~/services/graph/generate-price-graph.ts";

export default class GoldPricePeriodGraph {
  private HUASENGHENG_ID = "huasengheng-current-price-id";
  private MIN_PRICE_BAR_HEIGHT = 20;

  private FIRESTORE_COLLECTION_PRICE_RECORD =
    process.env.FIRESTORE_COLLECTION_PRICE_RECORD!;

  private _firestoreRepo: FirestoreRepo;
  private _huasengheng: Huasengheng;
  private _generatePriceGraph: GeneratePriceGraph;

  constructor() {
    this._firestoreRepo = new FirestoreRepo();
    this._huasengheng = new Huasengheng();
    this._generatePriceGraph = new GeneratePriceGraph();
  }

  async getGoldPricePeriodGraph(
    startDate: Date,
    endDate: Date,
    graphType: GoldPriceGraphType
  ): Promise<GoldPricePeriodGraphData> {
    console.log(
      `📊 Getting gold price period graph from collection ${
        this.FIRESTORE_COLLECTION_PRICE_RECORD
      } from ${getFormattedDate(startDate)} to ${getFormattedDate(endDate)}`
    );

    const promises = [
      this._firestoreRepo.getDocumentsByDatetime<GoldPricePersisted>(
        this.FIRESTORE_COLLECTION_PRICE_RECORD,
        startDate,
        endDate
      ),
    ] as any[];

    // Check if endDate is today or in the future
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const endDateIsToday = endDate.getTime() >= today.getTime();

    // Only fetch current price if endDate includes today
    if (endDateIsToday) {
      console.log("🔍 Fetching huasengheng current price");
      promises.push(this._huasengheng.getCurrentHuasenghengPrice());
    } else {
      console.log(
        "🚫 End date is not today, skipping huasengheng current price"
      );
    }

    const result = await Promise.allSettled(promises);

    const goldPriceData =
      /* c8 ignore next */ result?.[0]?.status === "fulfilled"
        ? result[0].value
        : /* c8 ignore next */ [];

    const huasenghengData =
      endDateIsToday && result?.[1]?.status === "fulfilled"
        ? /* c8 ignore next */ result[1].value
        : /* c8 ignore next */ undefined;

    console.log(`🔎 Found ${goldPriceData.length} documents`);
    console.log(`🔎 Huasengheng data: `, huasenghengData);

    if (huasenghengData) {
      console.log("📊 Adding huasengheng data to gold price data");
      goldPriceData.push({
        createdDateTime: Timestamp.now(),
        currentPrice: huasenghengData,
        priceAlert: true,
        priceDiff: 0,
        id: this.HUASENGHENG_ID,
      });
    }
    if (goldPriceData.length === 0) {
      return {
        dataPeriod: {
          startDate,
          endDate,
        },
        chartAsBuffer: undefined,
        description: `❌ ไม่พบข้อมูลราคาทองคำสำหรับช่วงวันที่ ${getFormattedDate(
          startDate
        )} ถึง ${getFormattedDate(endDate)}`,
      };
    }

    return this.generateGoldPriceChart(
      goldPriceData,
      startDate,
      endDate,
      graphType
    );
  }

  private async generateGoldPriceChart(
    goldPriceData: GoldPricePersisted[],
    startDate: Date,
    endDate: Date,
    graphType: GoldPriceGraphType
  ): Promise<GoldPricePeriodGraphData> {
    // Group data by day
    const groupedData = this.groupData(goldPriceData, graphType);

    const chartTitle =
      graphType === GoldPriceGraphType.HOUR
        ? `ราคาทองคำ (${getFormattedDate(endDate)})`
        : `ราคาทองคำ (${getFormattedDate(startDate)} - ${getFormattedDate(
            endDate
          )})`;

    // Prepare chart data
    const { labels, dataArray } = this.prepareChartData(groupedData, graphType);

    // Ensure labels has at least 10 elements
    const dataArrayForLineChart = dataArray.map(
      (item) =>
        ((item?.[0] /* c8 ignore next */ ?? 0) +
          (item?.[1] /* c8 ignore next */ ?? 0)) /
        2
    );

    const imageBuffer = await this._generatePriceGraph.generatePriceGraph({
      labels,
      dataArrayForBarChart: dataArray,
      dataArrayForLineChart,
      chartTitle,
    });

    const priceData = this.extractPriceData(goldPriceData);

    const description = `${chartTitle}\n
    ${convertGoldPricePeriodGraphToString(priceData)}
    `;

    console.log(`📊📃 Description of the chart: `, description);

    return {
      dataPeriod: {
        startDate,
        endDate,
      },
      chartAsBuffer: imageBuffer as Buffer,
      description: `📊 ${description}`,
    };
  }

  private prepareChartData(
    groupedData: Record<string, GoldPricePersisted[]>,
    graphType: GoldPriceGraphType
  ) {
    // Get the keys (labels)
    let labels = Object.keys(groupedData);

    // Process labels for HOUR_WITH_DAY
    if (graphType === GoldPriceGraphType.HOUR_WITH_DAY) {
      console.log(`📊 Processing labels for HOUR_WITH_DAY`);
      // Sort labels chronologically - we expect format "DD/MM/YYYY HH:00"
      labels = labels.sort((a, b) => {
        // Simple string comparison works because of the DD/MM/YYYY format
        return a.localeCompare(b);
      });

      // Process labels to hide repeated dates
      let previousDate: string | null = null;
      labels = labels.map((label) => {
        // Split by space to separate date and time
        const parts = label.split(" ");
        // We expect exactly 2 parts for date time format
        if (parts.length === 2) {
          const date = parts[0] || "";
          const time = parts[1] || "";

          if (date === previousDate) {
            // Return only time if date is the same as previous
            return time;
          } else {
            // Update previous date and return full label
            previousDate = date;
            return label;
          }
        }
        // Return original label if format is unexpected
        return label;
      });
    }

    console.log(`📊 Grouped data: `, labels);

    // Prepare price data arrays
    const highestValues: number[] = [];
    const lowestValues: number[] = [];
    const dataArray: number[][] = [];

    for (const record in groupedData) {
      const prices =
        groupedData[record]?.map((item) => item.Sell) /* c8 ignore next */ ||
        [];

      const minPrice = Math.min(...prices);
      const maxPrice = Math.max(...prices);
      highestValues.push(maxPrice);
      lowestValues.push(minPrice);

      if (minPrice === maxPrice) {
        // If the min and max price are the same, we need to add a small buffer to display the bar
        dataArray.push([
          minPrice - this.MIN_PRICE_BAR_HEIGHT,
          minPrice + this.MIN_PRICE_BAR_HEIGHT,
        ]);
      } else {
        dataArray.push([minPrice, maxPrice]);
      }
    }

    return {
      labels,
      dataArray,
    };
  }

  private groupData(data: GoldPricePersisted[], graphType: GoldPriceGraphType) {
    const validData = data.filter((item) => {
      if (!item.createdDateTime || !item.Sell) {
        return false;
      }
      return true;
    });

    const groupedData: Record<string, GoldPricePersisted[]> = {};

    validData.forEach((item) => {
      const date = (item.createdDateTime as unknown as Timestamp).toDate();
      let key: string;

      switch (graphType) {
        case GoldPriceGraphType.HOUR:
          // Format: HH:00
          key = `${date.getHours()}:00`;
          break;
        case GoldPriceGraphType.HOUR_WITH_DAY:
          // Format: DD/MM/YYYY HH:00
          key = `${formatDateAsDDMMYYYY(date)} ${date.getHours()}:00`;
          break;
        case GoldPriceGraphType.MONTH:
          // Format: MM/YYYY
          key = `${date.getMonth() + 1}/${date.getFullYear()}`;
          break;
        case GoldPriceGraphType.YEAR:
          // Format: YYYY
          key = `${date.getFullYear()}`;
          break;
        case GoldPriceGraphType.DAY:
        default:
          // Format: DD/MM/YYYY (for DAY and any other cases)
          key = formatDateAsDDMMYYYY(date);
      }

      if (!groupedData[key]) {
        groupedData[key] = [];
      }

      groupedData[key]!.push(item);
    });

    return groupedData;
  }

  private extractPriceData(data: GoldPricePersisted[]) {
    // Filter valid data with price information
    const validData = data.filter((item) => item.createdDateTime && item.Sell);

    if (validData.length === 0) {
      return {
        minPrice: 0,
        maxPrice: 0,
        priceDifference: 0,
        latestPrice: 0,
        earliestPrice: 0,
      };
    }

    // Convert all prices to numbers
    const prices = validData.map((item) => item.Sell);

    // Find min and max prices
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);
    console.log(`📊⬆️ Highest value: `, maxPrice);
    console.log(`📊⬇️ Lowest value: `, minPrice);

    // Sort data by date to find earliest and latest entries
    const sortedData = [...validData].sort((a, b) => {
      const dateA = (a.createdDateTime as unknown as Timestamp)
        .toDate()
        .getTime();
      const dateB = (b.createdDateTime as unknown as Timestamp)
        .toDate()
        .getTime();
      return dateA - dateB;
    });

    // Get earliest and latest prices
    const earliestPrice = sortedData[0]?.Sell /* c8 ignore next */ || 0;

    console.log(`💰 Latest price: `, sortedData[sortedData.length - 1]);

    const latestPrice =
      sortedData[sortedData.length - 1]?.Sell /* c8 ignore next */ || 0;

    // Calculate price difference
    const priceDifference = latestPrice - earliestPrice;

    return {
      minPrice,
      maxPrice,
      priceDifference,
      latestPrice,
      earliestPrice,
    };
  }
}
