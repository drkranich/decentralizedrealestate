import { motion } from "framer-motion";
import { Search, MapPin, Sparkles, TrendingUp, Globe2, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import heroImg from "@/assets/hero.jpg";

const stats = [
  { label: "Properties", value: "120K+", icon: Home, position: "top-12 left-4 md:top-16 md:left-12", delay: 0.4 },
  { label: "Avg ROI", value: "12.8%", icon: TrendingUp, position: "top-32 right-4 md:top-24 md:right-16", delay: 0.6 },
  { label: "Countries", value: "84", icon: Globe2, position: "bottom-12 left-6 md:bottom-20 md:left-20", delay: 0.8 },
];

export function Hero() {
  return (
    <section className="relative min-h-screen overflow-hidden pt-28 pb-20">
      <div className="absolute inset-0 -z-10">
        <img src={heroImg} alt="Futuristic city skyline" width={1920} height={1080} className="h-full w-full object-cover opacity-90" />
        <div className="absolute inset-0 bg-background/75" />
        <div className="absolute inset-0 grid-bg opacity-30" />
      </div>

      <div className="mx-auto max-w-7xl px-4">
        <div className="mx-auto max-w-4xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 rounded-full glass px-4 py-1.5 text-xs font-medium"
          >
            <Sparkles className="h-3.5 w-3.5 text-emerald" />
            <span>The world's first decentralized real estate OS</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="mt-6 font-display text-5xl font-bold leading-[1.05] tracking-tight md:text-7xl"
          >
            Own, host & invest in{" "}
            <span className="text-emerald">real estate</span>{" "}
            without borders.
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="mx-auto mt-6 max-w-2xl text-lg text-foreground/70 md:text-xl"
          >
            One platform to discover properties, fractional invest in tokenized assets, and automate operations with AI — anywhere on earth.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="mt-10"
          >
            <div className="mx-auto flex max-w-2xl items-center gap-2 rounded-full glass-strong p-2 shadow-elegant">
              <div className="flex flex-1 items-center gap-2 pl-4">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <input
                  className="w-full bg-transparent py-2 text-sm placeholder:text-muted-foreground focus:outline-none"
                  placeholder="Lisbon, Tokyo, NYC, Bali…"
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
          </motion.div>
        </div>

        {/* Floating stats */}
        <div className="pointer-events-none relative mt-20 hidden h-64 md:block">
          {stats.map((s) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: s.delay }}
              className={`absolute ${s.position} animate-float`}
              style={{ animationDelay: `${s.delay}s` }}
            >
              <div className="flex items-center gap-3 rounded-2xl glass-strong px-5 py-3 shadow-soft">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald/20">
                  <s.icon className="h-5 w-5 text-emerald" />
                </div>
                <div className="text-left">
                  <div className="text-xs text-muted-foreground">{s.label}</div>
                  <div className="font-display text-xl font-bold">{s.value}</div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
