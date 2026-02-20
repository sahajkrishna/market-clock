import { useState, useEffect, useRef, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { TrendingUp, TrendingDown, Loader2, WifiOff } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const REFRESH_INTERVAL = 12000; // 12 seconds

export const GoldPriceCard = () => {
  const [price, setPrice] = useState<number | null>(null);
  const [prevPrice, setPrevPrice] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const lastKnown = useRef<number | null>(null);

  const fetchPrice = useCallback(async () => {
    try {
      const { data, error: fnError } = await supabase.functions.invoke("gold-price");
      if (fnError) throw fnError;
      if (data?.error) throw new Error(data.error);

      const newPrice = data.price as number;
      setPrevPrice(lastKnown.current);
      setPrice(newPrice);
      lastKnown.current = newPrice;
      setError(null);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Failed to fetch price";
      setError(msg);
      // Keep last known price visible
      if (lastKnown.current !== null) {
        setPrice(lastKnown.current);
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

  const isUp = prevPrice !== null && price !== null ? price >= prevPrice : true;
  const displayPrice = price ?? lastKnown.current;

  return (
    <Card className="relative overflow-hidden border-[hsl(43,70%,40%)/0.3] bg-gradient-to-br from-[hsl(43,30%,12%)] to-[hsl(43,20%,8%)] text-white shadow-lg shadow-[hsl(43,70%,40%)/0.08]">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,hsl(43,70%,40%,0.08),transparent_60%)]" />
      <CardContent className="relative p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        {/* Left */}
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[hsl(43,70%,40%)/0.15] text-[hsl(43,80%,55%)] text-lg font-bold select-none">
            Au
          </div>
          <div>
            <p className="text-xs font-medium tracking-wider uppercase text-[hsl(43,50%,65%)]">
              Gold (XAUUSD)
            </p>
            {loading && displayPrice === null ? (
              <div className="flex items-center gap-2 mt-1">
                <Loader2 className="h-5 w-5 animate-spin text-[hsl(43,60%,55%)]" />
                <span className="text-sm text-[hsl(43,40%,60%)]">Fetching live price…</span>
              </div>
            ) : displayPrice !== null ? (
              <p className="text-2xl sm:text-3xl font-bold font-mono tracking-tight text-[hsl(43,80%,70%)] transition-all duration-300">
                ${displayPrice.toFixed(2)}
              </p>
            ) : (
              <p className="text-sm text-[hsl(var(--destructive))]">Price unavailable</p>
            )}
          </div>
        </div>

        {/* Right */}
        <div className="flex items-center gap-2">
          {error && (
            <div className="flex items-center gap-1 text-xs text-[hsl(43,40%,55%)]">
              <WifiOff className="h-3 w-3" />
              <span>Last known</span>
            </div>
          )}
          {displayPrice !== null && prevPrice !== null && (
            <div
              className={`flex items-center gap-1 rounded-full px-3 py-1.5 text-sm font-semibold transition-colors duration-300 ${
                isUp
                  ? "bg-[hsl(var(--success))/0.15] text-[hsl(var(--success))]"
                  : "bg-[hsl(var(--destructive))/0.15] text-[hsl(var(--destructive))]"
              }`}
            >
              {isUp ? (
                <TrendingUp className="h-4 w-4" />
              ) : (
                <TrendingDown className="h-4 w-4" />
              )}
              <span>{isUp ? "▲" : "▼"}</span>
            </div>
          )}
          {displayPrice !== null && (
            <span
              className={`h-2.5 w-2.5 rounded-full animate-pulse-glow transition-colors duration-300 ${
                isUp ? "bg-[hsl(var(--success))]" : "bg-[hsl(var(--destructive))]"
              }`}
            />
          )}
        </div>
      </CardContent>
    </Card>
  );
};
