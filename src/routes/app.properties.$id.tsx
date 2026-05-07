import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip } from "recharts";
import { ArrowLeft, MapPin, Star, Bed, Bath, Maximize, Wifi, Car, Wind, Calendar, MessageSquare, Share2, Heart } from "lucide-react";
import { Card, Badge, SectionTitle } from "@/components/app/ui";

export const Route = createFileRoute("/app/properties/$id")({
  component: PropertyDetails,
});

const yieldData = Array.from({ length: 12 }, (_, i) => ({ m: i, y: 8 + i * 0.4 + Math.sin(i) * 1.2 }));

function PropertyDetails() {
  const { id } = Route.useParams();
  const [tab, setTab] = useState("overview");
  const [showBook, setShowBook] = useState(false);

  return (
    <>
      <Link to="/app/properties" className="mb-4 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> Back to properties
      </Link>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <div className="relative aspect-[16/10] overflow-hidden rounded-3xl bg-gradient-to-br from-emerald/40 via-skyblue/30 to-emerald-glow/40">
            <div className="absolute inset-0 grid-bg opacity-40" />
            <div className="absolute right-4 top-4 flex gap-2">
              <button className="flex h-9 w-9 items-center justify-center rounded-full glass-strong"><Heart className="h-4 w-4" /></button>
              <button className="flex h-9 w-9 items-center justify-center rounded-full glass-strong"><Share2 className="h-4 w-4" /></button>
            </div>
            <div className="absolute bottom-4 left-4 flex gap-2">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-14 w-20 rounded-xl glass-strong" />
              ))}
            </div>
          </div>

          <div className="mt-6 flex items-start justify-between">
            <div>
              <Badge variant="emerald">Active · #PRT-{id}</Badge>
              <h1 className="mt-2 font-display text-3xl font-bold">Príncipe Real Loft</h1>
              <div className="mt-1 flex items-center gap-3 text-sm text-muted-foreground">
                <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" /> Lisbon, Portugal</span>
                <span className="flex items-center gap-1"><Star className="h-3.5 w-3.5 fill-emerald text-emerald" /> 4.9 (218 reviews)</span>
              </div>
            </div>
            <div className="text-right">
              <div className="font-display text-3xl font-bold">€2,450</div>
              <div className="text-xs text-muted-foreground">/ month · €145 / night</div>
            </div>
          </div>

          <div className="mt-6 flex gap-6 border-b border-border">
            {["overview", "analytics", "bookings", "reviews"].map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`relative pb-3 text-sm font-medium capitalize ${tab === t ? "text-foreground" : "text-muted-foreground hover:text-foreground"}`}
              >
                {t}
                {tab === t && <span className="absolute -bottom-px left-0 right-0 h-0.5 rounded-full bg-emerald" />}
              </button>
            ))}
          </div>

          <div className="mt-6 space-y-6">
            {tab === "overview" && (
              <>
                <Card>
                  <SectionTitle title="Description" />
                  <p className="text-sm text-muted-foreground">A meticulously designed loft in Lisbon's most iconic neighborhood. Floor-to-ceiling windows, custom oak interiors, full smart-home integration. Perfect for premium short stays or executive long-term tenants.</p>
                </Card>
                <Card>
                  <SectionTitle title="Specs" />
                  <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                    {[
                      { i: Bed, l: "Bedrooms", v: "2" },
                      { i: Bath, l: "Bathrooms", v: "2" },
                      { i: Maximize, l: "Area", v: "98 m²" },
                      { i: Calendar, l: "Built", v: "2022" },
                    ].map((s) => (
                      <div key={s.l} className="rounded-2xl border border-border/50 bg-secondary/30 p-4">
                        <s.i className="h-4 w-4 text-emerald" />
                        <div className="mt-2 font-display text-lg font-bold">{s.v}</div>
                        <div className="text-xs text-muted-foreground">{s.l}</div>
                      </div>
                    ))}
                  </div>
                </Card>
                <Card>
                  <SectionTitle title="Amenities" />
                  <div className="flex flex-wrap gap-2">
                    {[
                      { i: Wifi, l: "Gigabit Wi-Fi" },
                      { i: Car, l: "Parking" },
                      { i: Wind, l: "Climate control" },
                    ].map((a) => (
                      <span key={a.l} className="inline-flex items-center gap-1.5 rounded-full border border-border bg-secondary/50 px-3 py-1.5 text-xs font-medium">
                        <a.i className="h-3.5 w-3.5 text-emerald" />
                        {a.l}
                      </span>
                    ))}
                  </div>
                </Card>
              </>
            )}

            {tab === "analytics" && (
              <Card>
                <SectionTitle title="12-month yield projection" />
                <div className="h-72">
                  <ResponsiveContainer>
                    <LineChart data={yieldData}>
                      <XAxis dataKey="m" tickLine={false} axisLine={false} fontSize={11} stroke="currentColor" opacity={0.4} />
                      <YAxis tickLine={false} axisLine={false} fontSize={11} stroke="currentColor" opacity={0.4} />
                      <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid var(--border)", background: "var(--card)" }} />
                      <Line type="monotone" dataKey="y" stroke="oklch(0.62 0.16 160)" strokeWidth={3} dot={{ r: 3 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </Card>
            )}

            {tab === "bookings" && (
              <Card>
                <SectionTitle title="Upcoming bookings" />
                <div className="space-y-3">
                  {[
                    { g: "AS", n: "Anna Schmidt", d: "Dec 12 — Dec 18", a: "€870" },
                    { g: "RK", n: "Rohan Kapoor", d: "Dec 22 — Jan 02", a: "€1,580" },
                    { g: "ML", n: "Marie Lefèvre", d: "Jan 08 — Jan 15", a: "€1,015" },
                  ].map((b, i) => (
                    <div key={i} className="flex items-center justify-between rounded-2xl border border-border/50 bg-secondary/30 p-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-emerald to-skyblue text-xs font-bold text-white">{b.g}</div>
                        <div>
                          <div className="font-semibold">{b.n}</div>
                          <div className="text-xs text-muted-foreground">{b.d}</div>
                        </div>
                      </div>
                      <div className="font-display font-bold">{b.a}</div>
                    </div>
                  ))}
                </div>
              </Card>
            )}

            {tab === "reviews" && (
              <Card>
                <SectionTitle title="Recent reviews" />
                <div className="space-y-4">
                  {[
                    { n: "Anna S.", r: 5, c: "Absolutely flawless. The smart-home integration is next level." },
                    { n: "James W.", r: 5, c: "Best loft in Lisbon. Will be back for sure." },
                  ].map((r, i) => (
                    <div key={i} className="border-b border-border/50 pb-4 last:border-0">
                      <div className="flex items-center gap-2">
                        <div className="font-semibold">{r.n}</div>
                        <div className="flex">{Array.from({ length: r.r }).map((_, j) => <Star key={j} className="h-3 w-3 fill-emerald text-emerald" />)}</div>
                      </div>
                      <p className="mt-1 text-sm text-muted-foreground">{r.c}</p>
                    </div>
                  ))}
                </div>
              </Card>
            )}
          </div>
        </div>

        <div className="space-y-4">
          <Card>
            <div className="text-xs uppercase tracking-wide text-muted-foreground">This month</div>
            <div className="mt-2 font-display text-3xl font-bold">€3,200</div>
            <div className="text-xs text-emerald">+8.4% vs last month</div>
            <div className="mt-4 grid grid-cols-2 gap-3 border-t border-border/50 pt-4 text-center">
              <div>
                <div className="text-xs text-muted-foreground">ROI</div>
                <div className="font-display text-lg font-bold text-emerald">14.2%</div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground">Occupancy</div>
                <div className="font-display text-lg font-bold">92%</div>
              </div>
            </div>
          </Card>

          <Card>
            <button onClick={() => setShowBook(true)} className="w-full rounded-full bg-gradient-to-r from-emerald to-emerald-glow py-3 text-sm font-semibold text-white shadow-glow">Book a stay</button>
            <button className="mt-2 flex w-full items-center justify-center gap-2 rounded-full border border-border py-3 text-sm font-medium hover:bg-secondary">
              <MessageSquare className="h-4 w-4" /> Message host
            </button>
          </Card>

          <Card>
            <SectionTitle title="Smart locks" />
            <div className="space-y-2">
              {["Front door", "Storage", "Garage"].map((l) => (
                <div key={l} className="flex items-center justify-between rounded-xl bg-secondary/40 p-3 text-sm">
                  <span>{l}</span>
                  <Badge variant="emerald">Online</Badge>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>

      {showBook && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 animate-in fade-in" onClick={() => setShowBook(false)}>
          <div className="w-full max-w-md rounded-3xl bg-card p-6 shadow-elegant animate-in zoom-in-95" onClick={(e) => e.stopPropagation()}>
            <h3 className="font-display text-xl font-bold">Book Príncipe Real Loft</h3>
            <p className="mt-1 text-sm text-muted-foreground">€145 / night</p>
            <div className="mt-5 grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium">Check in</label>
                <input type="date" className="mt-1 w-full rounded-xl border border-border bg-secondary/40 p-2.5 text-sm" />
              </div>
              <div>
                <label className="text-xs font-medium">Check out</label>
                <input type="date" className="mt-1 w-full rounded-xl border border-border bg-secondary/40 p-2.5 text-sm" />
              </div>
            </div>
            <div className="mt-4">
              <label className="text-xs font-medium">Guests</label>
              <input type="number" defaultValue={2} className="mt-1 w-full rounded-xl border border-border bg-secondary/40 p-2.5 text-sm" />
            </div>
            <button className="mt-5 w-full rounded-full bg-foreground py-3 text-sm font-semibold text-background">Confirm booking</button>
          </div>
        </div>
      )}
    </>
  );
}
