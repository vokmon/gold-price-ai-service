import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import GeneratePriceGraph from "../../../src/services/graph/generate-price-graph";
import { Response } from "node-fetch";

// Mock fetch
vi.mock("node-fetch", async () => {
  const actual = await vi.importActual("node-fetch");
  return {
    ...actual,
    default: vi.fn(),
  };
});

// Create a way to access the mocked fetch
const fetchMock = vi.hoisted(() => vi.fn());
global.fetch = fetchMock;

describe("GeneratePriceGraph", () => {
  let generatePriceGraph: GeneratePriceGraph;
  let consoleSpy: any;

  beforeEach(() => {
    generatePriceGraph = new GeneratePriceGraph();
    consoleSpy = {
      log: vi.spyOn(console, "log").mockImplementation(() => {}),
      error: vi.spyOn(console, "error").mockImplementation(() => {}),
    };
  });

  afterEach(() => {
    vi.clearAllMocks();
    consoleSpy.log.mockRestore();
    consoleSpy.error.mockRestore();
  });

  describe("generatePriceGraph", () => {
    it("should successfully generate a price graph", async () => {
      // Mock data
      const labels = ["2023-10-01", "2023-10-02", "2023-10-03"];
      const dataArrayForBarChart = [[2000, 2050, 2100]];
      const dataArrayForLineChart = [2000, 2050, 2100];
      const chartTitle = "Gold Price Chart";

      // Mock successful fetch response
      const mockImageData = new ArrayBuffer(100);
      const mockResponse = {
        ok: true,
        arrayBuffer: vi.fn().mockResolvedValue(mockImageData),
        statusText: "OK",
      };
      fetchMock.mockResolvedValue(mockResponse);

      // Call the method
      const result = await generatePriceGraph.generatePriceGraph({
        labels,
        dataArrayForBarChart,
        dataArrayForLineChart,
        chartTitle,
      });

      // Assertions
      expect(fetchMock).toHaveBeenCalledTimes(1);
      expect(fetchMock).toHaveBeenCalledWith("https://quickchart.io/chart", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: expect.any(String),
      });

      // Verify the chart config
      const requestBody = JSON.parse(fetchMock.mock.calls[0][1].body);
      expect(requestBody.width).toBe(1000);
      expect(requestBody.height).toBe(600);
      expect(requestBody.chart.data.labels).toHaveLength(10); // MIN_LABELS = 10
      expect(requestBody.chart.data.datasets).toHaveLength(2);
      expect(requestBody.chart.data.datasets[0].data).toEqual(
        dataArrayForBarChart
      );
      expect(requestBody.chart.data.datasets[1].data).toEqual(
        dataArrayForLineChart
      );
      expect(requestBody.chart.options.title.text).toBe(chartTitle);

      // Verify the returned result
      expect(result).not.toBeNull();
      expect(result).toBeInstanceOf(Uint8Array);
      expect(result!.length).toBe(100);
    });

    it("should extend labels if less than MIN_LABELS", async () => {
      // Mock data with fewer labels than MIN_LABELS
      const labels = ["2023-10-01", "2023-10-02"];
      const dataArrayForBarChart = [[2000, 2050]];
      const dataArrayForLineChart = [2000, 2050];
      const chartTitle = "Gold Price Chart";

      // Mock successful fetch response
      const mockImageData = new ArrayBuffer(100);
      const mockResponse = {
        ok: true,
        arrayBuffer: vi.fn().mockResolvedValue(mockImageData),
        statusText: "OK",
      };
      fetchMock.mockResolvedValue(mockResponse);

      // Call the method
      await generatePriceGraph.generatePriceGraph({
        labels,
        dataArrayForBarChart,
        dataArrayForLineChart,
        chartTitle,
      });

      // Verify the chart config
      const requestBody = JSON.parse(fetchMock.mock.calls[0][1].body);
      expect(requestBody.chart.data.labels).toHaveLength(10); // MIN_LABELS = 10
      expect(requestBody.chart.data.labels[0]).toBe("2023-10-01");
      expect(requestBody.chart.data.labels[1]).toBe("2023-10-02");
      expect(requestBody.chart.data.labels[2]).toBe(""); // Empty label
    });

    it("should return null if fetch request fails", async () => {
      // Mock data
      const labels = ["2023-10-01", "2023-10-02", "2023-10-03"];
      const dataArrayForBarChart = [[2000, 2050, 2100]];
      const dataArrayForLineChart = [2000, 2050, 2100];
      const chartTitle = "Gold Price Chart";

      // Mock failed fetch response
      const mockResponse = {
        ok: false,
        statusText: "Internal Server Error",
      };
      fetchMock.mockResolvedValue(mockResponse);

      // Call the method
      const result = await generatePriceGraph.generatePriceGraph({
        labels,
        dataArrayForBarChart,
        dataArrayForLineChart,
        chartTitle,
      });

      // Assertions
      expect(fetchMock).toHaveBeenCalledTimes(1);
      expect(consoleSpy.error).toHaveBeenCalledWith(
        "❌ Failed to generate chart: Internal Server Error"
      );
      expect(result).toBeNull();
    });
  });

  describe("ensureMinimumLabels", () => {
    it("should not modify labels if already at or above minimum length", () => {
      // Create an array with MIN_LABELS elements
      const labels = Array(10).fill("label");

      // @ts-ignore - accessing private method for testing
      const result = generatePriceGraph.ensureMinimumLabels(labels);

      expect(result).toEqual(labels);
      expect(result.length).toBe(10);
    });

    it("should add empty strings to labels if below minimum length", () => {
      const labels = ["label1", "label2", "label3"];

      // @ts-ignore - accessing private method for testing
      const result = generatePriceGraph.ensureMinimumLabels(labels);

      expect(result.length).toBe(10);
      expect(result[0]).toBe("label1");
      expect(result[1]).toBe("label2");
      expect(result[2]).toBe("label3");
      expect(result[3]).toBe("");
      expect(result[9]).toBe("");
    });
  });
});
