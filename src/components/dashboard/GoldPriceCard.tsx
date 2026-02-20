import { useState, useEffect, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { TrendingUp, TrendingDown } from "lucide-react";

const INITIAL_PRICE = 3328.45;

function simulatePrice(prev: number) {
  const change = (Math.random() - 0.48) * 2.5;
  return Math.round((prev + change) * 100) / 100;
}

export const GoldPriceCard = () => {
  const [price, setPrice] = useState(INITIAL_PRICE);
  const [prevPrice, setPrevPrice] = useState(INITIAL_PRICE);
  const openPrice = useRef(INITIAL_PRICE);

  useEffect(() => {
    const interval = setInterval(() => {
      setPrice((p) => {
        setPrevPrice(p);
        return simulatePrice(p);
      });
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const change = price - openPrice.current;
  const changePct = (change / openPrice.current) * 100;
  const isUp = price >= prevPrice;

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
            <p className="text-2xl sm:text-3xl font-bold font-mono tracking-tight text-[hsl(43,80%,70%)]">
              ${price.toFixed(2)}
            </p>
          </div>
        </div>

        {/* Right */}
        <div className="flex items-center gap-2">
          <div
            className={`flex items-center gap-1 rounded-full px-3 py-1.5 text-sm font-semibold ${
              change >= 0
                ? "bg-[hsl(var(--success))/0.15] text-[hsl(var(--success))]"
                : "bg-[hsl(var(--destructive))/0.15] text-[hsl(var(--destructive))]"
            }`}
          >
            {change >= 0 ? (
              <TrendingUp className="h-4 w-4" />
            ) : (
              <TrendingDown className="h-4 w-4" />
            )}
            <span>
              {change >= 0 ? "+" : ""}
              {change.toFixed(2)} ({changePct >= 0 ? "+" : ""}
              {changePct.toFixed(2)}%)
            </span>
          </div>
          <span
            className={`h-2.5 w-2.5 rounded-full animate-pulse-glow ${
              isUp ? "bg-[hsl(var(--success))]" : "bg-[hsl(var(--destructive))]"
            }`}
          />
        </div>
      </CardContent>
    </Card>
  );
};
