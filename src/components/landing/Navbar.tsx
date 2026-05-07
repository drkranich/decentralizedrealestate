import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Building2, Moon, Sun, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [dark, setDark] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
  }, [dark]);

  const links = [
    { label: "Properties", href: "#properties" },
    { label: "Invest", href: "#invest" },
    { label: "Manage", href: "#manage" },
    { label: "Marketplace", href: "#marketplace" },
    { label: "AI", href: "#ai" },
  ];

  return (
    <header className={`fixed top-0 z-50 w-full transition-all duration-500 ${scrolled ? "py-3" : "py-5"}`}>
      <div className="mx-auto max-w-7xl px-4">
        <div className={`flex items-center justify-between rounded-full px-5 py-2.5 transition-all duration-500 ${scrolled ? "glass-strong shadow-soft" : ""}`}>
          <Link to="/" className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-emerald to-skyblue shadow-glow">
              <Building2 className="h-5 w-5 text-white" />
            </div>
            <span className="font-display text-lg font-bold tracking-tight">Property<span className="gradient-text">OS</span></span>
          </Link>

          <nav className="hidden items-center gap-1 md:flex">
            {links.map((l) => (
              <a key={l.href} href={l.href} className="rounded-full px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground">
                {l.label}
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setDark(!dark)}
              className="hidden h-9 w-9 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground md:flex"
              aria-label="Toggle theme"
            >
              {dark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>
            <Button asChild size="sm" className="hidden rounded-full bg-foreground text-background hover:bg-foreground/90 md:inline-flex">
              <a href="#cta">Get Started</a>
            </Button>
            <button onClick={() => setOpen(!open)} className="flex h-9 w-9 items-center justify-center rounded-full hover:bg-secondary md:hidden" aria-label="Menu">
              {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {open && (
          <div className="mt-2 rounded-3xl glass-strong p-4 md:hidden animate-in fade-in slide-in-from-top-2">
            <div className="flex flex-col gap-1">
              {links.map((l) => (
                <a key={l.href} href={l.href} onClick={() => setOpen(false)} className="rounded-xl px-4 py-3 text-sm font-medium hover:bg-secondary">
                  {l.label}
                </a>
              ))}
              <Button asChild className="mt-2 rounded-full">
                <a href="#cta" onClick={() => setOpen(false)}>Get Started</a>
              </Button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
