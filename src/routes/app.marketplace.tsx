import { createFileRoute } from "@tanstack/react-router";
import { Sparkles, Wrench, Truck, Palette, Shield, Sofa, Wifi, Camera, Star } from "lucide-react";
import { PageHeader, Card, Badge } from "@/components/app/ui";

export const Route = createFileRoute("/app/marketplace")({
  component: Marketplace,
});

const services = [
  { icon: Sparkles, name: "Cleaning", price: "From €45", count: 1240, rating: 4.9 },
  { icon: Wrench, name: "Repairs", price: "From €60", count: 890, rating: 4.8 },
  { icon: Truck, name: "Moving", price: "From €180", count: 320, rating: 4.7 },
  { icon: Palette, name: "Interior design", price: "From €450", count: 142, rating: 5.0 },
  { icon: Shield, name: "Insurance", price: "From €18/mo", count: 4200, rating: 4.9 },
  { icon: Sofa, name: "Furniture packages", price: "From €1,200", count: 86, rating: 4.8 },
  { icon: Wifi, name: "Internet setup", price: "From €40", count: 540, rating: 4.7 },
  { icon: Camera, name: "Photography", price: "From €120", count: 230, rating: 5.0 },
];

function Marketplace() {
  return (
    <>
      <PageHeader title="Marketplace" subtitle="Vetted local services available in 84 countries." />

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {services.map((s) => (
          <Card key={s.name} className="group cursor-pointer transition-all hover:-translate-y-1 hover:shadow-elegant">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald/15 to-skyblue/15">
              <s.icon className="h-5 w-5 text-emerald" />
            </div>
            <div className="mt-4 font-display text-base font-semibold">{s.name}</div>
            <div className="text-sm text-muted-foreground">{s.price}</div>
            <div className="mt-3 flex items-center justify-between border-t border-border/50 pt-3 text-xs">
              <span className="flex items-center gap-1"><Star className="h-3 w-3 fill-emerald text-emerald" />{s.rating}</span>
              <span className="text-muted-foreground">{s.count} pros</span>
            </div>
          </Card>
        ))}
      </div>

      <div className="mt-8 rounded-3xl border border-border bg-gradient-to-br from-emerald/10 to-skyblue/10 p-8">
        <div className="grid items-center gap-6 lg:grid-cols-2">
          <div>
            <Badge variant="emerald">New</Badge>
            <h3 className="mt-3 font-display text-2xl font-bold">Bundle multiple services</h3>
            <p className="mt-2 text-sm text-muted-foreground">Save up to 22% by combining cleaning, maintenance and inspection on a single contract.</p>
          </div>
          <div className="flex justify-end">
            <button className="rounded-full bg-foreground px-6 py-3 text-sm font-semibold text-background">Create bundle</button>
          </div>
        </div>
      </div>
    </>
  );
}
