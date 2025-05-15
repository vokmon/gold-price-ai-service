import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import GoldPriceDataSummarization from "../gold-price/controllers/gold-price-data-summary.ts";

const goldPriceDataSummarization = new GoldPriceDataSummarization();

Deno.serve(async (req) => {
  // Check if the request method is POST
  if (req.method !== "POST") {
    return new Response("Method Not Allowed", {
      status: 405,
    });
  }

  try {
    const result = await goldPriceDataSummarization.getGoldPriceSummary();
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
