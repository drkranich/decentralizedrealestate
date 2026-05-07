import { motion } from "framer-motion";
import { Sparkles, Wrench, Truck, Palette, Shield, Sofa, Wifi } from "lucide-react";

const services = [
  { icon: Sparkles, label: "Cleaning", color: "from-emerald/30 to-emerald-glow/20" },
  { icon: Wrench, label: "Repairs", color: "from-skyblue/30 to-emerald/20" },
  { icon: Truck, label: "Moving", color: "from-emerald-glow/30 to-skyblue/20" },
  { icon: Palette, label: "Interior design", color: "from-emerald/30 to-skyblue/20" },
  { icon: Shield, label: "Insurance", color: "from-skyblue/30 to-emerald-glow/20" },
  { icon: Sofa, label: "Furniture packages", color: "from-emerald/30 to-emerald-glow/20" },
  { icon: Wifi, label: "Internet setup", color: "from-skyblue/30 to-emerald/20" },
];

export function Marketplace() {
  return (
    <section id="marketplace" className="py-24">
      <div className="mx-auto max-w-7xl px-4">
        <div className="mx-auto max-w-2xl text-center">
          <div className="text-sm font-medium text-emerald">Marketplace</div>
          <h2 className="mt-2 font-display text-4xl font-bold md:text-5xl">A network of <span className="gradient-text">vetted services</span></h2>
          <p className="mt-4 text-muted-foreground">Book trusted local pros in one tap. Quality guaranteed, in 84 countries.</p>
        </div>

        <div className="mt-14 grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {services.map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.05 }}
              className={`group cursor-pointer overflow-hidden rounded-3xl border border-border bg-gradient-to-br ${s.color} p-6 transition-all hover:-translate-y-1 hover:shadow-elegant`}
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl glass-strong">
                <s.icon className="h-5 w-5 text-emerald" />
              </div>
              <div className="mt-12 font-display text-lg font-semibold">{s.label}</div>
              <div className="mt-1 text-xs text-muted-foreground">Book in seconds →</div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
