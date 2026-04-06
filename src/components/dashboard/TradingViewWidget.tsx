import { useEffect, useRef } from "react";

import type { MarketMode } from "@/lib/preferences";

interface TradingViewWidgetProps {
  symbol?: string;
  marketMode?: MarketMode;
}

export const TradingViewWidget = ({ symbol = "OANDA:XAUUSD", marketMode = "swing" }: TradingViewWidgetProps) => {
  const containerRef = useRef<HTMLDivElement>(null);

  // Scalper = M5/M15, Swing = H1/H4
  const interval = marketMode === "scalper" ? "5" : "60";

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    container.innerHTML = "";

    const script = document.createElement("script");
    script.src = "https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js";
    script.type = "text/javascript";
    script.async = true;
    script.innerHTML = JSON.stringify({
      symbol,
      width: "100%",
      height: "100%",
      locale: "en",
      interval,
      timezone: "Etc/UTC",
      theme: "dark",
      style: "1",
      withdateranges: true,
      hide_side_toolbar: false,
      allow_symbol_change: false,
      save_image: false,
      hide_volume: false,
      support_host: "https://www.tradingview.com",
      backgroundColor: "rgba(0, 0, 0, 0)",
      gridColor: "rgba(255, 255, 255, 0.03)",
    });

    container.appendChild(script);

    return () => {
      if (container) container.innerHTML = "";
    };
  }, [symbol, interval]);

  return (
    <div className="glass-card rounded-2xl overflow-hidden glow-gold h-full flex flex-col">
      <div className="px-5 pt-4 pb-2">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-neon-gold/10 text-neon-gold text-sm font-bold select-none">
            Au
          </div>
          <div>
            <p className="text-sm font-semibold tracking-tight">XAUUSD · Gold</p>
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider">
              {marketMode === "scalper" ? "M5 · Short-term focus" : "H1 · Long-term focus"}
            </p>
          </div>
        </div>
      </div>
      <div
        ref={containerRef}
        className="tradingview-widget-container flex-1 min-h-[520px]"
        style={{ height: "100%" }}
      />
    </div>
  );
};
