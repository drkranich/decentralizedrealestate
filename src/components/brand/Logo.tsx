import * as Icons from "lucide-react";
import { useBrand } from "./BrandProvider";
import { cn } from "@/lib/utils";

type Size = "sm" | "md" | "lg";
const sizeMap: Record<Size, { box: string; icon: string }> = {
  sm: { box: "h-8 w-8 rounded-lg", icon: "h-4 w-4" },
  md: { box: "h-9 w-9 rounded-xl", icon: "h-5 w-5" },
  lg: { box: "h-12 w-12 rounded-2xl", icon: "h-6 w-6" },
};

export function LogoMark({ size = "md", className, glow = true }: { size?: Size; className?: string; glow?: boolean }) {
  const brand = useBrand();
  const s = sizeMap[size];
  const Icon = (Icons as any)[brand.logo.icon] ?? Icons.Sparkles;

  if (brand.logo.src) {
    return <img src={brand.logo.src} alt={brand.name} className={cn(s.box, "object-cover", className)} />;
  }
  return (
    <div
      className={cn(
        s.box,
        "flex items-center justify-center bg-primary text-primary-foreground",
        glow && "shadow-glow",
        className
      )}
    >
      <Icon className={cn(s.icon, "text-white")} />
    </div>
  );
}

export function BrandName({ className }: { className?: string }) {
  const brand = useBrand();
  if (brand.nameParts) {
    return (
      <span className={cn("font-display font-bold tracking-tight", className)}>
        {brand.nameParts.plain}
        <span className="text-emerald">{brand.nameParts.accent}</span>
      </span>
    );
  }
  return <span className={cn("font-display font-bold tracking-tight", className)}>{brand.name}</span>;
}

export function Logo({ size = "md", className }: { size?: Size; className?: string }) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <LogoMark size={size} />
      <BrandName className="text-lg" />
    </div>
  );
}
