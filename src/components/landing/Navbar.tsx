import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { LogIn, Menu, Moon, Sun, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/brand/Logo";

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
    { label: "Plataforma", href: "/#platform" },
    { label: "Tokenizacao", href: "/#token" },
    { label: "Investimentos", href: "/#invest" },
    { label: "Infraestrutura", href: "/#infrastructure" },
    { label: "Internacional", href: "/#international" },
  ];

  const shellTone = scrolled ? "glass-strong shadow-soft text-foreground" : "text-white";
  const navLinkTone = scrolled
    ? "text-muted-foreground hover:bg-secondary hover:text-foreground"
    : "text-white/80 hover:bg-white/10 hover:text-white";
  const iconButtonTone = scrolled
    ? "text-muted-foreground hover:bg-secondary hover:text-foreground"
    : "text-white/80 hover:bg-white/10 hover:text-white";
  const ctaTone = scrolled
    ? "hidden rounded-full bg-foreground text-background hover:bg-foreground/90 md:inline-flex"
    : "hidden rounded-full bg-white text-[#111510] hover:bg-white/90 md:inline-flex";

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
              onClick={() => setDark(!dark)}
              className={`hidden h-9 w-9 items-center justify-center rounded-full transition-colors md:flex ${iconButtonTone}`}
              aria-label="Toggle theme"
            >
              {dark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
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
