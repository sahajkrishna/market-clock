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

// Generate realistic upcoming economic events
function generateEvents(): EconomicEvent[] {
  const now = new Date();
  const events: Omit<EconomicEvent, "id" | "time">[] = [
    { currency: "USD", event: "Non-Farm Payrolls", impact: "high", previous: "256K", forecast: "170K", actual: null },
    { currency: "USD", event: "CPI m/m", impact: "high", previous: "0.4%", forecast: "0.3%", actual: null },
    { currency: "USD", event: "FOMC Statement", impact: "high", previous: null, forecast: null, actual: null },
    { currency: "USD", event: "Unemployment Claims", impact: "medium", previous: "219K", forecast: "225K", actual: null },
    { currency: "USD", event: "Core PPI m/m", impact: "medium", previous: "0.1%", forecast: "0.3%", actual: null },
    { currency: "USD", event: "Retail Sales m/m", impact: "high", previous: "0.2%", forecast: "0.6%", actual: null },
    { currency: "EUR", event: "ECB Rate Decision", impact: "high", previous: "2.65%", forecast: "2.40%", actual: null },
    { currency: "EUR", event: "CPI y/y", impact: "high", previous: "2.2%", forecast: "2.3%", actual: null },
    { currency: "EUR", event: "German ZEW Sentiment", impact: "medium", previous: "51.6", forecast: "50.3", actual: null },
    { currency: "EUR", event: "PMI Manufacturing", impact: "medium", previous: "48.6", forecast: "48.4", actual: null },
    { currency: "GBP", event: "BOE Rate Decision", impact: "high", previous: "4.50%", forecast: "4.50%", actual: null },
    { currency: "GBP", event: "GDP q/q", impact: "high", previous: "0.1%", forecast: "0.1%", actual: null },
    { currency: "GBP", event: "CPI y/y", impact: "high", previous: "2.8%", forecast: "2.7%", actual: null },
    { currency: "JPY", event: "BOJ Rate Decision", impact: "high", previous: "0.50%", forecast: "0.50%", actual: null },
    { currency: "JPY", event: "Core CPI y/y", impact: "medium", previous: "3.2%", forecast: "3.0%", actual: null },
    { currency: "AUD", event: "RBA Rate Decision", impact: "high", previous: "4.10%", forecast: "3.85%", actual: null },
    { currency: "AUD", event: "Employment Change", impact: "high", previous: "44.0K", forecast: "25.0K", actual: null },
    { currency: "CAD", event: "BOC Rate Decision", impact: "high", previous: "2.75%", forecast: "2.75%", actual: null },
    { currency: "CHF", event: "SNB Rate Decision", impact: "high", previous: "0.25%", forecast: "0.25%", actual: null },
    { currency: "NZD", event: "RBNZ Rate Decision", impact: "high", previous: "3.50%", forecast: "3.25%", actual: null },
    { currency: "USD", event: "ISM Manufacturing PMI", impact: "high", previous: "50.3", forecast: "49.8", actual: null },
    { currency: "USD", event: "ADP Employment Change", impact: "medium", previous: "155K", forecast: "148K", actual: null },
    { currency: "USD", event: "Consumer Confidence", impact: "medium", previous: "92.9", forecast: "94.0", actual: null },
    { currency: "EUR", event: "German Ifo Business Climate", impact: "medium", previous: "86.7", forecast: "87.5", actual: null },
    { currency: "USD", event: "Durable Goods Orders m/m", impact: "medium", previous: "0.9%", forecast: "-1.0%", actual: null },
    { currency: "USD", event: "PCE Price Index m/m", impact: "high", previous: "0.3%", forecast: "0.4%", actual: null },
    { currency: "GBP", event: "Retail Sales m/m", impact: "medium", previous: "1.0%", forecast: "0.2%", actual: null },
    { currency: "EUR", event: "Trade Balance", impact: "low", previous: "15.5B", forecast: "14.0B", actual: null },
    { currency: "USD", event: "Building Permits", impact: "low", previous: "1.46M", forecast: "1.45M", actual: null },
    { currency: "JPY", event: "Trade Balance", impact: "low", previous: "-0.58T", forecast: "-0.30T", actual: null },
  ];

  const result: EconomicEvent[] = [];
  const hours = [8, 9, 10, 12, 13, 14, 15, 16];

  for (let dayOffset = 0; dayOffset < 7; dayOffset++) {
    const date = new Date(now);
    date.setDate(date.getDate() + dayOffset);

    // Skip weekends
    if (date.getDay() === 0 || date.getDay() === 6) continue;

    // Pick 3-5 events per day
    const count = 3 + Math.floor(Math.random() * 3);
    const shuffled = [...events].sort(() => Math.random() - 0.5).slice(0, count);

    shuffled.forEach((ev, i) => {
      const hour = hours[i % hours.length];
      const eventDate = new Date(date);
      eventDate.setHours(hour, i % 2 === 0 ? 0 : 30, 0, 0);

      // Past events get "actual" values
      const isPast = eventDate < now;
      let actual = ev.actual;
      if (isPast && ev.forecast) {
        const num = parseFloat(ev.forecast);
        if (!isNaN(num)) {
          const variance = num * (0.9 + Math.random() * 0.2);
          const suffix = ev.forecast.replace(/[\d.\-]/g, "");
          actual = variance.toFixed(ev.forecast.includes(".") ? 1 : 0) + suffix;
        }
      }

      result.push({
        id: `${dayOffset}-${i}`,
        time: eventDate.toISOString(),
        currency: ev.currency,
        event: ev.event,
        impact: ev.impact,
        previous: ev.previous,
        forecast: ev.forecast,
        actual: isPast ? actual : null,
      });
    });
  }

  return result.sort((a, b) => new Date(a.time).getTime() - new Date(b.time).getTime());
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const events = generateEvents();
    return new Response(JSON.stringify({ success: true, data: events }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error generating events:", error);
    return new Response(
      JSON.stringify({ success: false, error: "Failed to fetch events" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
