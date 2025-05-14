import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { GoldPriceDataRecorder } from "./controllers/gold-price-data-recorder.ts";
import GoldPriceMonitoring from "./controllers/gold-price-monitoring.ts";

const goldPriceDataRecorder = new GoldPriceDataRecorder();
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
    const action = requestBody.action;

    if (action === "price-record") {
      // Perform actions for price-record

      const price = await goldPriceDataRecorder.recordGoldPriceData(req);
      return new Response(JSON.stringify(price), {
        headers: {
          "Content-Type": "application/json",
        },
        status: 200,
      });
    } else if (action === "price-monitoring") {
      // Perform actions for price-monitoring
      const priceThreshold = Number(requestBody.priceThreshold) || 100;

      const result = await goldPriceMonitoring.monitorPrice(priceThreshold);

      return new Response(JSON.stringify(result), {
        headers: {
          "Content-Type": "application/json",
        },
        status: 200,
      });
    } else {
      return new Response("Invalid action", {
        status: 400,
      });
    }
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
