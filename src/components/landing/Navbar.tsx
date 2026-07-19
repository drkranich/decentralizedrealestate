import { useEffect, useState } from "react";
import { Link, useLocation } from "@tanstack/react-router";
import { LogIn, Menu, Moon, Sun, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/brand/Logo";

export function Navbar() {
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [dark, setDark] = useState<boolean | null>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const stored = window.localStorage.getItem("seravie-theme");
    if (stored === "dark" || stored === "light") {
      setDark(stored === "dark");
      return;
    }
    setDark(window.matchMedia?.("(prefers-color-scheme: dark)").matches ?? false);
  }, []);

  useEffect(() => {
    if (dark === null) return;
    document.documentElement.classList.toggle("dark", dark);
    document.documentElement.style.colorScheme = dark ? "dark" : "light";
    window.localStorage.setItem("seravie-theme", dark ? "dark" : "light");
  }, [dark]);

  const links = [
    { label: "Plataforma", href: "/#platform" },
    { label: "Tokenização", href: "/#token" },
    { label: "Investimentos", href: "/#invest" },
    { label: "Infraestrutura", href: "/#infrastructure" },
    { label: "Internacional", href: "/#international" },
  ];

  const overHero = location.pathname === "/" && !scrolled;
  const shellTone = overHero ? "text-white" : "glass-strong shadow-soft text-foreground";
  const navLinkTone = !overHero
    ? "text-muted-foreground hover:bg-secondary hover:text-foreground"
    : "text-white/80 hover:bg-white/10 hover:text-white";
  const iconButtonTone = !overHero
    ? "text-muted-foreground hover:bg-secondary hover:text-foreground"
    : "text-white/80 hover:bg-white/10 hover:text-white";
  const ctaTone = !overHero
    ? "hidden rounded-full bg-foreground text-background hover:bg-foreground/90 md:inline-flex"
    : "hidden rounded-full bg-white text-[#111510] hover:bg-white/90 md:inline-flex";
  const darkEnabled = dark ?? false;

  return (
    <header
      className={`fixed top-0 z-50 w-full transition-all duration-500 ${scrolled ? "py-3" : "py-5"}`}
    >
      <div className="mx-auto max-w-7xl px-4">
        <div
          className={`flex items-center justify-between rounded-full px-5 py-2.5 transition-all duration-500 ${shellTone}`}
        >
          <Link to="/">
            <Logo />
          </Link>

          <nav className="hidden items-center gap-1 md:flex">
            {links.map((l) => (
              <a
                key={l.href}
                href={l.href}
                className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${navLinkTone}`}
              >
                {l.label}
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setDark((value) => !(value ?? false))}
              className={`hidden h-9 w-9 items-center justify-center rounded-full transition-colors md:flex ${iconButtonTone}`}
              aria-label={darkEnabled ? "Ativar tema claro" : "Ativar tema escuro"}
              title={darkEnabled ? "Ativar tema claro" : "Ativar tema escuro"}
            >
              {darkEnabled ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>
            <Button asChild size="sm" className={ctaTone}>
              <Link to="/login">
                <LogIn className="h-4 w-4" />
                Entrar
              </Link>
            </Button>
            <button
              onClick={() => setOpen(!open)}
              className={`flex h-9 w-9 items-center justify-center rounded-full transition-colors md:hidden ${iconButtonTone}`}
              aria-label="Menu"
            >
              {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {open && (
          <div className="mt-2 rounded-3xl glass-strong p-4 md:hidden animate-in fade-in slide-in-from-top-2">
            <div className="flex flex-col gap-1">
              {links.map((l) => (
                <a
                  key={l.href}
                  href={l.href}
                  onClick={() => setOpen(false)}
                  className="rounded-xl px-4 py-3 text-sm font-medium hover:bg-secondary"
                >
                  {l.label}
                </a>
              ))}
              <button
                type="button"
                onClick={() => setDark((value) => !(value ?? false))}
                className="flex items-center gap-2 rounded-xl px-4 py-3 text-sm font-medium hover:bg-secondary"
              >
                {darkEnabled ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                {darkEnabled ? "Tema claro" : "Tema escuro"}
              </button>
              <Button asChild className="mt-2 rounded-full">
                <Link to="/login" onClick={() => setOpen(false)}>
                  Entrar
                </Link>
              </Button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
