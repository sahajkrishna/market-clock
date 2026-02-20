import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

let cachedPrice: number | null = null;
let cacheTimestamp = 0;
const CACHE_TTL = 60_000; // 60 seconds

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const apiKey = Deno.env.get("TWELVE_DATA_API_KEY");
  if (!apiKey) {
    return new Response(
      JSON.stringify({ error: "TWELVE_DATA_API_KEY is not configured" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  // Return cached price if still fresh
  if (cachedPrice !== null && Date.now() - cacheTimestamp < CACHE_TTL) {
    return new Response(JSON.stringify({ price: cachedPrice }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    const res = await fetch(
      `https://api.twelvedata.com/price?symbol=XAU/USD&apikey=${apiKey}`
    );
    const data = await res.json();

    if (data.code || data.status === "error") {
      // If rate-limited but we have a cached value, return it
      if (cachedPrice !== null) {
        return new Response(JSON.stringify({ price: cachedPrice }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      return new Response(
        JSON.stringify({ error: data.message || "API error" }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    cachedPrice = parseFloat(data.price);
    cacheTimestamp = Date.now();

    return new Response(JSON.stringify({ price: cachedPrice }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    if (cachedPrice !== null) {
      return new Response(JSON.stringify({ price: cachedPrice }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    return new Response(JSON.stringify({ error: msg }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
