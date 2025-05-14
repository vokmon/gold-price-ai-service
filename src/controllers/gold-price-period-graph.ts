import { FirestoreRepo } from "~/repositories/firestore/firestore.ts";
import { formatDateAsDDMMYYYY, getFormattedDate } from "~/utils/date-utils.ts";
import { ChartJSNodeCanvas } from "chartjs-node-canvas";
import { GoldPricePeriodGraphData } from "~/models/gold-price-period-graph.ts";
import { GoldPriceAlertPersisted } from "~/models/gold-price-summary.ts";
import { Timestamp } from "firebase-admin/firestore";
import { convertGoldPricePeriodGraphToString } from "~/services/outputs/output-utils.ts";
import Huasengheng from "~/services/huasengheng/huasengheng-service.ts";
// import { randomUUID } from "crypto";
export default class GoldPricePeriodGraph {
  private FONT_SIZE = 26;
  private FONT_SIZE_TITLE = 22;
  private MIN_LABELS = 10;
  private HUASENGHENG_ID = "huasengheng-current-price-id";
  private MIN_PRICE_BAR_HEIGHT = 20;
  private GRAPH_OFFSET = 100;

  private FIRESTORE_COLLECTION_ALERT =
    process.env.FIRESTORE_COLLECTION_PRICE_ALERT!;

  private _firestoreRepo: FirestoreRepo;
  private _huasengheng: Huasengheng;

  constructor() {
    this._firestoreRepo = new FirestoreRepo();
    this._huasengheng = new Huasengheng();
  }

  async getGoldPricePeriodGraph(
    startDate: Date,
    endDate: Date
  ): Promise<GoldPricePeriodGraphData> {
    console.log(
      `Getting gold price period graph from collection ${
        this.FIRESTORE_COLLECTION_ALERT
      } from ${getFormattedDate(startDate)} to ${getFormattedDate(endDate)}`
    );

    const promises = [
      this._firestoreRepo.getDocumentsByDatetime<GoldPriceAlertPersisted>(
        this.FIRESTORE_COLLECTION_ALERT,
        startDate,
        endDate,
        {
          fields: ["createdDateTime", "currentPrice"],
        }
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

    const goldPriceAlertData =
      /* c8 ignore next */ result?.[0]?.status === "fulfilled"
        ? result[0].value
        : /* c8 ignore next */ [];

    const huasenghengData =
      endDateIsToday && result?.[1]?.status === "fulfilled"
        ? /* c8 ignore next */ result[1].value
        : /* c8 ignore next */ undefined;

    console.log(`Found ${goldPriceAlertData.length} documents`);
    console.log(`Huasengheng data: `, huasenghengData);

    if (huasenghengData) {
      console.log("Add huasengheng data to gold price alert data");
      goldPriceAlertData.push({
        createdDateTime: Timestamp.now(),
        currentPrice: huasenghengData,
        priceAlert: true,
        priceDiff: 0,
        id: this.HUASENGHENG_ID,
      });
    }
    if (goldPriceAlertData.length === 0) {
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

    return this.generateGoldPriceChart(goldPriceAlertData, startDate, endDate);
  }

  private async generateGoldPriceChart(
    goldPriceAlertData: GoldPriceAlertPersisted[],
    startDate: Date,
    endDate: Date
  ): Promise<GoldPricePeriodGraphData> {
    // Group data by day
    const { groupedData, isSameDay } = this.groupData(goldPriceAlertData);

    // Prepare chart data
    const labels = Object.keys(groupedData);

    const highestValues: number[] = [];
    const lowestValues: number[] = [];
    const dataArray: number[][] = [];

    for (const record in groupedData) {
      const prices =
        groupedData[record]?.map(
          (item) => item.currentPrice.Sell
        ) /* c8 ignore next */ || [];

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

    const highestValue = Math.max(...highestValues) + this.GRAPH_OFFSET;
    const lowestValue = Math.min(...lowestValues) - this.GRAPH_OFFSET;

    // Set up chart configuration
    const width = 1000;
    const height = 600;

    const chartJSNodeCanvas = new ChartJSNodeCanvas({
      width,
      height,
      backgroundColour: "white",
    });

    const chartTitle = isSameDay
      ? `ราคาทองคำ (${getFormattedDate(endDate)})`
      : `ราคาทองคำ (${getFormattedDate(startDate)} - ${getFormattedDate(
          endDate
        )})`;

    // Ensure labels has at least 10 elements
    if (labels.length < this.MIN_LABELS) {
      const emptyLabelsToAdd = this.MIN_LABELS - labels.length;
      for (let i = 0; i < emptyLabelsToAdd; i++) {
        labels.push("");
      }
    }

    const configuration = {
      type: "bar",
      data: {
        labels: labels,
        datasets: [
          {
            label: "ราคาทองคำ",
            data: dataArray,
            backgroundColor: "rgba(55, 162, 240, 0.6)",
            borderColor: "rgba(55, 162, 240, 1)",
            borderWidth: 1,
            borderRadius: 5,
            borderSkipped: false,
          },
          {
            data: dataArray.map(
              (item) =>
                ((item?.[0] /* c8 ignore next */ ?? 0) +
                  (item?.[1] /* c8 ignore next */ ?? 0)) /
                2
            ),
            backgroundColor: "rgba(255, 70, 120, 1)", // Golden rod
            borderColor: "rgba(200, 75, 105, 1)", // Darker gold for border
            borderWidth: 2,
            pointRadius: 0,
            tension: 0,
            type: "line",
          },
        ],
      },
      options: {
        plugins: {
          title: {
            display: true,
            text: chartTitle,
          },
          legend: {
            display: false,
            position: "top",
          },
        },

        scales: {
          y: {
            beginAtZero: false,
            offset: true,
            min: lowestValue,
            max: highestValue,
            title: {
              display: true,
              text: "ราคา (บาท)",
              font: {
                size: this.FONT_SIZE_TITLE,
              },
            },
            ticks: {
              font: {
                size: this.FONT_SIZE,
              },
            },
          },
          x: {
            title: {
              display: false,
              text: "วันที่",
              font: {
                size: this.FONT_SIZE_TITLE,
              },
            },
            ticks: {
              font: {
                size: this.FONT_SIZE,
              },
            },
          },
        },
      },
    };

    // Generate chart as image buffer
    const imageBuffer = await chartJSNodeCanvas.renderToBuffer(
      configuration as any
    );

    // THIS IS FOR SAVING THE CHART TO A FILE

    // const fs = await import("fs/promises");
    // const path = await import("path");

    // const outputDir = "./output";
    // await fs.mkdir(outputDir, { recursive: true });

    // const fileName = `gold-price-chart-${new Date().getTime()}.png`;
    // const filePath = path.join(outputDir, fileName);

    // await fs.writeFile(filePath, imageBuffer);
    // console.log(`Chart has been generated and saved to ${filePath}`);

    const priceData = this.extractPriceData(goldPriceAlertData);

    const description = `${chartTitle}\n
    ${convertGoldPricePeriodGraphToString(priceData)}
    `;

    return {
      dataPeriod: {
        startDate,
        endDate,
      },
      chartAsBuffer: imageBuffer,
      description: `📊 ${description}`,
    };
  }

  private groupData(data: GoldPriceAlertPersisted[]) {
    // First, determine the date range of the data
    let minDate: Date | null = null;
    let maxDate: Date | null = null;

    const validData = data.filter((item) => {
      if (
        !item.createdDateTime ||
        !item.currentPrice ||
        !item.currentPrice.Sell
      ) {
        return false;
      }
      return true;
    });

    validData.forEach((item) => {
      const date = (item.createdDateTime as unknown as Timestamp).toDate();
      if (!minDate || date < minDate) minDate = date;
      if (!maxDate || date > maxDate) maxDate = date;
    });

    // Determine grouping type
    let groupingType: "hour" | "day" | "month" = "day"; // Default

    if (minDate && maxDate) {
      // Check if all data is within the same day
      const isSameDay =
        (minDate as Date).getDate() === (maxDate as Date).getDate() &&
        (minDate as Date).getMonth() === (maxDate as Date).getMonth() &&
        (minDate as Date).getFullYear() === (maxDate as Date).getFullYear();

      // Check if data spans more than 2 months
      const monthDiff =
        ((maxDate as Date).getFullYear() - (minDate as Date).getFullYear()) *
          12 +
        (maxDate as Date).getMonth() -
        (minDate as Date).getMonth();

      if (isSameDay) {
        groupingType = "hour";
      } else if (monthDiff >= 2) {
        groupingType = "month";
      }
    }

    const groupedData: Record<string, GoldPriceAlertPersisted[]> = {};

    validData.forEach((item) => {
      const date = (item.createdDateTime as unknown as Timestamp).toDate();
      let key: string;

      switch (groupingType) {
        case "hour":
          // Format: HH:00
          key = `${date.getHours()}:00`;
          break;
        case "month":
          // Format: MM/YYYY
          key = `${date.getMonth() + 1}/${date.getFullYear()}`;
          break;
        default:
          // Format: DD/MM/YYYY
          key = formatDateAsDDMMYYYY(date);
      }

      if (!groupedData[key]) {
        groupedData[key] = [];
      }

      groupedData[key]!.push(item);
    });

    return {
      isSameDay: groupingType === "hour",
      groupedData,
    };
  }

  private extractPriceData(data: GoldPriceAlertPersisted[]) {
    // Filter valid data with price information
    const validData = data.filter(
      (item) =>
        item.createdDateTime && item.currentPrice && item.currentPrice.Sell
    );

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
    const prices = validData.map((item) => item.currentPrice.Sell);

    // Find min and max prices
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);

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
    const earliestPrice =
      sortedData[0]?.currentPrice?.Sell /* c8 ignore next */ || 0;

    console.log(
      `Latest price: `,
      sortedData[sortedData.length - 1]?.currentPrice
    );

    const latestPrice =
      sortedData[sortedData.length - 1]?.currentPrice
        ?.Sell /* c8 ignore next */ || 0;

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
