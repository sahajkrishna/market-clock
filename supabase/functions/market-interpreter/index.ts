import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { activeSessions, overlaps, upcomingEvents, timeOfDay, utcHour } = await req.json();

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const systemPrompt = `You are a concise forex market interpreter for retail traders. You analyze current market conditions and provide 3-5 short, actionable insights.

Rules:
- Each insight must be 1 sentence max
- Use plain language a beginner can understand
- Focus on: volatility expectations, best pairs to watch, session overlaps, upcoming news impact
- Start each insight with an emoji that matches the sentiment (🟢 positive, 🟡 caution, 🔴 warning, ⏰ timing, 📊 data)
- Do NOT give financial advice or specific trade recommendations
- Format as a JSON array of strings`;

    const userPrompt = `Current market conditions:
- UTC Hour: ${utcHour}
- Time of Day: ${timeOfDay}
- Active Sessions: ${activeSessions.length > 0 ? activeSessions.join(", ") : "None (off-hours)"}
- Session Overlaps: ${overlaps.length > 0 ? overlaps.join(", ") : "None"}
- Upcoming Economic Events: ${upcomingEvents.length > 0 ? upcomingEvents.map((e: any) => `${e.currency} ${e.event} (${e.impact} impact)`).join("; ") : "None in the next few hours"}

Generate 3-5 market insights as a JSON array of strings.`;

    const response = await fetch(
      "https://ai.gateway.lovable.dev/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-3-flash-preview",
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt },
          ],
          temperature: 0.7,
        }),
      }
    );

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limited, please try again later." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI credits exhausted. Add funds in Settings > Workspace > Usage." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const text = await response.text();
      console.error("AI gateway error:", response.status, text);
      throw new Error("AI gateway error");
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || "[]";

    // Parse the JSON array from the response
    let insights: string[];
    try {
      // Try to extract JSON array from the content (model might wrap it in markdown)
      const jsonMatch = content.match(/\[[\s\S]*\]/);
      insights = jsonMatch ? JSON.parse(jsonMatch[0]) : [content];
    } catch {
      insights = [content];
    }

    return new Response(JSON.stringify({ insights }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("market-interpreter error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
