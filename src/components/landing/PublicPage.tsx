import { type ReactNode } from "react";
import { Navbar } from "@/components/landing/Navbar";
import { Footer } from "@/components/landing/Footer";

export function PublicPage({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
}) {
  return (
    <div className="seravie-public min-h-screen overflow-x-hidden bg-background text-foreground">
      <Navbar />
      <main className="mx-auto max-w-3xl px-4 pt-32 pb-20">
        <h1 className="font-display text-4xl font-bold tracking-normal md:text-5xl">{title}</h1>
        {subtitle && <p className="mt-3 text-lg text-muted-foreground">{subtitle}</p>}
        <div className="mt-10 space-y-6 text-sm leading-relaxed text-foreground/90 [&_h2]:font-display [&_h2]:mt-10 [&_h2]:mb-2 [&_h2]:text-xl [&_h2]:font-semibold [&_h2]:text-foreground [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:space-y-1.5 [&_li]:marker:text-emerald [&_a]:text-emerald [&_a]:underline [&_a]:underline-offset-2">
          {children}
        </div>
      </main>
      <Footer />
    </div>
  );
}
