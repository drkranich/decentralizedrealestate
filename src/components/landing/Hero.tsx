import { Search, MapPin, Sparkles, TrendingUp, Globe2, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import heroImg from "@/assets/hero.jpg";
import { usePublicContent } from "@/lib/siteContent";

const statIcons = [Home, TrendingUp, Globe2];
const statPositions = [
  "top-0 left-0 md:top-4 md:left-8",
  "top-0 right-0 md:top-4 md:right-8",
  "bottom-0 left-1/2 -translate-x-1/2",
];
const statDelays = [0.2, 0.6, 1];

const heroDefaults = {
  badge: "The world's first decentralized real estate OS",
  headline_prefix: "Own, host & invest in",
  headline_emphasis: "real estate",
  headline_suffix: "without borders.",
  subtitle:
    "One platform to discover properties, fractional invest in tokenized assets, and automate operations with AI — anywhere on earth.",
  search_placeholder: "Lisbon, Tokyo, NYC, Bali…",
  stat1_label: "Properties", stat1_value: "120K+",
  stat2_label: "Avg ROI", stat2_value: "12.8%",
  stat3_label: "Countries", stat3_value: "84",
};

export function Hero() {
  const c = usePublicContent("hero", heroDefaults);
  const stats = [
    { label: c.stat1_label, value: c.stat1_value },
    { label: c.stat2_label, value: c.stat2_value },
    { label: c.stat3_label, value: c.stat3_value },
  ];
  return (
    <section className="relative min-h-screen overflow-hidden pt-28 pb-20">
      <div className="absolute inset-0 -z-10">
        <img src={heroImg} alt="Futuristic city skyline" width={1920} height={1080} className="h-full w-full object-cover opacity-90" />
        <div className="absolute inset-0 bg-background/75" />
        <div className="absolute inset-0 grid-bg opacity-30" />
      </div>

      <div className="mx-auto max-w-7xl px-4">
        <div className="mx-auto max-w-4xl text-center">
          <div
            className="inline-flex items-center gap-2 rounded-full glass px-4 py-1.5 text-xs font-medium"
          >
            <Sparkles className="h-3.5 w-3.5 text-emerald" />
            <span>{c.badge}</span>
          </div>

          <h1
            className="mt-6 font-display text-5xl font-bold leading-[1.05] tracking-tight md:text-7xl"
          >
            {c.headline_prefix}{" "}
            <span className="text-emerald">{c.headline_emphasis}</span>{" "}
            {c.headline_suffix}
          </h1>

          <p
            className="mx-auto mt-6 max-w-2xl text-lg text-foreground/70 md:text-xl"
          >
            {c.subtitle}
          </p>

          <div
            className="mt-10"
          >
            <div className="mx-auto flex max-w-2xl items-center gap-2 rounded-full glass-strong p-2 shadow-elegant">
              <div className="flex flex-1 items-center gap-2 pl-4">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <input
                  className="w-full bg-transparent py-2 text-sm placeholder:text-muted-foreground focus:outline-none"
                  placeholder={c.search_placeholder}
                />
              </div>
              <Button className="rounded-full bg-emerald px-5 shadow-glow">
                <Search className="h-4 w-4" />
                Search
              </Button>
            </div>

            <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
              <Button size="lg" className="rounded-full bg-foreground text-background hover:bg-foreground/90">Find Property</Button>
              <Button size="lg" variant="outline" className="rounded-full glass">Invest</Button>
              <Button size="lg" variant="outline" className="rounded-full glass">Become Host</Button>
            </div>
          </div>
        </div>

        {/* Floating stats */}
        <div className="pointer-events-none relative mt-20 hidden h-64 md:block">
          {stats.map((s, i) => {
            const Icon = statIcons[i];
            return (
            <div
              key={s.label}
              className={`absolute ${statPositions[i]} animate-float`}
              style={{ animationDelay: `${statDelays[i]}s` }}
            >
              <div className="flex items-center gap-3 rounded-2xl glass-strong px-5 py-3 shadow-soft">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald/20">
                  <Icon className="h-5 w-5 text-emerald" />
                </div>
                <div className="text-left">
                  <div className="text-xs text-muted-foreground">{s.label}</div>
                  <div className="font-display text-xl font-bold">{s.value}</div>
                </div>
              </div>
            </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
