import { useState, useEffect, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Calendar,
  Filter,
  RefreshCw,
  ChevronDown,
  Clock,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

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

const IMPACT_CONFIG = {
  high: { label: "High", className: "bg-destructive/15 text-destructive border-destructive/30" },
  medium: { label: "Medium", className: "bg-orange-500/15 text-orange-400 border-orange-500/30" },
  low: { label: "Low", className: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30" },
};

const CURRENCIES = ["USD", "EUR", "GBP", "JPY", "AUD", "CAD", "CHF", "NZD"];

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

const normalizeCurrency = (currency: string) =>
  COUNTRY_TO_CURRENCY[currency.toUpperCase()] ?? currency.toUpperCase();

interface EconomicCalendarProps {
  marketMode?: "scalper" | "swing" | "news";
}

export function EconomicCalendar({ marketMode = "swing" }: EconomicCalendarProps) {
  const [events, setEvents] = useState<EconomicEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [impactFilter, setImpactFilter] = useState<Set<string>>(new Set(["high", "medium"]));
  const [currencyFilter, setCurrencyFilter] = useState<Set<string>>(new Set(CURRENCIES));

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("economic-calendar");
      if (error) throw error;
      if (data?.success && data.data) {
        setEvents(
          data.data.map((event: EconomicEvent) => ({
            ...event,
            currency: normalizeCurrency(event.currency),
          }))
        );
      }
    } catch (err) {
      console.error("Failed to fetch economic calendar:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const toggleImpact = (impact: string) => {
    setImpactFilter((prev) => {
      const next = new Set(prev);
      if (next.has(impact)) next.delete(impact);
      else next.add(impact);
      return next;
    });
  };

  const toggleCurrency = (currency: string) => {
    setCurrencyFilter((prev) => {
      const next = new Set(prev);
      if (next.has(currency)) next.delete(currency);
      else next.add(currency);
      return next;
    });
  };

  const filtered = useMemo(() => {
    let result = events.filter(
      (e) => impactFilter.has(e.impact) && currencyFilter.has(normalizeCurrency(e.currency))
    );

    if (marketMode === "scalper") {
      // Scalper: only high impact events within next 2 hours
      const now = new Date();
      const twoHoursLater = new Date(now.getTime() + 2 * 60 * 60 * 1000);
      result = result.filter(
        (e) => e.impact === "high" && new Date(e.time) >= now && new Date(e.time) <= twoHoursLater
      );
    }
    // Swing: show all (default behavior)

    return result;
  }, [events, impactFilter, currencyFilter, marketMode]);

  // Group events by date
  const grouped = useMemo(() => {
    const map = new Map<string, EconomicEvent[]>();
    filtered.forEach((e) => {
      const dateKey = new Date(e.time).toLocaleDateString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
      });
      if (!map.has(dateKey)) map.set(dateKey, []);
      map.get(dateKey)!.push(e);
    });
    return map;
  }, [filtered]);

  const formatTime = (iso: string) =>
    new Date(iso).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });

  const isPast = (iso: string) => new Date(iso) < new Date();

  return (
    <div className="glass-card rounded-2xl overflow-hidden">
      {/* Header */}
      <div className="px-5 pt-4 pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
            <Calendar className="h-4 w-4 text-primary" />
          </div>
          <div>
            <p className="text-sm font-semibold tracking-tight">Economic Calendar</p>
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider">
              {marketMode === "scalper" ? "High Impact · Next 2 Hours" : "Upcoming Events"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Impact Filter */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="h-8 text-xs gap-1.5 rounded-lg">
                <Filter className="h-3 w-3" />
                Impact
                <ChevronDown className="h-3 w-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-36">
              {(["high", "medium"] as const).map((level) => (
                <DropdownMenuCheckboxItem
                  key={level}
                  checked={impactFilter.has(level)}
                  onCheckedChange={() => toggleImpact(level)}
                >
                  <Badge
                    variant="outline"
                    className={`text-[10px] mr-2 ${IMPACT_CONFIG[level].className}`}
                  >
                    {IMPACT_CONFIG[level].label}
                  </Badge>
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Currency Filter */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="h-8 text-xs gap-1.5 rounded-lg">
                <Filter className="h-3 w-3" />
                Currency
                <ChevronDown className="h-3 w-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-36">
              {CURRENCIES.map((c) => (
                <DropdownMenuCheckboxItem
                  key={c}
                  checked={currencyFilter.has(c)}
                  onCheckedChange={() => toggleCurrency(c)}
                >
                  {c}
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 rounded-lg"
            onClick={fetchEvents}
            disabled={loading}
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
          </Button>
        </div>
      </div>

      {/* Table */}
      <div className="max-h-[480px] overflow-auto">
        <Table>
          <TableHeader>
            <TableRow className="border-border/20 hover:bg-transparent">
              <TableHead className="text-[11px] uppercase tracking-wider w-[100px]">Time</TableHead>
              <TableHead className="text-[11px] uppercase tracking-wider w-[70px]">Ccy</TableHead>
              <TableHead className="text-[11px] uppercase tracking-wider">Event</TableHead>
              <TableHead className="text-[11px] uppercase tracking-wider w-[80px] text-center">Impact</TableHead>
              <TableHead className="text-[11px] uppercase tracking-wider w-[80px] text-right">Previous</TableHead>
              <TableHead className="text-[11px] uppercase tracking-wider w-[80px] text-right">Forecast</TableHead>
              <TableHead className="text-[11px] uppercase tracking-wider w-[80px] text-right">Actual</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-12 text-muted-foreground">
                  <RefreshCw className="h-5 w-5 animate-spin mx-auto mb-2" />
                  Loading events...
                </TableCell>
              </TableRow>
            ) : filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-12 text-muted-foreground">
                  No events match your filters
                </TableCell>
              </TableRow>
            ) : (
              Array.from(grouped.entries()).map(([dateLabel, dayEvents]) => (
                <>
                  <TableRow key={dateLabel} className="border-border/10 hover:bg-transparent">
                    <TableCell
                      colSpan={7}
                      className="py-2 px-4 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider bg-muted/20"
                    >
                      {dateLabel}
                    </TableCell>
                  </TableRow>
                  {dayEvents.map((ev) => {
                    const past = isPast(ev.time);
                    return (
                      <TableRow
                        key={ev.id}
                        className={`border-border/10 ${past ? "opacity-50" : ""}`}
                      >
                        <TableCell className="py-2.5 px-4">
                          <div className="flex items-center gap-1.5 text-xs">
                            <Clock className="h-3 w-3 text-muted-foreground" />
                            {formatTime(ev.time)}
                          </div>
                        </TableCell>
                        <TableCell className="py-2.5 px-4">
                          <Badge
                            variant="secondary"
                            className="text-[10px] font-bold px-1.5 py-0"
                          >
                            {ev.currency}
                          </Badge>
                        </TableCell>
                        <TableCell className="py-2.5 px-4 text-xs font-medium">
                          {ev.event}
                        </TableCell>
                        <TableCell className="py-2.5 px-4 text-center">
                          <Badge
                            variant="outline"
                            className={`text-[10px] ${IMPACT_CONFIG[ev.impact].className}`}
                          >
                            {IMPACT_CONFIG[ev.impact].label}
                          </Badge>
                        </TableCell>
                        <TableCell className="py-2.5 px-4 text-xs text-right text-muted-foreground">
                          {ev.previous ?? "—"}
                        </TableCell>
                        <TableCell className="py-2.5 px-4 text-xs text-right text-muted-foreground">
                          {ev.forecast ?? "—"}
                        </TableCell>
                        <TableCell className="py-2.5 px-4 text-xs text-right font-medium">
                          {ev.actual ?? "—"}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
