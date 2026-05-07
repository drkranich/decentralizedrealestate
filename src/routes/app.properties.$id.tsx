import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useState } from "react";
import { ResponsiveContainer, AreaChart, Area, LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import {
  ArrowLeft, MapPin, Star, Bed, Bath, Maximize, Wifi, Car, Wind, Calendar,
  MessageSquare, Share2, Heart, Box, Sparkles, FileText, Wrench, Lock, Thermometer,
  Camera, Lightbulb, Activity,
} from "lucide-react";
import { Card, Badge, SectionTitle, StatCard } from "@/components/app/ui";
import { getProperty } from "@/data/properties";

export const Route = createFileRoute("/app/properties/$id")({
  component: PropertyDetails,
  notFoundComponent: () => (
    <div className="py-16 text-center">
      <h2 className="font-display text-2xl font-bold">Property not found</h2>
      <Link to="/app/properties" className="mt-4 inline-block text-sm text-emerald hover:underline">Back to properties</Link>
    </div>
  ),
});

const revenueData = Array.from({ length: 12 }, (_, i) => ({
  m: ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"][i],
  rev: 2400 + Math.round(Math.sin(i / 2) * 600 + i * 80),
  costs: 600 + Math.round(Math.cos(i / 3) * 150 + i * 10),
}));
const occData = Array.from({ length: 12 }, (_, i) => ({ m: i, o: 70 + Math.round(Math.sin(i / 2) * 12 + i) }));

function PropertyDetails() {
  const { id } = Route.useParams();
  const property = getProperty(id);
  if (!property) throw notFound();

  const [tab, setTab] = useState("overview");
  const [showBook, setShowBook] = useState(false);
  const [show3d, setShow3d] = useState(false);

  return (
    <>
      <Link to="/app/properties" className="mb-4 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> Back to properties
      </Link>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <div className={`relative aspect-[16/10] overflow-hidden rounded-3xl bg-gradient-to-br ${property.gradient}`}>
            <div className="absolute inset-0 grid-bg opacity-40" />
            <div className="absolute right-4 top-4 flex gap-2">
              <button className="flex h-9 w-9 items-center justify-center rounded-full glass-strong"><Heart className="h-4 w-4" /></button>
              <button className="flex h-9 w-9 items-center justify-center rounded-full glass-strong"><Share2 className="h-4 w-4" /></button>
              <button onClick={() => setShow3d(true)} className="flex items-center gap-1.5 rounded-full glass-strong px-3 py-1.5 text-xs font-semibold">
                <Box className="h-3.5 w-3.5" /> 3D Tour
              </button>
            </div>
            <div className="absolute bottom-4 left-4 flex gap-2">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className={`h-14 w-20 rounded-xl glass-strong border-2 ${i === 1 ? "border-emerald" : "border-transparent"}`} />
              ))}
            </div>
          </div>

          <div className="mt-6 flex flex-wrap items-start justify-between gap-3">
            <div>
              <Badge variant={property.status === "Active" ? "emerald" : property.status === "Maintenance" ? "warn" : "muted"}>
                {property.status} · #PRT-{property.id}
              </Badge>
              <h1 className="mt-2 font-display text-3xl font-bold">{property.name}</h1>
              <div className="mt-1 flex items-center gap-3 text-sm text-muted-foreground">
                <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" /> {property.address}</span>
              </div>
              <div className="mt-1 flex items-center gap-3 text-sm text-muted-foreground">
                <span className="flex items-center gap-1"><Star className="h-3.5 w-3.5 fill-emerald text-emerald" /> {property.rating} ({property.reviews} reviews)</span>
              </div>
            </div>
            <div className="text-right">
              <div className="font-display text-3xl font-bold">{property.price}</div>
              <div className="text-xs text-muted-foreground">/ month</div>
            </div>
          </div>

          <div className="mt-6 flex gap-6 overflow-x-auto border-b border-border">
            {["overview", "analytics", "documents", "maintenance", "smart devices", "bookings"].map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`relative whitespace-nowrap pb-3 text-sm font-medium capitalize ${tab === t ? "text-foreground" : "text-muted-foreground hover:text-foreground"}`}
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
                  <div className="mb-3 flex items-center justify-between">
                    <h2 className="font-display text-lg font-semibold">Description</h2>
                    <span className="inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-emerald/15 to-skyblue/15 px-2.5 py-1 text-[10px] font-semibold text-emerald">
                      <Sparkles className="h-3 w-3" /> AI generated
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">{property.description}</p>
                </Card>

                <Card>
                  <SectionTitle title="Specs" />
                  <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                    {[
                      { i: Bed, l: "Bedrooms", v: String(property.bedrooms) },
                      { i: Bath, l: "Bathrooms", v: String(property.bathrooms) },
                      { i: Maximize, l: "Area", v: `${property.area} m²` },
                      { i: Calendar, l: "Built", v: String(property.built) },
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
                  <SectionTitle title="Location" />
                  <div className="relative h-72 overflow-hidden rounded-2xl bg-gradient-to-br from-skyblue/20 via-emerald/10 to-emerald-glow/20">
                    <div className="absolute inset-0 grid-bg opacity-30" />
                    <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
                      <div className="relative">
                        <span className="absolute inset-0 -m-3 animate-ping rounded-full bg-emerald/40" />
                        <div className="relative flex h-10 w-10 items-center justify-center rounded-full bg-emerald shadow-glow">
                          <MapPin className="h-5 w-5 text-white" />
                        </div>
                      </div>
                    </div>
                    <div className="absolute bottom-3 left-3 rounded-xl glass-strong px-3 py-2 text-xs">
                      <div className="font-semibold">{property.coordinates.lat}, {property.coordinates.lng}</div>
                      <div className="text-[10px] text-muted-foreground">{property.city}, {property.country}</div>
                    </div>
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
              <>
                <div className="grid gap-4 sm:grid-cols-3">
                  <StatCard label="Revenue YTD" value="€38.4k" change="+12.4%" icon={Activity} />
                  <StatCard label="Net margin" value="68%" change="+3 pts" icon={Activity} />
                  <StatCard label="Avg stay" value="6.2 nights" icon={Activity} accent="skyblue" />
                </div>
                <Card>
                  <SectionTitle title="Revenue vs costs" />
                  <div className="h-72">
                    <ResponsiveContainer>
                      <BarChart data={revenueData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="currentColor" opacity={0.08} />
                        <XAxis dataKey="m" tickLine={false} axisLine={false} fontSize={11} stroke="currentColor" opacity={0.5} />
                        <YAxis tickLine={false} axisLine={false} fontSize={11} stroke="currentColor" opacity={0.5} />
                        <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid var(--border)", background: "var(--card)" }} />
                        <Bar dataKey="rev" fill="oklch(0.62 0.16 160)" radius={[6, 6, 0, 0]} />
                        <Bar dataKey="costs" fill="oklch(0.72 0.13 230)" radius={[6, 6, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </Card>
                <Card>
                  <SectionTitle title="Occupancy trend" />
                  <div className="h-56">
                    <ResponsiveContainer>
                      <AreaChart data={occData}>
                        <defs>
                          <linearGradient id="oc" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="oklch(0.62 0.16 160)" stopOpacity={0.4} />
                            <stop offset="100%" stopColor="oklch(0.62 0.16 160)" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <XAxis dataKey="m" tickLine={false} axisLine={false} fontSize={11} stroke="currentColor" opacity={0.5} />
                        <YAxis tickLine={false} axisLine={false} fontSize={11} stroke="currentColor" opacity={0.5} />
                        <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid var(--border)", background: "var(--card)" }} />
                        <Area type="monotone" dataKey="o" stroke="oklch(0.62 0.16 160)" strokeWidth={2.5} fill="url(#oc)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </Card>
              </>
            )}

            {tab === "documents" && (
              <Card>
                <SectionTitle title="Contracts & documents" action={<button className="text-xs font-semibold text-emerald hover:underline">Upload</button>} />
                <div className="space-y-2">
                  {[
                    { n: "Lease agreement 2025.pdf", s: "240 KB", t: "Contract" },
                    { n: "Insurance policy.pdf", s: "1.2 MB", t: "Insurance" },
                    { n: "Property deed.pdf", s: "780 KB", t: "Legal" },
                    { n: "Inventory checklist.pdf", s: "92 KB", t: "Operations" },
                  ].map((d) => (
                    <div key={d.n} className="flex items-center justify-between rounded-xl border border-border/50 bg-secondary/30 p-3 text-sm">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald/10 text-emerald"><FileText className="h-4 w-4" /></div>
                        <div>
                          <div className="font-semibold">{d.n}</div>
                          <div className="text-[10px] text-muted-foreground">{d.s} · {d.t}</div>
                        </div>
                      </div>
                      <button className="text-xs font-medium text-muted-foreground hover:text-foreground">Download</button>
                    </div>
                  ))}
                </div>
              </Card>
            )}

            {tab === "maintenance" && (
              <Card>
                <SectionTitle title="Maintenance history" action={<button className="text-xs font-semibold text-emerald hover:underline">+ New ticket</button>} />
                <div className="space-y-3">
                  {[
                    { d: "Nov 14, 2025", t: "HVAC service", c: "€180", s: "Completed" as const },
                    { d: "Oct 02, 2025", t: "Smart lock firmware", c: "€0", s: "Completed" as const },
                    { d: "Sep 08, 2025", t: "Bathroom regrouting", c: "€340", s: "Completed" as const },
                    { d: "Dec 20, 2025", t: "Annual deep clean", c: "€220", s: "Scheduled" as const },
                  ].map((m, i) => (
                    <div key={i} className="flex items-center justify-between rounded-xl border border-border/50 bg-secondary/30 p-3 text-sm">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-skyblue/10 text-skyblue"><Wrench className="h-4 w-4" /></div>
                        <div>
                          <div className="font-semibold">{m.t}</div>
                          <div className="text-[10px] text-muted-foreground">{m.d} · {m.c}</div>
                        </div>
                      </div>
                      <Badge variant={m.s === "Completed" ? "emerald" : "blue"}>{m.s}</Badge>
                    </div>
                  ))}
                </div>
              </Card>
            )}

            {tab === "smart devices" && (
              <Card>
                <SectionTitle title="Smart devices" action={<button className="text-xs font-semibold text-emerald hover:underline">+ Pair device</button>} />
                <div className="grid gap-3 sm:grid-cols-2">
                  {[
                    { i: Lock, l: "Front door", v: "Locked", on: true },
                    { i: Thermometer, l: "Climate", v: "21°C", on: true },
                    { i: Lightbulb, l: "Living lights", v: "Off", on: false },
                    { i: Camera, l: "Entry camera", v: "Recording", on: true },
                  ].map((d) => (
                    <div key={d.l} className="rounded-2xl border border-border/50 bg-secondary/30 p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <d.i className="h-4 w-4 text-emerald" />
                          <span className="text-sm font-semibold">{d.l}</span>
                        </div>
                        <Badge variant={d.on ? "emerald" : "muted"}>{d.on ? "Online" : "Off"}</Badge>
                      </div>
                      <div className="mt-2 font-display text-lg font-bold">{d.v}</div>
                    </div>
                  ))}
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
          </div>
        </div>

        <div className="space-y-4">
          <Card>
            <div className="text-xs uppercase tracking-wide text-muted-foreground">This month</div>
            <div className="mt-2 font-display text-3xl font-bold">€{property.monthlyIncome.toLocaleString()}</div>
            <div className="text-xs text-emerald">+8.4% vs last month</div>
            <div className="mt-4 grid grid-cols-2 gap-3 border-t border-border/50 pt-4 text-center">
              <div>
                <div className="text-xs text-muted-foreground">ROI</div>
                <div className="font-display text-lg font-bold text-emerald">{property.roi}%</div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground">Occupancy</div>
                <div className="font-display text-lg font-bold">{property.occupancy}%</div>
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
            <SectionTitle title="AI insights" />
            <div className="space-y-2 text-xs">
              <div className="rounded-xl border border-emerald/20 bg-emerald/5 p-3">
                <div className="font-semibold text-emerald">Raise weekend rate by 8%</div>
                <div className="mt-1 text-muted-foreground">Demand surge detected for the next 21 days.</div>
              </div>
              <div className="rounded-xl border border-skyblue/20 bg-skyblue/5 p-3">
                <div className="font-semibold text-skyblue">Schedule deep clean</div>
                <div className="mt-1 text-muted-foreground">Last clean was 47 days ago.</div>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {showBook && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 animate-in fade-in" onClick={() => setShowBook(false)}>
          <div className="w-full max-w-md rounded-3xl bg-card p-6 shadow-elegant animate-in zoom-in-95" onClick={(e) => e.stopPropagation()}>
            <h3 className="font-display text-xl font-bold">Book {property.name}</h3>
            <p className="mt-1 text-sm text-muted-foreground">{property.price} / month</p>
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

      {show3d && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 animate-in fade-in" onClick={() => setShow3d(false)}>
          <div className="relative aspect-video w-full max-w-4xl overflow-hidden rounded-3xl bg-gradient-to-br from-emerald/40 via-skyblue/30 to-emerald-glow/40 shadow-elegant" onClick={(e) => e.stopPropagation()}>
            <div className="absolute inset-0 grid-bg opacity-40" />
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl glass-strong">
                <Box className="h-8 w-8 text-emerald" />
              </div>
              <div className="font-display text-xl font-bold">Immersive 3D tour</div>
              <div className="text-xs text-muted-foreground">Drag to look around · Click hotspots to teleport</div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
