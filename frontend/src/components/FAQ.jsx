import React from "react";
import { ChevronDown } from "lucide-react";

export default function FAQ({ items, testIdPrefix = "faq" }) {
  const [open, setOpen] = React.useState(0);
  return (
    <div className="space-y-3" data-testid={`${testIdPrefix}-list`}>
      {items.map((item, i) => {
        const isOpen = open === i;
        return (
          <div
            key={item.q}
            className={`bg-white border rounded-3xl overflow-hidden transition-all ${isOpen ? "border-brand-primary shadow-soft" : "border-brand-border"}`}
            data-testid={`${testIdPrefix}-item-${i}`}
          >
            <button
              onClick={() => setOpen(isOpen ? -1 : i)}
              className="w-full text-left p-5 md:p-6 flex items-center justify-between gap-4 hover:bg-brand-sage/30 transition-colors"
              data-testid={`${testIdPrefix}-toggle-${i}`}
            >
              <span className="font-display font-bold text-brand-ink text-base md:text-lg">{item.q}</span>
              <ChevronDown size={20} className={`shrink-0 text-brand-primary transition-transform ${isOpen ? "rotate-180" : ""}`} />
            </button>
            {isOpen && (
              <div className="px-5 pb-5 md:px-6 md:pb-6 text-brand-muted leading-relaxed text-[15px]">{item.a}</div>
            )}
          </div>
        );
      })}
    </div>
  );
}
