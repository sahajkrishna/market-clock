const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface EconomicEvent {
  id: string;
  time: string;
  currency: string;
  event: string;
  impact: "high" | "medium" | "low";
  previous: string | null;
  forecast: string | null;
  actual: string | null;
}

const COUNTRY_TO_CURRENCY: Record<string, string> = {
  US: "USD",
  EU: "EUR",
  EA: "EUR",
  EZ: "EUR",
  GB: "GBP",
  UK: "GBP",
  JP: "JPY",
  AU: "AUD",
  CA: "CAD",
  CH: "CHF",
  NZ: "NZD",
};

function normalizeCurrency(raw: unknown): string {
  const code = String(raw ?? "").trim().toUpperCase();
  return COUNTRY_TO_CURRENCY[code] ?? code;
}

// Map Finnhub impact (numeric or string) to our levels.
// Finnhub returns "impact" as one of: "low", "medium", "high" (sometimes empty).
function normalizeImpact(raw: unknown): "high" | "medium" | "low" {
  const s = String(raw ?? "").toLowerCase();
  if (s === "high") return "high";
  if (s === "medium") return "medium";
  return "low";
}

function fmt(v: unknown): string | null {
  if (v === null || v === undefined || v === "") return null;
  return String(v);
}

function pad(n: number) {
  return n.toString().padStart(2, "0");
}

function ymd(d: Date) {
  return `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())}`;
}

// Simple in-memory cache (per warm instance) to keep results stable across refreshes
let CACHE: { at: number; data: EconomicEvent[] } | null = null;
const CACHE_TTL_MS = 15 * 60 * 1000; // 15 minutes

async function fetchFinnhubCalendar(apiKey: string): Promise<EconomicEvent[]> {
  const now = new Date();
  const from = new Date(now);
  from.setUTCDate(from.getUTCDate() - 1); // include yesterday for "actual" results
  const to = new Date(now);
  to.setUTCDate(to.getUTCDate() + 7);

  const url = `https://finnhub.io/api/v1/calendar/economic?from=${ymd(from)}&to=${ymd(to)}&token=${apiKey}`;
  const res = await fetch(url);
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Finnhub request failed [${res.status}]: ${body}`);
  }
  const json = await res.json();
  const list: any[] = json?.economicCalendar ?? [];

  const events: EconomicEvent[] = list
    .map((e, idx): EconomicEvent | null => {
      // Finnhub "time" is "YYYY-MM-DD HH:mm:ss" in UTC
      if (!e?.time || !e?.event) return null;
      const iso = new Date(e.time.replace(" ", "T") + "Z").toISOString();
      return {
        id: `${e.country ?? "X"}-${e.event}-${e.time}-${idx}`,
        time: iso,
        currency: normalizeCurrency(e.currency ?? e.country),
        event: String(e.event),
        impact: normalizeImpact(e.impact),
        previous: fmt(e.prev),
        forecast: fmt(e.estimate),
        actual: fmt(e.actual),
      };
    })
    .filter((e): e is EconomicEvent => e !== null)
    // Only High and Medium impact
    .filter((e) => e.impact === "high" || e.impact === "medium")
    .sort((a, b) => new Date(a.time).getTime() - new Date(b.time).getTime());

  return events;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const apiKey = Deno.env.get("FINNHUB_API_KEY");
    if (!apiKey) {
      throw new Error("FINNHUB_API_KEY is not configured");
    }

    if (CACHE && Date.now() - CACHE.at < CACHE_TTL_MS) {
      return new Response(JSON.stringify({ success: true, data: CACHE.data, cached: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const events = await fetchFinnhubCalendar(apiKey);
    CACHE = { at: Date.now(), data: events };

    return new Response(JSON.stringify({ success: true, data: events }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error fetching economic calendar:", error);
    const message = error instanceof Error ? error.message : "Failed to fetch events";
    return new Response(
      JSON.stringify({ success: false, error: message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
