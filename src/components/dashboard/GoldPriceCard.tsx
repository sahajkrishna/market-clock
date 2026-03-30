import { useState, useEffect, useRef, useCallback } from "react";
import { TrendingUp, TrendingDown, Loader2, WifiOff, ArrowUp, ArrowDown } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const REFRESH_INTERVAL = 60000;

interface GoldQuote {
  price: number;
  high: number;
  low: number;
  open: number;
  change: number;
  percent_change: number;
  timestamp: string;
}

export const GoldPriceCard = () => {
  const [quote, setQuote] = useState<GoldQuote | null>(null);
  const [prevPrice, setPrevPrice] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const lastKnown = useRef<GoldQuote | null>(null);

  const fetchPrice = useCallback(async () => {
    try {
      const { data, error: fnError } = await supabase.functions.invoke("gold-price");
      if (fnError) throw fnError;
      if (data?.error) throw new Error(data.error);

      const newQuote = data as GoldQuote;
      setPrevPrice(lastKnown.current?.price ?? null);
      setQuote(newQuote);
      lastKnown.current = newQuote;
      setLastUpdated(new Date());
      setError(null);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Failed to fetch price";
      setError(msg);
      if (lastKnown.current !== null) {
        setQuote(lastKnown.current);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPrice();
    const interval = setInterval(fetchPrice, REFRESH_INTERVAL);
    return () => clearInterval(interval);
  }, [fetchPrice]);

  const displayQuote = quote ?? lastKnown.current;
  const isUp = displayQuote ? displayQuote.change >= 0 : true;
  const tickUp = prevPrice !== null && displayQuote !== null ? displayQuote.price >= prevPrice : true;

  return (
    <div className="glass-card rounded-2xl overflow-hidden glow-gold p-5 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-neon-gold/10 text-neon-gold text-lg font-bold select-none">
            Au
          </div>
          <div>
            <p className="text-xs font-medium tracking-wider uppercase text-muted-foreground">
              Gold (XAUUSD)
            </p>
            {loading && !displayQuote ? (
              <div className="flex items-center gap-2 mt-1">
                <Loader2 className="h-5 w-5 animate-spin text-neon-gold" />
                <span className="text-sm text-muted-foreground">Fetching live price…</span>
              </div>
            ) : displayQuote ? (
              <p className="text-2xl sm:text-3xl font-bold font-mono tracking-tight text-neon-gold transition-all duration-300">
                ${displayQuote.price.toFixed(2)}
              </p>
            ) : (
              <p className="text-sm text-destructive">Price unavailable</p>
            )}
          </div>
        </div>

        <div className="flex flex-col items-end gap-1">
          {error && (
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <WifiOff className="h-3 w-3" />
              <span>Last known</span>
            </div>
          )}
          {displayQuote && (
            <div
              className={`flex items-center gap-1 rounded-full px-3 py-1.5 text-sm font-semibold transition-colors duration-300 ${
                isUp
                  ? "bg-success/15 text-success"
                  : "bg-destructive/15 text-destructive"
              }`}
            >
              {isUp ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
              <span>
                {isUp ? "+" : ""}
                {displayQuote.percent_change.toFixed(2)}%
              </span>
            </div>
          )}
          {displayQuote && (
            <span
              className={`h-2.5 w-2.5 rounded-full animate-pulse-glow transition-colors duration-300 ${
                tickUp ? "bg-success" : "bg-destructive"
              }`}
            />
          )}
        </div>
      </div>

      {displayQuote && (
        <div className="grid grid-cols-3 gap-3 pt-3 border-t border-border/30">
          <StatItem label="24H High" value={`$${displayQuote.high.toFixed(2)}`} icon={<ArrowUp className="h-3 w-3 text-success" />} />
          <StatItem label="24H Low" value={`$${displayQuote.low.toFixed(2)}`} icon={<ArrowDown className="h-3 w-3 text-destructive" />} />
          <StatItem
            label="Change"
            value={`${displayQuote.change >= 0 ? "+" : ""}$${displayQuote.change.toFixed(2)}`}
            valueClass={displayQuote.change >= 0 ? "text-success" : "text-destructive"}
          />
        </div>
      )}

      {lastUpdated && (
        <p className="text-[10px] text-muted-foreground text-right">
          Updated {lastUpdated.toLocaleTimeString()}
        </p>
      )}
    </div>
  );
};

const StatItem = ({
  label,
  value,
  icon,
  valueClass = "text-neon-gold",
}: {
  label: string;
  value: string;
  icon?: React.ReactNode;
  valueClass?: string;
}) => (
  <div className="flex flex-col items-center gap-0.5">
    <span className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</span>
    <div className="flex items-center gap-1">
      {icon}
      <span className={`text-sm font-semibold font-mono ${valueClass}`}>{value}</span>
    </div>
  </div>
);
