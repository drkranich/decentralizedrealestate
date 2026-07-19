import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import {
  Brush, Hammer, Truck, Sofa, ShieldCheck, Cpu, Star, MapPin, MessageSquare,
  Calendar, CreditCard, Search, SlidersHorizontal, Zap, CheckCircle2, Sparkles, Clock,
} from "lucide-react";
import { PageHeader, StatCard, Card, SectionTitle, Badge } from "@/components/app/ui";
import { useBrand } from "@/components/brand/BrandProvider";

export const Route = createFileRoute("/app/marketplace")({
  component: Marketplace,
});

const categories = [
  { key: "all", label: "All", icon: Sparkles },
  { key: "cleaning", label: "Cleaning", icon: Brush },
  { key: "repairs", label: "Repairs", icon: Hammer },
  { key: "movers", label: "Movers", icon: Truck },
  { key: "design", label: "Interior", icon: Sofa },
  { key: "insurance", label: "Insurance", icon: ShieldCheck },
  { key: "smarthome", label: "Smart Home", icon: Cpu },
];

const providers = [
  { id: 1, name: "Lumen Cleaning Co.", cat: "cleaning", city: "Lisbon, PT", rating: 4.9, reviews: 312, price: "From €45/h", verified: true, eta: "Today", tags: ["Eco", "Insured"] },
  { id: 2, name: "FixIt Pro Network", cat: "repairs", city: "Tokyo, JP", rating: 4.8, reviews: 198, price: "From €60/h", verified: true, eta: "2h", tags: ["24/7", "Licensed"] },
  { id: 3, name: "GlobalMove Express", cat: "movers", city: "New York, US", rating: 4.7, reviews: 421, price: "From €280", verified: true, eta: "Tomorrow", tags: ["Insured"] },
  { id: 4, name: "Studio Noir Interiors", cat: "design", city: "Berlin, DE", rating: 5.0, reviews: 87, price: "From €1.2k/room", verified: true, eta: "Consult", tags: ["Award-winning"] },
  { id: 5, name: "Aegis Property Cover", cat: "insurance", city: "Global", rating: 4.6, reviews: 1284, price: "From €18/mo", verified: true, eta: "Instant", tags: ["A+ rated"] },
  { id: 6, name: "Nest Smart Installers", cat: "smarthome", city: "Dubai, AE", rating: 4.9, reviews: 156, price: "From €240", verified: true, eta: "48h", tags: ["Matter", "Z-Wave"] },
  { id: 7, name: "SparkleHome Bali", cat: "cleaning", city: "Ubud, ID", rating: 4.8, reviews: 98, price: "From €22/h", verified: false, eta: "Today", tags: ["Eco"] },
  { id: 8, name: "MasterPlumb Tokyo", cat: "repairs", city: "Tokyo, JP", rating: 4.7, reviews: 142, price: "From €80/h", verified: true, eta: "1h", tags: ["Emergency"] },
];

const reviews = [
  { who: "Sofia M.", who2: "Lumen Cleaning Co.", r: 5, t: "Spotless work, on time. Will book again.", when: "2d ago" },
  { who: "Carlos R.", who2: "FixIt Pro Network", r: 5, t: "Diagnosed the leak in 10 minutes. Saved my weekend.", when: "5d ago" },
  { who: "Anna K.", who2: "Nest Smart Installers", r: 4, t: "Great install of Matter hub, slightly delayed.", when: "1w ago" },
];

const messages = [
  { who: "Lumen Cleaning Co.", last: "We can come tomorrow at 10am ✨", t: "12m", unread: 2 },
  { who: "FixIt Pro Network", last: "Quote attached: €180 incl. parts", t: "1h", unread: 0 },
  { who: "Studio Noir Interiors", last: "Mood board ready for review", t: "3h", unread: 1 },
];

function Marketplace() {
  const brand = useBrand();
  const [cat, setCat] = useState("all");
  const [q, setQ] = useState("");

  const filtered = providers.filter((p) => (cat === "all" || p.cat === cat) && (q === "" || p.name.toLowerCase().includes(q.toLowerCase())));

  return (
    <>
      <PageHeader title="Service Marketplace" subtitle={`${brand.name} · decentralized network of vetted professionals.`}>
        <button className="rounded-full border border-border bg-card px-4 py-2 text-sm font-medium hover:bg-secondary">My bookings</button>
        <button className="rounded-full bg-emerald px-4 py-2 text-sm font-semibold text-white shadow-glow">Become a provider</button>
      </PageHeader>

      <div className="mt-4 rounded-2xl border border-dashed border-skyblue/30 bg-skyblue/5 p-4 text-xs text-muted-foreground">
        <span className="font-semibold text-skyblue">Nota:</span> os prestadores de serviço e avaliações abaixo são dados de demonstração — o marketplace de serviços ainda não tem fornecedores reais cadastrados.
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Providers worldwide" value="12,840" change="+182 this week" icon={Sparkles} />
        <StatCard label="Avg response" value="14 min" change="−3 min" icon={Clock} accent="skyblue" />
        <StatCard label="Booked this month" value="48" change="+12 vs last" icon={Calendar} />
        <StatCard label="Avg rating" value="4.86" change="+0.04" icon={Star} accent="skyblue" />
      </div>

      {/* Search + categories */}
      <Card className="mt-6">
        <div className="flex flex-col gap-3 md:flex-row">
          <div className="flex flex-1 items-center gap-2 rounded-full border border-border bg-background px-4 py-2.5">
            <Search className="h-4 w-4 text-muted-foreground" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search providers, services, cities…"
              className="w-full bg-transparent text-sm placeholder:text-muted-foreground focus:outline-none"
            />
          </div>
          <button className="flex items-center gap-2 rounded-full border border-border bg-background px-4 py-2.5 text-sm font-medium hover:bg-secondary">
            <SlidersHorizontal className="h-4 w-4" /> Filters
          </button>
          <button className="flex items-center gap-2 rounded-full bg-emerald px-4 py-2.5 text-sm font-semibold text-white shadow-glow">
            <Zap className="h-4 w-4" /> Instant quote
          </button>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {categories.map((c) => (
            <button
              key={c.key}
              onClick={() => setCat(c.key)}
              className={`flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition ${
                cat === c.key
                  ? "border-emerald bg-emerald/10 text-emerald"
                  : "border-border bg-secondary/30 hover:bg-secondary"
              }`}
            >
              <c.icon className="h-4 w-4" />
              {c.label}
            </button>
          ))}
        </div>
      </Card>

      {/* Provider grid */}
      <div className="mt-6 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {filtered.map((p) => {
          const Cat = categories.find((c) => c.key === p.cat)?.icon ?? Sparkles;
          return (
            <Card key={p.id} className="group flex flex-col gap-4 transition-all hover:-translate-y-1 hover:shadow-elegant">
              <div className="flex items-start gap-3">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald text-white shadow-glow">
                  <Cat className="h-6 w-6" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="truncate font-display text-base font-semibold">{p.name}</h3>
                    {p.verified && <CheckCircle2 className="h-4 w-4 text-emerald" />}
                  </div>
                  <div className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground">
                    <MapPin className="h-3 w-3" /> {p.city}
                  </div>
                </div>
                <Badge variant="emerald">{p.eta}</Badge>
              </div>

              <div className="flex items-center gap-3 text-sm">
                <span className="flex items-center gap-1 font-semibold">
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  {p.rating}
                </span>
                <span className="text-xs text-muted-foreground">({p.reviews} reviews)</span>
                <span className="ml-auto font-mono text-xs font-semibold">{p.price}</span>
              </div>

              <div className="flex flex-wrap gap-1.5">
                {p.tags.map((t) => (
                  <span key={t} className="rounded-full bg-secondary/60 px-2.5 py-0.5 text-[11px] font-medium">{t}</span>
                ))}
              </div>

              <div className="flex gap-2 pt-1">
                <button className="flex flex-1 items-center justify-center gap-1.5 rounded-full bg-foreground py-2 text-xs font-semibold text-background hover:opacity-90">
                  <Calendar className="h-3.5 w-3.5" /> Book
                </button>
                <button className="flex items-center justify-center rounded-full border border-border px-3 py-2 text-xs font-medium hover:bg-secondary">
                  <MessageSquare className="h-3.5 w-3.5" />
                </button>
                <button className="flex items-center justify-center rounded-full border border-border px-3 py-2 text-xs font-medium hover:bg-secondary">
                  <Zap className="h-3.5 w-3.5 text-emerald" />
                </button>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Bookings + Messages + Quotes */}
      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <Card>
          <SectionTitle title="Upcoming bookings" action={<Calendar className="h-4 w-4 text-emerald" />} />
          <div className="space-y-3">
            {[
              { p: "Lumen Cleaning Co.", prop: "Lisbon Loft 3B", when: "Tomorrow · 10:00", price: "€90" },
              { p: "FixIt Pro Network", prop: "Tokyo Tower", when: "Dec 14 · 14:30", price: "€180" },
              { p: "Nest Smart Installers", prop: "Dubai Penthouse", when: "Dec 18 · 09:00", price: "€420" },
            ].map((b, i) => (
              <div key={i} className="rounded-2xl border border-border/40 bg-secondary/20 p-3">
                <div className="flex items-center justify-between">
                  <div className="text-sm font-semibold">{b.p}</div>
                  <span className="font-mono text-xs font-semibold">{b.price}</span>
                </div>
                <div className="text-xs text-muted-foreground">{b.prop}</div>
                <div className="mt-1 flex items-center justify-between">
                  <span className="text-xs text-emerald">{b.when}</span>
                  <button className="text-xs font-semibold text-emerald hover:underline">Reschedule</button>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <SectionTitle title="Messages" action={<MessageSquare className="h-4 w-4 text-skyblue" />} />
          <div className="space-y-2">
            {messages.map((m, i) => (
              <button key={i} className="flex w-full items-center gap-3 rounded-2xl p-2.5 text-left transition hover:bg-secondary/50">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald text-xs font-bold text-white">
                  {m.who.split(" ").map((s) => s[0]).slice(0, 2).join("")}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between">
                    <span className="truncate text-sm font-semibold">{m.who}</span>
                    <span className="text-[11px] text-muted-foreground">{m.t}</span>
                  </div>
                  <div className="truncate text-xs text-muted-foreground">{m.last}</div>
                </div>
                {m.unread > 0 && (
                  <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-emerald px-1.5 text-[10px] font-bold text-white">{m.unread}</span>
                )}
              </button>
            ))}
          </div>
        </Card>

        <Card>
          <SectionTitle title="Instant quotes" action={<Zap className="h-4 w-4 text-emerald animate-pulse-glow" />} />
          <div className="space-y-3">
            {[
              { svc: "Deep cleaning · 120m²", price: 145, eta: "Today", from: "Lumen" },
              { svc: "AC repair", price: 180, eta: "2h", from: "FixIt Pro" },
              { svc: "Smart lock install", price: 240, eta: "48h", from: "Nest" },
            ].map((q, i) => (
              <div key={i} className="rounded-2xl border border-emerald/20 bg-emerald/5 p-3">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-semibold">{q.svc}</div>
                    <div className="text-[11px] text-muted-foreground">{q.from} · ETA {q.eta}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-display text-lg font-bold">€{q.price}</div>
                    <button className="text-[11px] font-semibold text-emerald hover:underline">Accept</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Reviews + Payments */}
      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <SectionTitle title="Recent reviews" action={<Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />} />
          <div className="space-y-3">
            {reviews.map((r, i) => (
              <div key={i} className="rounded-2xl border border-border/40 p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-skyblue text-xs font-bold text-white">
                      {r.who.split(" ").map((s) => s[0]).join("")}
                    </div>
                    <div>
                      <div className="text-sm font-semibold">{r.who}</div>
                      <div className="text-[11px] text-muted-foreground">→ {r.who2}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-0.5">
                    {Array.from({ length: 5 }).map((_, j) => (
                      <Star key={j} className={`h-3.5 w-3.5 ${j < r.r ? "fill-yellow-400 text-yellow-400" : "text-muted"}`} />
                    ))}
                  </div>
                </div>
                <p className="mt-2 text-sm text-muted-foreground">"{r.t}"</p>
                <div className="mt-1 text-[11px] text-muted-foreground">{r.when}</div>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <SectionTitle title="Payments" action={<CreditCard className="h-4 w-4 text-skyblue" />} />
          <div className="rounded-2xl border border-emerald/20 bg-emerald/5 p-4">
            <div className="text-xs uppercase tracking-wide text-emerald">This month</div>
            <div className="mt-1 font-display text-3xl font-bold">€2,840</div>
            <div className="text-xs text-muted-foreground">12 services · auto-paid via SEPA</div>
          </div>
          <div className="mt-3 space-y-2">
            {[
              { svc: "Cleaning · Lumen", a: 90, d: "Dec 09" },
              { svc: "Repair · FixIt Pro", a: 180, d: "Dec 06" },
              { svc: "Insurance · Aegis", a: 18, d: "Dec 01" },
            ].map((p, i) => (
              <div key={i} className="flex items-center justify-between rounded-xl border border-border/40 px-3 py-2 text-sm">
                <span className="truncate">{p.svc}</span>
                <span className="font-mono text-xs font-semibold">€{p.a}</span>
                <span className="text-[11px] text-muted-foreground">{p.d}</span>
              </div>
            ))}
          </div>
          <button className="mt-3 w-full rounded-full border border-border py-2 text-xs font-medium hover:bg-secondary">View all invoices</button>
        </Card>
      </div>
    </>
  );
}
