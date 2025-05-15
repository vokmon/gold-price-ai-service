import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import GoldPricePeriodSummary from "../gold-price/controllers/gold-price-period-summary.ts";
import { getTodayThaiDate } from "../gold-price/utils/date-utils.ts";

const goldPriceDataPeriodSummary = new GoldPricePeriodSummary();

Deno.serve(async (req) => {
  // Check if the request method is POST
  if (req.method !== "POST") {
    return new Response("Method Not Allowed", {
      status: 405,
    });
  }

  try {
    const startDate = new Date();
    startDate.setHours(0, 0, 0, 0);
    startDate.setDate(startDate.getDate() - 7);
    const endDate = new Date();

    const result = await goldPriceDataPeriodSummary.summarizeGoldPricePeriod(
      startDate,
      endDate
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
