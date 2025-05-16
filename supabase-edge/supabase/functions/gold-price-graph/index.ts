import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import GoldPricePeriodGraph from "../gold-price/controllers/gold-price-period-graph.ts";

const SUMMARY_PERIODS = ["day", "week", "month", "year"];
const GRAPH_TYPES = ["hour", "day", "hour_with_day", "month", "year"];

Deno.serve(async (req) => {
  // Check if the request method is POST
  if (req.method !== "POST") {
    return new Response("Method Not Allowed", {
      status: 405,
    });
  }

  try {
    const requestBody = await req.json();
    const { summaryPeriod, graphType } = requestBody;

    console.log("⚙️ Request body: ", requestBody);

    if (!GRAPH_TYPES.includes(graphType)) {
      throw new Error(
        `Invalid graph type. Name: ${graphType}, Valid names: ${GRAPH_TYPES.join(
          ", "
        )}`
      );
    }

    const endDate = new Date();
    endDate.setMinutes(endDate.getMinutes() + 1); // Add 1 minute to avoid the current time

    const startDate = new Date();
    startDate.setHours(0, 0, 0, 0);
    startDate.setHours(startDate.getHours() - 7); // -7 hours for Thailand timezone

    switch (summaryPeriod) {
      case "day":
        break;
      case "week":
        startDate.setDate(startDate.getDate() - 6); // -6 days to get the start date of the week
        break;
      case "month":
        startDate.setDate(1);
        endDate.setDate(endDate.getDate() - 1); // -1 day to get the end date of the month
        break;
      case "year":
        startDate.setMonth(0, 1);
        endDate.setDate(endDate.getDate() - 1); // -1 day to get the end date of the year
        break;
      default:
        throw new Error(
          `Invalid summary period. Name: ${summaryPeriod}, Valid names: ${SUMMARY_PERIODS.join(
            ", "
          )}`
        );
    }

    console.log(`⚙️ Start date: ${startDate} and end date: ${endDate}`);

    const goldPricePeriodGraph = new GoldPricePeriodGraph(req);
    const result = await goldPricePeriodGraph.getGoldPricePeriodGraph(
      startDate,
      endDate,
      graphType
    );

    return new Response(JSON.stringify(result), {
      headers: {
        "Content-Type": "application/json",
      },
      status: 200,
    });
  } catch (error) {
    return new Response(
      JSON.stringify({
        error: error.message,
      }),
      {
        headers: {
          "Content-Type": "application/json",
        },
        status: 400,
      }
    );
  }
});
