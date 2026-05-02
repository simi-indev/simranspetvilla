import React from "react";
import { PawPrint } from "lucide-react";
import { Check } from "lucide-react";

export default function StepService({ services, selected, toggle }) {
  return (
    <div data-testid="booking-step-service">
      <h2 className="font-display font-black text-2xl text-brand-ink mb-1">Which services do you need?</h2>
      <p className="text-brand-muted text-sm mb-6">Pick one or combine. Combo bookings welcome.</p>
      <div className="grid sm:grid-cols-2 gap-3">
        {services.map((s) => {
          const Icon = LucideIcons[s.icon] || PawPrint;
          const on = selected.includes(s.slug);
          return (
            <button key={s.slug} onClick={() => toggle(s.slug)} data-testid={`service-select-${s.slug}`}
              className={`text-left p-4 rounded-2xl border-2 transition-all flex items-start gap-3 ${on ? "border-brand-primary bg-brand-sage/40" : "border-brand-border bg-brand-bg hover:border-brand-primary/50"}`}>
              <div className={`w-11 h-11 shrink-0 rounded-2xl flex items-center justify-center ${on ? "bg-brand-primary text-white" : "bg-white text-brand-primary"}`}>
                <Icon size={22} />
              </div>
              <div className="flex-1">
                <div className="font-display font-extrabold text-brand-ink">{s.name}</div>
                <div className="text-xs text-brand-muted mt-0.5">{s.tagline}</div>
              </div>
              {on && <Check size={18} className="text-brand-primary mt-1" strokeWidth={3} />}
            </button>
          );
        })}
      </div>
    </div>
  );
}
