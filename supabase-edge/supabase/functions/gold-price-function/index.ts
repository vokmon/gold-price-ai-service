import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { GoldPriceDataRecorder } from "../gold-price/controllers/gold-price-data-recorder.ts";

const goldPriceDataRecorder = new GoldPriceDataRecorder();

Deno.serve(async (req) => {
  // Check if the request method is POST
  if (req.method !== "POST") {
    return new Response("Method Not Allowed", {
      status: 405,
    });
  }
  try {
    const price = await goldPriceDataRecorder.recordGoldPriceData(req);
    return new Response(JSON.stringify(price), {
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
