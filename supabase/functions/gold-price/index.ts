import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface CachedQuote {
  price: number;
  high: number;
  low: number;
  open: number;
  change: number;
  percent_change: number;
  timestamp: string;
}

let cached: CachedQuote | null = null;
let cacheTimestamp = 0;
const CACHE_TTL = 60_000; // 60 seconds – stays within free-tier 8 req/min

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  // Require the Supabase anon key to prevent unauthorized external access
  const clientApiKey = req.headers.get("apikey");
  if (!clientApiKey) {
    return new Response(
      JSON.stringify({ error: "Unauthorized" }),
      { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  const apiKey = Deno.env.get("TWELVE_DATA_API_KEY");
  if (!apiKey) {
    return new Response(
      JSON.stringify({ error: "TWELVE_DATA_API_KEY is not configured" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  // Return cached data if still fresh
  if (cached !== null && Date.now() - cacheTimestamp < CACHE_TTL) {
    return new Response(JSON.stringify(cached), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    const res = await fetch(
      `https://api.twelvedata.com/quote?symbol=XAU/USD&apikey=${apiKey}`
    );
    const data = await res.json();

    if (data.code || data.status === "error") {
      if (cached !== null) {
        // Extend cache to avoid re-hitting a rate-limited API
        cacheTimestamp = Date.now();
        return new Response(JSON.stringify(cached), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      return new Response(
        JSON.stringify({ error: "Gold price temporarily unavailable. Please try again shortly." }),
        { status: 503, headers: { ...corsHeaders, "Content-Type": "application/json", "Retry-After": "60" } }
      );
    }

    cached = {
      price: parseFloat(data.close),
      high: parseFloat(data.high),
      low: parseFloat(data.low),
      open: parseFloat(data.open),
      change: parseFloat(data.change),
      percent_change: parseFloat(data.percent_change),
      timestamp: data.datetime || new Date().toISOString(),
    };
    cacheTimestamp = Date.now();

    return new Response(JSON.stringify(cached), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    if (cached !== null) {
      return new Response(JSON.stringify(cached), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    return new Response(JSON.stringify({ error: msg }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
