import { formatDateAsDDMMYYYY, getFormattedDate } from "~/utils/date-utils.ts";
import { GoldPricePeriodGraphData } from "~/models/gold-price-period-graph.ts";
import { convertGoldPricePeriodGraphToString } from "~/services/outputs/output-utils.ts";
import { GoldPriceGraphType } from "~/models/gold-price-graph.ts";
import { GoldPriceAggregate, TimePeriod } from "~/models/gold-price.ts";
import GeneratePriceGraph from "~/services/graph/generate-price-graph.ts";
import {
  GoldPriceDbRepository,
  PriceRangeData,
} from "~/repositories/database/gold-price-db-repository.ts";
import Huasengheng from "~/services/huasengheng/huasengheng-service.ts";
import { HuasenghengDataType } from "~/models/huasengheng.ts";

export default class GoldPricePeriodGraph {
  private MIN_PRICE_BAR_HEIGHT = 20;

  private _huasengheng: Huasengheng;
  private _generatePriceGraph: GeneratePriceGraph;
  private _goldPriceDbRepo: GoldPriceDbRepository;

  constructor() {
    this._generatePriceGraph = new GeneratePriceGraph();
    this._goldPriceDbRepo = new GoldPriceDbRepository();
    this._huasengheng = new Huasengheng();
  }

  async getGoldPricePeriodGraph(
    startDate: Date,
    endDate: Date,
    graphType: GoldPriceGraphType
  ): Promise<GoldPricePeriodGraphData> {
    console.log(
      `📊 Getting gold price period graph for period from ${getFormattedDate(
        startDate
      )} to ${getFormattedDate(endDate)}`
    );

    // Check if endDate is today or in the future
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const endDateIsToday = endDate.getTime() >= today.getTime();

    // Determine the appropriate period based on graph type
    let period: TimePeriod;
    switch (graphType) {
      case GoldPriceGraphType.HOUR:
      case GoldPriceGraphType.HOUR_WITH_DAY:
        period = "hour";
        break;
      case GoldPriceGraphType.MONTH:
        period = "month";
        break;
      case GoldPriceGraphType.YEAR:
        period = "year";
        break;
      case GoldPriceGraphType.DAY:
      default:
        period = "day";
    }

    try {
      // Prepare promises array for parallel execution
      const promisesToAwait: Promise<any>[] = [
        this._goldPriceDbRepo.getAggregatedDataByPeriod(
          period,
          startDate,
          endDate
        ),
        this._goldPriceDbRepo.getPriceRangeData(startDate, endDate),
      ];

      // Add Huasengheng promise if end date is today
      if (endDateIsToday) {
        console.log("🔍 Fetching huasengheng current price");
        // Add the promise with error handling
        promisesToAwait.push(
          this._huasengheng.getCurrentHuasenghengPrice().catch((error) => {
            console.error("Error fetching huasengheng data:", error);
            return undefined;
          })
        );
      } else {
        console.log(
          "🚫 End date is not today, skipping huasengheng current price"
        );
      }

      // Execute all promises in parallel
      const results = await Promise.all(promisesToAwait);

      // Extract results
      const aggregatedData = results[0] as GoldPriceAggregate[];
      const priceRangeData = results[1] as PriceRangeData;
      const huasenghengData = endDateIsToday
        ? (results[2] as HuasenghengDataType | undefined)
        : undefined;

      console.log(`🔎 Found ${aggregatedData.length} aggregated data points`);
      console.log(`📊 Price range data:`, priceRangeData);

      if (huasenghengData) {
        console.log(`🔎 Huasengheng current price data: `, huasenghengData);
      } else if (endDateIsToday) {
        console.log("⚠️ Huasengheng data not available");
      }

      // Check if we have any data
      if (aggregatedData.length === 0 && !huasenghengData) {
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

      // Generate the chart with all available data
      return this.generateGoldPriceChartFromAggregateData(
        aggregatedData,
        priceRangeData,
        huasenghengData,
        startDate,
        endDate,
        graphType
      );
    } catch (error) {
      console.error("Error fetching data:", error);

      return {
        dataPeriod: {
          startDate,
          endDate,
        },
        chartAsBuffer: undefined,
        description: `❌ เกิดข้อผิดพลาดในการดึงข้อมูลราคาทองคำสำหรับช่วงวันที่ ${getFormattedDate(
          startDate
        )} ถึง ${getFormattedDate(endDate)}`,
      };
    }
  }

  private async generateGoldPriceChartFromAggregateData(
    aggregatedData: GoldPriceAggregate[],
    priceRangeData: PriceRangeData,
    huasenghengData: HuasenghengDataType | undefined,
    startDate: Date,
    endDate: Date,
    graphType: GoldPriceGraphType
  ): Promise<GoldPricePeriodGraphData> {
    const chartTitle =
      graphType === GoldPriceGraphType.HOUR
        ? `ราคาทองคำ (${getFormattedDate(endDate)})`
        : `ราคาทองคำ (${getFormattedDate(startDate)} - ${getFormattedDate(
            endDate
          )})`;

    // Prepare chart data
    const { labels, dataArray } = this.prepareChartDataFromAggregates(
      aggregatedData,
      graphType
    );

    // Create properly typed line chart data array
    const dataArrayForLineChart = dataArray.map((item) => {
      // Ensure both values are numbers
      const min =
        typeof item[0] === "string" ? parseFloat(item[0]) : Number(item[0]);
      const max =
        typeof item[1] === "string" ? parseFloat(item[1]) : Number(item[1]);
      return (min + max) / 2;
    });

    console.log("Line chart data:", dataArrayForLineChart);

    const imageBuffer = await this._generatePriceGraph.generatePriceGraph({
      labels,
      dataArrayForBarChart: dataArray,
      dataArrayForLineChart,
      chartTitle,
    });

    // Extract price data for description using the priceRangeData and huasengheng data
    const priceData = this.extractPriceDataWithRangeData(
      aggregatedData,
      priceRangeData,
      huasenghengData
    );

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

  private prepareChartDataFromAggregates(
    aggregatedData: GoldPriceAggregate[],
    graphType: GoldPriceGraphType
  ) {
    // Get the labels based on date_time
    let labels: string[] = [];
    const dataArray: number[][] = [];

    for (const record of aggregatedData) {
      const date = record.date_time;
      let label: string;

      switch (graphType) {
        case GoldPriceGraphType.HOUR:
          // Format: HH:00
          label = `${date.getHours()}:00`;
          break;
        case GoldPriceGraphType.HOUR_WITH_DAY:
          // Format: DD/MM/YYYY HH:00
          label = `${formatDateAsDDMMYYYY(date)} ${date.getHours()}:00`;
          break;
        case GoldPriceGraphType.MONTH:
          // Format: MM/YYYY
          label = `${date.getMonth() + 1}/${date.getFullYear()}`;
          break;
        case GoldPriceGraphType.YEAR:
          // Format: YYYY
          label = `${date.getFullYear()}`;
          break;
        case GoldPriceGraphType.DAY:
        default:
          // Format: DD/MM/YYYY
          label = formatDateAsDDMMYYYY(date);
      }

      labels.push(label);

      // Explicitly convert to numbers to ensure consistent types
      const minPrice =
        typeof record.min_sell === "string"
          ? parseFloat(record.min_sell)
          : Number(record.min_sell);
      const maxPrice =
        typeof record.max_sell === "string"
          ? parseFloat(record.max_sell)
          : Number(record.max_sell);

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

    // Process labels for HOUR_WITH_DAY to hide repeated dates
    if (graphType === GoldPriceGraphType.HOUR_WITH_DAY && labels.length > 0) {
      console.log(`📊 Processing labels for HOUR_WITH_DAY`);
      // Sort labels chronologically
      const sortedIndexes = labels
        .map((_, i) => i)
        .sort((a, b) => {
          const labelA = labels[a] || "";
          const labelB = labels[b] || "";
          return labelA.localeCompare(labelB);
        });

      // Create new arrays with sorted data
      const sortedLabels: string[] = [];
      const sortedDataArray: number[][] = [];

      for (const idx of sortedIndexes) {
        const label = labels[idx];
        const data = dataArray[idx];

        if (label !== undefined && data !== undefined) {
          sortedLabels.push(label);
          sortedDataArray.push(data);
        }
      }

      labels = sortedLabels;
      dataArray.length = 0; // Clear the array
      dataArray.push(...sortedDataArray); // Add sorted data

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

    console.log(`📊 Prepared ${labels.length} data points for chart`);
    console.log("Final dataArray:", dataArray);

    return {
      labels,
      dataArray,
    };
  }

  /**
   * Extract price data using the price range data from database and huasengheng data if available
   */
  private extractPriceDataWithRangeData(
    aggregatedData: GoldPriceAggregate[],
    priceRangeData: PriceRangeData,
    huasenghengData?: HuasenghengDataType
  ) {
    if (aggregatedData.length === 0 && !huasenghengData) {
      return {
        minPrice: 0,
        maxPrice: 0,
        priceDifference: 0,
        latestPrice: 0,
        earliestPrice: 0,
      };
    }

    // Find min and max prices from aggregated data
    let minPrice = Number.MAX_VALUE;
    let maxPrice = Number.MIN_VALUE;

    for (const record of aggregatedData) {
      // Ensure consistent number conversions
      const min =
        typeof record.min_sell === "string"
          ? parseFloat(record.min_sell)
          : Number(record.min_sell);
      const max =
        typeof record.max_sell === "string"
          ? parseFloat(record.max_sell)
          : Number(record.max_sell);

      if (min < minPrice) {
        minPrice = min;
      }
      if (max > maxPrice) {
        maxPrice = max;
      }
    }

    // Get earliest price from price range data
    const earliestPrice =
      typeof priceRangeData.earliest_price === "string"
        ? parseFloat(priceRangeData.earliest_price)
        : Number(priceRangeData.earliest_price);

    // Get latest price - prioritize Huasengheng data if available
    let latestPrice;
    let priceSource: string;

    if (huasenghengData && huasenghengData.Sell) {
      // Use Huasengheng price if available
      latestPrice =
        typeof huasenghengData.Sell === "string"
          ? parseFloat(huasenghengData.Sell)
          : Number(huasenghengData.Sell);
      priceSource = "🧈 Huasengheng API (real-time)";
    } else {
      // Otherwise use the latest price from database
      latestPrice =
        typeof priceRangeData.latest_price === "string"
          ? parseFloat(priceRangeData.latest_price)
          : Number(priceRangeData.latest_price);
      priceSource = "🗂️ Database record";
    }

    // Update min/max if Huasengheng price extends the range
    if (latestPrice > maxPrice) {
      maxPrice = latestPrice;
    }
    if (latestPrice < minPrice && minPrice !== Number.MAX_VALUE) {
      minPrice = latestPrice;
    }

    // Ensure we have valid min/max values even with limited data
    if (minPrice === Number.MAX_VALUE) {
      minPrice = latestPrice || 0;
    }
    if (maxPrice === Number.MIN_VALUE) {
      maxPrice = latestPrice || 0;
    }

    // Calculate price difference
    const priceDifference = latestPrice - earliestPrice;

    console.log(
      `👉 First price: ${earliestPrice} at ${priceRangeData.earliest_time}`
    );
    console.log(`👉 Latest price: ${latestPrice} (source: ${priceSource})`);
    console.log(`👉 Price difference: ${priceDifference}`);

    return {
      minPrice,
      maxPrice,
      priceDifference,
      latestPrice,
      earliestPrice,
    };
  }
}
