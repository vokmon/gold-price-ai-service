import { FirestoreRepo } from "~/repositories/firestore/firestore.ts";
import { formatDateAsDDMMYYYY, getFormattedDate } from "~/utils/date-utils.ts";
import { ChartJSNodeCanvas } from "chartjs-node-canvas";
import { GoldPricePeriodGraphData } from "~/models/gold-price-period-graph.ts";
import { GoldPriceAlertPersisted } from "~/models/gold-price-summary.ts";
import { Timestamp } from "firebase-admin/firestore";
import { convertGoldPricePeriodGraphToString } from "~/services/outputs/output-utils.ts";
import Huasengheng from "~/services/huasengheng/huasengheng-service.ts";
import { HuasenghengDataType } from "~/models/huasengheng.ts";
export default class GoldPricePeriodGraph {
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

    const result = await Promise.allSettled([
      this._firestoreRepo.getDocumentsByDatetime<GoldPriceAlertPersisted>(
        this.FIRESTORE_COLLECTION_ALERT,
        startDate,
        endDate
      ),
      this._huasengheng.getCurrentHuasenghengPrice(),
    ]);

    const goldPriceAlertData =
      /* c8 ignore next */ result[0].status === "fulfilled"
        ? result[0].value
        : /* c8 ignore next */ [];
    const huasenghengData =
      /* c8 ignore next */ result[1].status === "fulfilled"
        ? result[1].value
        : /* c8 ignore next */ undefined;

    console.log(`Found ${goldPriceAlertData.length} documents`);
    console.log(`Huasengheng data: `, huasenghengData);

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

    return this.generateGoldPriceChart(
      goldPriceAlertData,
      startDate,
      endDate,
      huasenghengData
    );
  }

  private async generateGoldPriceChart(
    goldPriceAlertData: GoldPriceAlertPersisted[],
    startDate: Date,
    endDate: Date,
    huasenghengData?: HuasenghengDataType
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
        groupedData[record]?.map((item) =>
          parseInt(item.currentPrice.Sell.replace(/,/g, ""))
        ) /* c8 ignore next */ || [];

      const minPrice = Math.min(...prices);
      const maxPrice = Math.max(...prices);
      highestValues.push(maxPrice);
      lowestValues.push(minPrice);

      if (minPrice === maxPrice) {
        // If the min and max price are the same, we need to add a small buffer to display the bar
        dataArray.push([minPrice, minPrice + 10]);
      } else {
        dataArray.push([minPrice, maxPrice]);
      }
    }

    // Set up chart configuration
    const width = 800;
    const height = 500;

    const chartJSNodeCanvas = new ChartJSNodeCanvas({
      width,
      height,
      backgroundColour: "white",
    });

    const chartTitle = isSameDay
      ? `ราคาทองคำ (${getFormattedDate(startDate)})`
      : `ราคาทองคำ (${getFormattedDate(startDate)} - ${getFormattedDate(
          endDate
        )})`;

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
            title: {
              display: true,
              text: "ราคา (บาท)",
            },
          },
          x: {
            title: {
              display: false,
              text: "วันที่",
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

    // const fileName = `gold-price-chart-${randomUUID()}.png`;
    // const filePath = path.join(outputDir, fileName);

    // await fs.writeFile(filePath, imageBuffer);
    // console.log(`Chart has been generated and saved to ${filePath}`);

    const priceData = this.extractPriceData(
      goldPriceAlertData,
      huasenghengData
    );

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

  private extractPriceData(
    data: GoldPriceAlertPersisted[],
    huasenghengData?: HuasenghengDataType
  ) {
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
    const prices = validData.map((item) =>
      parseInt(item.currentPrice.Sell.replace(/,/g, ""))
    );

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
    const earliestPrice = parseInt(
      sortedData[0]?.currentPrice?.Sell?.replace(
        /,/g,
        ""
      ) /* c8 ignore next */ ?? "0"
    );
    const latestPrice = parseInt(
      huasenghengData?.Sell.replace(/,/g, "") ??
        sortedData[sortedData.length - 1]?.currentPrice?.Sell?.replace(
          /,/g,
          ""
        ) /* c8 ignore next */ ??
        "0"
    );

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
