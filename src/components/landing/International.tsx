import { CreditCard, DollarSign, Globe2, Languages } from "lucide-react";
import { usePublicContent } from "@/lib/siteContent";

const features = [
  { icon: Languages, title: "32 idiomas", desc: "Experiência localizada em toda a plataforma." },
  { icon: DollarSign, title: "48 moedas", desc: "Câmbio, pagamentos e carteiras multimoeda." },
  {
    icon: CreditCard,
    title: "Pagamentos globais",
    desc: "Cartões, transferências e trilhos locais por mercado.",
  },
  { icon: Globe2, title: "84 países", desc: "Operação adaptável a regras, KYC e tributos locais." },
];

const internationalDefaults = {
  badge: "Global por natureza",
  heading_prefix: "Construída para um mercado imobiliário",
  heading_emphasis: "sem fronteiras",
  heading_suffix: "",
  subheading:
    "De Lisboa a Tóquio, a Seravie Heritage conecta idioma, moeda, documentação e operação em uma mesma infraestrutura.",
};

export function International() {
  const c = usePublicContent("international", internationalDefaults);
  const headingSuffix = c.heading_suffix ? ` ${c.heading_suffix}` : "";

  return (
    <section className="py-24">
      <div className="mx-auto max-w-7xl px-4">
        <div className="rounded-[2rem] border border-border bg-foreground p-10 text-background md:p-16">
          <div className="grid gap-10 lg:grid-cols-2">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-background/15 px-4 py-1.5 text-xs font-medium">
                <Globe2 className="h-3.5 w-3.5 text-emerald" /> {c.badge}
              </div>
              <h2 className="mt-4 font-display text-4xl font-bold md:text-5xl">
                {c.heading_prefix} <span className="text-emerald">{c.heading_emphasis}</span>
                {headingSuffix}
              </h2>
              <p className="mt-4 max-w-md text-background/70">{c.subheading}</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {features.map((f) => (
                <div
                  key={f.title}
                  className="rounded-2xl border border-background/10 bg-background/5 p-5 backdrop-blur-sm"
                >
                  <f.icon className="h-5 w-5 text-emerald" />
                  <div className="mt-3 font-display text-base font-semibold">{f.title}</div>
                  <div className="mt-1 text-xs text-background/60">{f.desc}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
