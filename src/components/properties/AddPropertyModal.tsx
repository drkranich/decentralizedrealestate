import { useState } from "react";
import { X, Sparkles, Upload } from "lucide-react";
import { propertyTypes } from "@/data/properties";

type Props = { open: boolean; onClose: () => void };

export function AddPropertyModal({ open, onClose }: Props) {
  const [step, setStep] = useState(1);
  const [generating, setGenerating] = useState(false);
  const [form, setForm] = useState({
    title: "",
    description: "",
    type: "Short stay",
    address: "",
    lat: "",
    lng: "",
    nightly: "",
    monthly: "",
    minStay: "1",
    cleaningFee: "",
  });

  if (!open) return null;
  const set = (k: keyof typeof form, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const generateDescription = () => {
    setGenerating(true);
    setTimeout(() => {
      set("description", `${form.title || "This property"} offers a premium stay in a sought-after location. Stylish interiors, high-end finishes, and seamless smart-home integration. Ideal for both short stays and longer relocations.`);
      setGenerating(false);
    }, 900);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 animate-in fade-in" onClick={onClose}>
      <div className="w-full max-w-2xl rounded-3xl bg-card shadow-elegant animate-in zoom-in-95" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between border-b border-border px-6 py-4">
          <div>
            <h3 className="font-display text-xl font-bold">Add property</h3>
            <p className="text-xs text-muted-foreground">Step {step} of 3</p>
          </div>
          <button onClick={onClose} className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-secondary">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="max-h-[70vh] overflow-y-auto px-6 py-5">
          {step === 1 && (
            <div className="space-y-4">
              <Field label="Title">
                <input value={form.title} onChange={(e) => set("title", e.target.value)} placeholder="Príncipe Real Loft" className="input" />
              </Field>
              <Field label="Description">
                <div className="relative">
                  <textarea value={form.description} onChange={(e) => set("description", e.target.value)} rows={4} className="input resize-none pr-10" placeholder="Tell investors and tenants what makes this place special…" />
                  <button type="button" onClick={generateDescription} className="absolute right-2 top-2 flex items-center gap-1 rounded-full bg-gradient-to-r from-emerald to-emerald-glow px-2.5 py-1 text-[10px] font-semibold text-white shadow-glow">
                    <Sparkles className="h-3 w-3" /> {generating ? "Writing…" : "AI"}
                  </button>
                </div>
              </Field>
              <Field label="Property type">
                <div className="flex flex-wrap gap-2">
                  {propertyTypes.map((t) => (
                    <button key={t} type="button" onClick={() => set("type", t)} className={`rounded-full px-3.5 py-1.5 text-xs font-medium ${form.type === t ? "bg-foreground text-background" : "border border-border bg-secondary/40"}`}>{t}</button>
                  ))}
                </div>
              </Field>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <Field label="Address">
                <input value={form.address} onChange={(e) => set("address", e.target.value)} placeholder="Street, city, country" className="input" />
              </Field>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Latitude"><input value={form.lat} onChange={(e) => set("lat", e.target.value)} placeholder="38.7178" className="input" /></Field>
                <Field label="Longitude"><input value={form.lng} onChange={(e) => set("lng", e.target.value)} placeholder="-9.1486" className="input" /></Field>
              </div>
              <Field label="Photos & video">
                <div className="flex flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-border bg-secondary/30 px-6 py-8 text-center">
                  <Upload className="h-5 w-5 text-muted-foreground" />
                  <div className="text-sm font-medium">Drop files or click to upload</div>
                  <div className="text-xs text-muted-foreground">JPG, PNG, MP4 — up to 25 MB each</div>
                </div>
              </Field>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <Field label="Nightly rate"><input value={form.nightly} onChange={(e) => set("nightly", e.target.value)} placeholder="€145" className="input" /></Field>
                <Field label="Monthly rate"><input value={form.monthly} onChange={(e) => set("monthly", e.target.value)} placeholder="€2,450" className="input" /></Field>
                <Field label="Min stay (nights)"><input value={form.minStay} onChange={(e) => set("minStay", e.target.value)} className="input" /></Field>
                <Field label="Cleaning fee"><input value={form.cleaningFee} onChange={(e) => set("cleaningFee", e.target.value)} placeholder="€60" className="input" /></Field>
              </div>
              <div className="rounded-2xl border border-emerald/30 bg-gradient-to-br from-emerald/10 to-skyblue/10 p-4">
                <div className="flex items-center gap-2 text-xs font-semibold text-emerald"><Sparkles className="h-3.5 w-3.5" /> AI ROI estimate</div>
                <div className="mt-1 font-display text-2xl font-bold">14.6% / year</div>
                <div className="text-xs text-muted-foreground">Based on comparable listings in the area · 89% projected occupancy</div>
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between border-t border-border px-6 py-4">
          <button onClick={() => (step === 1 ? onClose() : setStep(step - 1))} className="rounded-full px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground">
            {step === 1 ? "Cancel" : "Back"}
          </button>
          <button
            onClick={() => (step < 3 ? setStep(step + 1) : onClose())}
            className="rounded-full bg-gradient-to-r from-emerald to-emerald-glow px-5 py-2 text-sm font-semibold text-white shadow-glow"
          >
            {step < 3 ? "Continue" : "Publish property"}
          </button>
        </div>
      </div>

      <style>{`.input{width:100%;border-radius:.875rem;border:1px solid var(--border);background:color-mix(in oklab, var(--secondary) 40%, transparent);padding:.625rem .75rem;font-size:.875rem;outline:none}.input:focus{border-color:var(--emerald)}`}</style>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-medium text-muted-foreground">{label}</span>
      {children}
    </label>
  );
}
