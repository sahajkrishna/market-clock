import { useEffect, useRef } from "react";

interface TradingViewWidgetProps {
  symbol?: string;
}

export const TradingViewWidget = ({ symbol = "OANDA:XAUUSD" }: TradingViewWidgetProps) => {
  const containerRef = useRef<HTMLDivElement>(null);

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
      interval: "15",
      timezone: "Etc/UTC",
      theme: "dark",
      style: "2",
      withdateranges: true,
      hide_side_toolbar: true,
      allow_symbol_change: false,
      save_image: false,
      hide_volume: true,
      support_host: "https://www.tradingview.com",
      backgroundColor: "rgba(0, 0, 0, 0)",
      gridColor: "rgba(255, 255, 255, 0.03)",
    });

    container.appendChild(script);

    return () => {
      if (container) container.innerHTML = "";
    };
  }, [symbol]);

  return (
    <div className="glass-card rounded-2xl overflow-hidden glow-gold h-full flex flex-col">
      <div className="px-5 pt-4 pb-2">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-neon-gold/10 text-neon-gold text-sm font-bold select-none">
            Au
          </div>
          <div>
            <p className="text-sm font-semibold tracking-tight">XAUUSD · Gold</p>
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Live Chart</p>
          </div>
        </div>
      </div>
      <div
        ref={containerRef}
        className="tradingview-widget-container flex-1 min-h-[420px]"
      />
    </div>
  );
};
