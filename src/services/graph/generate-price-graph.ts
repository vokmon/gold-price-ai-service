export default class GeneratePriceGraph {
  private CHART_WIDTH = 1000;
  private CHART_HEIGHT = 600;
  private FONT_SIZE = 26;
  private FONT_SIZE_TITLE = 22;
  private MIN_LABELS = 10;

  async generatePriceGraph({
    labels,
    dataArrayForBarChart,
    dataArrayForLineChart,
    chartTitle,
  }: {
    labels: string[];
    dataArrayForBarChart: number[][];
    dataArrayForLineChart: number[];
    chartTitle: string;
  }) {
    const finalLabels = this.ensureMinimumLabels(labels);
    console.log(`🔖 Chart title: `, chartTitle);
    console.log(`🔖 Final labels: `, finalLabels);
    console.log(`📊 Data array for Bar chart: `, dataArrayForBarChart);
    console.log(`📉 Data array for Line chart: `, dataArrayForLineChart);

    const chartConfig = {
      width: this.CHART_WIDTH,
      height: this.CHART_HEIGHT,
      backgroundColor: "white",
      format: "png",
      chart: {
        type: "bar",
        data: {
          labels: finalLabels,
          datasets: [
            {
              label: "ราคาทองคำ",
              backgroundColor: "rgba(55, 162, 240, 0.6)",
              borderColor: "rgba(55, 162, 240, 1)",
              borderWidth: 1,
              borderRadius: 5,
              borderSkipped: false,
              data: dataArrayForBarChart,
            },
            {
              type: "line",
              fill: false,
              backgroundColor: "rgba(255, 70, 120, 1)",
              borderColor: "rgba(200, 75, 105, 1)",
              borderWidth: 2,
              pointRadius: 0,
              tension: 0,
              data: dataArrayForLineChart,
            },
          ],
        },
        options: {
          title: {
            display: true,
            text: chartTitle,
          },
          legend: {
            display: false,
            position: "top",
          },
          scales: {
            yAxes: [
              {
                scaleLabel: {
                  display: true,
                  fontSize: this.FONT_SIZE,
                  labelString: "ราคา (บาท)",
                },
                ticks: {
                  fontSize: this.FONT_SIZE_TITLE,
                },
              },
            ],
            xAxes: [
              {
                scaleLabel: {
                  display: true,
                  fontSize: this.FONT_SIZE,
                  labelString: "เวลา/วันที่",
                },
                ticks: {
                  autoSkip: false,
                  fontSize: this.FONT_SIZE_TITLE,
                },
              },
            ],
          },
        },
      },
    };

    const response = await fetch("https://quickchart.io/chart", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(chartConfig),
    });

    const imageData = await response.arrayBuffer();
    const imageBuffer = new Uint8Array(imageData);

    // THIS IS FOR SAVING THE CHART TO A FILE
    // const fs = await import("fs/promises");
    // const path = await import("path");

    // const outputDir = "./output";
    // await fs.mkdir(outputDir, { recursive: true });

    // const fileName = `gold-price-chart-${new Date().getTime()}.png`;
    // const filePath = path.join(outputDir, fileName);

    // await fs.writeFile(filePath, imageBuffer);
    // console.log(`Chart has been generated and saved to ${filePath}`);

    return imageBuffer;
  }

  private ensureMinimumLabels(labels: string[]): string[] {
    // Ensure labels has at least MIN_LABELS elements
    if (labels.length < this.MIN_LABELS) {
      const emptyLabelsToAdd = this.MIN_LABELS - labels.length;
      const extendedLabels = [...labels];
      for (let i = 0; i < emptyLabelsToAdd; i++) {
        extendedLabels.push("");
      }
      return extendedLabels;
    }
    return labels;
  }
}
