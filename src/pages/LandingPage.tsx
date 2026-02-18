import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Clock, Timer, Zap, Globe, ArrowRight, CheckCircle2, ChevronDown } from "lucide-react";
import { useState } from "react";

const features = [
  {
    icon: Clock,
    title: "Live Market Session Clock",
    description: "See which sessions are open, closed, or upcoming — updated every second in your local time.",
  },
  {
    icon: Timer,
    title: "Countdown to Next Session",
    description: "Know exactly when the next session opens with a real-time ticking countdown timer.",
  },
  {
    icon: Zap,
    title: "Session Overlap Indicator",
    description: "Spot high-volatility windows when London and New York sessions overlap in real time.",
  },
  {
    icon: Globe,
    title: "Automatic Timezone Detection",
    description: "Your timezone is detected automatically. All session times adjust to your local clock.",
  },
];

const steps = [
  { number: "01", title: "Detect Timezone", description: "We auto-detect your timezone so every session time is shown in your local clock." },
  { number: "02", title: "Select Sessions", description: "Choose the sessions you trade — Tokyo, London, New York, or all of them." },
  { number: "03", title: "Track & Get Alerts", description: "Watch live countdowns and get notified before sessions open or overlap." },
];

const faqs = [
  {
    q: "What is a market session clock?",
    a: "A market session clock shows you when major forex trading sessions (Tokyo, London, New York, Sydney) are open or closed, adjusted to your local timezone. It helps traders plan entries around session opens, closes, and high-volatility overlaps.",
  },
  {
    q: "Why do session overlaps matter?",
    a: "When two major sessions overlap — such as London and New York — trading volume and volatility increase significantly. These windows often produce the largest price moves of the day, making them ideal for intraday and scalping strategies.",
  },
  {
    q: "Is Market Clock free to use?",
    a: "Yes. The core session clock, countdowns, and timezone detection are completely free. Pro features like custom alerts, session builder, and economic calendar are coming soon.",
  },
  {
    q: "How accurate is the timezone detection?",
    a: "Market Clock uses your browser's built-in timezone API, which reads your system clock settings. This is the same method used by Google Calendar and other time-critical applications.",
  },
];

const seoSections = [
  {
    title: "What Are Forex Trading Sessions?",
    content: "The forex market operates 24 hours a day, five days a week, divided into four major trading sessions: Sydney, Tokyo, London, and New York. Each session has distinct characteristics — the Tokyo session tends to be quieter with tighter ranges, while the London session typically sees the highest volume and most significant price movements. Understanding when each session opens and closes in your local time is fundamental to successful trading.",
  },
  {
    title: "Why Session Overlaps Matter for Volatility",
    content: "Session overlaps occur when two major markets are open simultaneously. The most significant overlap is between London and New York (roughly 8:00 AM – 12:00 PM EST), which accounts for over 50% of all daily forex volume. During these windows, spreads tend to tighten, liquidity increases, and price action becomes more directional — creating ideal conditions for breakout and momentum strategies.",
  },
  {
    title: "Best Trading Sessions for Intraday Traders",
    content: "Intraday traders should focus on the London session open (the most volatile single-session period) and the London–New York overlap (the highest-volume window of the day). Scalpers often target the first hour of the London session for quick entries, while swing traders may use the New York session close to identify end-of-day setups. Market Clock helps you track all of these windows with precision countdown timers.",
  },
];

const FAQItem = ({ q, a }: { q: string; a: string }) => {
  const [open, setOpen] = useState(false);
  return (
    <div className="border border-border rounded-xl overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between p-5 text-left hover:bg-card/50 transition-colors"
      >
        <span className="font-semibold text-foreground pr-4">{q}</span>
        <ChevronDown className={`h-5 w-5 text-muted-foreground shrink-0 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <div className="px-5 pb-5 text-sm text-muted-foreground leading-relaxed">{a}</div>
      )}
    </div>
  );
};

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Nav */}
      <nav className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-lg">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <Clock className="h-6 w-6 text-primary" />
            <span className="text-lg font-bold tracking-tight">Market Clock</span>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/onboarding">
              <Button size="sm">Launch App</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <header className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,hsl(var(--primary)/0.08),transparent_60%)]" />
        <div className="relative mx-auto max-w-4xl px-4 py-24 text-center sm:py-32 lg:py-40">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-1.5 text-xs font-medium text-muted-foreground">
            <Zap className="h-3.5 w-3.5 text-primary" />
            Free for all traders
          </div>
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl leading-[1.1]">
            Track Global Market Sessions{" "}
            <span className="text-primary">in Your Local Time</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground sm:text-xl">
            Real-time session countdowns, smart alerts, and session overlap tracking — built for traders who need precise timing.
          </p>
          <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <Link to="/onboarding">
              <Button size="lg" className="gap-2 text-base px-8">
                Launch Market Clock
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link to="/dashboard">
              <Button variant="outline" size="lg" className="text-base px-8">
                View Live Dashboard
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Features */}
      <section className="border-t border-border bg-card/30 py-20 sm:py-28">
        <div className="mx-auto max-w-6xl px-4">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold sm:text-4xl">Everything You Need to Time the Market</h2>
            <p className="mt-3 text-muted-foreground max-w-xl mx-auto">
              Purpose-built tools for traders who take session timing seriously.
            </p>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((f) => (
              <div key={f.title} className="group rounded-2xl border border-border bg-card p-6 transition-colors hover:border-primary/40">
                <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10">
                  <f.icon className="h-5 w-5 text-primary" />
                </div>
                <h3 className="font-semibold text-foreground mb-2">{f.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{f.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-20 sm:py-28">
        <div className="mx-auto max-w-5xl px-4">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold sm:text-4xl">How It Works</h2>
            <p className="mt-3 text-muted-foreground">Get started in under 30 seconds.</p>
          </div>
          <div className="grid gap-8 sm:grid-cols-3">
            {steps.map((s) => (
              <div key={s.number} className="relative text-center">
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-primary/30 bg-primary/5">
                  <span className="text-xl font-bold text-primary font-mono">{s.number}</span>
                </div>
                <h3 className="font-semibold text-lg mb-2">{s.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{s.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SEO Content */}
      <section className="border-t border-border bg-card/30 py-20 sm:py-28">
        <div className="mx-auto max-w-3xl px-4 space-y-16">
          <div className="text-center">
            <h2 className="text-3xl font-bold sm:text-4xl">Trading Session Essentials</h2>
            <p className="mt-3 text-muted-foreground">Learn why session timing matters for every trader.</p>
          </div>
          {seoSections.map((s) => (
            <article key={s.title} className="space-y-3">
              <h3 className="text-xl font-bold">{s.title}</h3>
              <p className="text-muted-foreground leading-relaxed">{s.content}</p>
            </article>
          ))}
        </div>
      </section>

      {/* Social proof */}
      <section className="py-16 sm:py-20">
        <div className="mx-auto max-w-3xl px-4 text-center space-y-6">
          <div className="flex justify-center gap-1">
            {[1, 2, 3, 4, 5].map((i) => (
              <CheckCircle2 key={i} className="h-5 w-5 text-primary" />
            ))}
          </div>
          <p className="text-xl font-semibold sm:text-2xl">
            Built for intraday traders who need precise session timing and alerts.
          </p>
          <p className="text-muted-foreground">
            No signup required. No ads. Just a fast, accurate market session clock.
          </p>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-border bg-card/30 py-20 sm:py-28">
        <div className="mx-auto max-w-2xl px-4 text-center space-y-8">
          <h2 className="text-3xl font-bold sm:text-4xl">Start Tracking Market Sessions Now</h2>
          <p className="text-muted-foreground text-lg">
            Know exactly when sessions open, close, and overlap — in your timezone.
          </p>
          <Link to="/onboarding">
            <Button size="lg" className="gap-2 text-base px-10 mt-4">
              Launch Market Clock
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 sm:py-28">
        <div className="mx-auto max-w-2xl px-4">
          <h2 className="text-3xl font-bold text-center mb-10">Frequently Asked Questions</h2>
          <div className="space-y-3">
            {faqs.map((faq) => (
              <FAQItem key={faq.q} q={faq.q} a={faq.a} />
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-12">
        <div className="mx-auto max-w-6xl px-4">
          <div className="flex flex-col items-center gap-6 sm:flex-row sm:justify-between">
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-primary" />
              <span className="font-bold">Market Clock</span>
            </div>
            <p className="text-xs text-muted-foreground text-center max-w-md">
              Market Clock is a real-time forex session tracking tool. All times are derived from your system clock and are accurate to within one second. This tool provides session timing only — not financial advice.
            </p>
            <div className="flex gap-6 text-sm text-muted-foreground">
              <Link to="/onboarding" className="hover:text-foreground transition-colors">Get Started</Link>
              <Link to="/dashboard" className="hover:text-foreground transition-colors">Dashboard</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
