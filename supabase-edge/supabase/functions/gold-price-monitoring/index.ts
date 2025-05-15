import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import GoldPriceMonitoring from "../gold-price/controllers/gold-price-monitoring.ts";

const goldPriceMonitoring = new GoldPriceMonitoring();

Deno.serve(async (req) => {
  // Check if the request method is POST
  if (req.method !== "POST") {
    return new Response("Method Not Allowed", {
      status: 405,
    });
  }

  try {
    const requestBody = await req.json();
    // Perform actions for price-monitoring
    const priceThreshold = Number(requestBody.priceThreshold) || 100;
    const result = await goldPriceMonitoring.monitorPrice(priceThreshold);
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
