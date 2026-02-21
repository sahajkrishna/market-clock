import { useEffect, useRef } from "react";

interface TradingViewWidgetProps {
  symbol?: string;
}

export const TradingViewWidget = ({ symbol = "OANDA:XAUUSD" }: TradingViewWidgetProps) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Clear previous widget
    container.innerHTML = "";

    const script = document.createElement("script");
    script.src = "https://s3.tradingview.com/external-embedding/embed-widget-mini-symbol-overview.js";
    script.type = "text/javascript";
    script.async = true;
    script.innerHTML = JSON.stringify({
      symbol,
      width: "100%",
      height: "100%",
      locale: "en",
      dateRange: "1D",
      colorTheme: "dark",
      isTransparent: true,
      autosize: true,
      largeChartUrl: "",
      noTimeScale: false,
      chartOnly: false,
    });

    container.appendChild(script);

    return () => {
      if (container) container.innerHTML = "";
    };
  }, [symbol]);

  return (
    <div className="rounded-lg border border-[hsl(43,70%,40%)/0.3] bg-gradient-to-br from-[hsl(43,30%,12%)] to-[hsl(43,20%,8%)] overflow-hidden shadow-lg shadow-[hsl(43,70%,40%)/0.08]">
      <div className="px-5 pt-4 pb-2">
        <div className="flex items-center gap-3 mb-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[hsl(43,70%,40%)/0.15] text-[hsl(43,80%,55%)] text-sm font-bold select-none">
            Au
          </div>
          <p className="text-xs font-medium tracking-wider uppercase text-[hsl(43,50%,65%)]">
            Live Chart (XAUUSD)
          </p>
        </div>
      </div>
      <div
        ref={containerRef}
        className="tradingview-widget-container h-[220px] sm:h-[260px]"
      />
    </div>
  );
};
