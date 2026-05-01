import React from "react";
import { X } from "lucide-react";
import { toast } from "sonner";

export const TERMS = [
  { h: "1. Booking & Payment", t: "50% advance confirms booking. Remaining 50% on service day. Pay 100% upfront and get 2% off." },
  { h: "2. Cancellation", t: "48h+: Full refund minus ₹100 fee. 24-48h: 70% refund, 30% retained. Under 24h/no-show: Case-by-case. Early pickup from boarding: No refund for unused nights." },
  { h: "3. Vaccinations", t: "Dogs: DHPPiL + Rabies. Cats: FVRCP + Rabies. Certificates required before or at service." },
  { h: "4. Safety", t: "Aggressive pets will be refused. Cage-free environment — minor scratches possible." },
  { h: "5. Vet Emergencies", t: "All veterinary costs during care are the owner's responsibility." },
  { h: "6. Liability", t: "Simran's PetVilla (Navpreet Kaur Gill, Proprietor) is not liable except in proven gross negligence." },
  { h: "7. Pet Sitters", t: "Pet sitters may vary during multi-day assignments. Only experienced, verified sitters are assigned. Sitter details confirmed on WhatsApp after booking." },
  { h: "8. Photo Consent", t: "By booking, you allow us to photograph/video your pet for updates and marketing." },
  { h: "9. Data", t: "We collect your details solely for service delivery. We do not sell your data." },
];

export default function StepReview({ data, setData, quote }) {
  const [showTerms, setShowTerms] = React.useState(false);

  return (
    <div data-testid="booking-step-review">
      <h2 className="font-display font-black text-2xl text-brand-ink mb-1">Review & Pay</h2>
      <p className="text-brand-muted text-sm mb-6">Check everything. We'll confirm on WhatsApp.</p>
      <div className="space-y-4">

        <div className="bg-white border border-brand-border rounded-2xl overflow-hidden" data-testid="quote-breakdown">
          <div className="bg-brand-bg px-4 py-3 border-b border-brand-border">
            <span className="font-display font-bold text-sm text-brand-ink uppercase tracking-wider">Price Breakdown</span>
          </div>
          <div className="p-4 space-y-2">
            {quote.lines.map((line, i) => (
              <div key={i} className="flex justify-between text-sm">
                <span className="text-brand-ink">{line.label}</span>
                <span className="font-semibold text-brand-ink">₹{line.amount.toLocaleString("en-IN")}</span>
              </div>
            ))}
            {quote.multiPetDiscount > 0 && (
              <div className="flex justify-between text-sm text-green-600 font-bold">
                <span>Multi-pet discount (10%)</span>
                <span>−₹{quote.multiPetDiscount.toLocaleString("en-IN")}</span>
              </div>
            )}
            {quote.adminDiscount > 0 && (
              <div className="flex justify-between text-sm text-green-600 font-bold">
                <span>Discount ({data.options.discountPercent}%)</span>
                <span>−₹{quote.adminDiscount.toLocaleString("en-IN")}</span>
              </div>
            )}
            <div className="flex justify-between text-base font-display font-black pt-2 border-t border-brand-border">
              <span>Total</span>
              <span className="text-brand-primary">₹{quote.afterDiscounts.toLocaleString("en-IN")}</span>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <span className="block text-sm font-display font-bold text-brand-ink">Payment</span>
          <div className="grid grid-cols-2 gap-3">
            <button type="button" onClick={() => setData({ ...data, paymentType: "50%" })} data-testid="pay-50"
              className={`p-4 rounded-2xl border-2 text-left transition-all ${data.paymentType === "50%" ? "border-brand-primary bg-brand-sage/40" : "border-brand-border hover:border-brand-primary/50"}`}>
              <div className="font-display font-bold text-brand-ink">Pay 50% now</div>
              <div className="text-xl font-display font-black text-brand-primary">₹{quote.pay50.toLocaleString("en-IN")}</div>
              <div className="text-xs text-brand-muted">Remaining on service day</div>
            </button>
            <button type="button" onClick={() => setData({ ...data, paymentType: "100%" })} data-testid="pay-100"
              className={`p-4 rounded-2xl border-2 text-left transition-all relative ${data.paymentType === "100%" ? "border-brand-primary bg-brand-sage/40" : "border-brand-border hover:border-brand-primary/50"}`}>
              <div className="absolute -top-2 -right-2 bg-brand-secondary text-white text-[10px] font-bold px-2 py-0.5 rounded-full">2% OFF</div>
              <div className="font-display font-bold text-brand-ink">Pay 100% now</div>
              <div className="text-xl font-display font-black text-brand-primary">₹{quote.pay100.toLocaleString("en-IN")}</div>
              <div className="text-xs text-brand-muted">Save ₹{quote.fullPayDiscount.toLocaleString("en-IN")}</div>
            </button>
          </div>
        </div>

        <div>
          <span className="block text-sm font-display font-bold text-brand-ink mb-1.5">Have a discount code?</span>
          <div className="flex gap-2">
            <input className="input-pv flex-1" value={data.options.discountCode}
              onChange={(e) => setData({ ...data, options: { ...data.options, discountCode: e.target.value } })}
              placeholder="Enter code" data-testid="discount-code" />
            <button type="button" onClick={() => {
              const codes = { WELCOME10: 10, FRIEND15: 15, PETVILLA20: 20 };
              const pct = codes[data.options.discountCode.toUpperCase()];
              if (pct) {
                setData({ ...data, options: { ...data.options, discountPercent: pct } });
                toast.success(`${pct}% discount applied!`);
              } else {
                toast.error("Invalid discount code");
                setData({ ...data, options: { ...data.options, discountPercent: 0 } });
              }
            }} className="px-4 py-2 bg-brand-primary text-white rounded-xl font-display font-bold text-sm hover:bg-brand-primary-hover" data-testid="apply-discount">
              Apply
            </button>
          </div>
        </div>

        <label className="flex items-start gap-3 cursor-pointer p-4 bg-brand-bg border-2 border-brand-border rounded-2xl hover:border-brand-primary/50" data-testid="terms-wrap">
          <input type="checkbox" className="w-5 h-5 accent-brand-primary mt-0.5" checked={data.termsAccepted}
            onChange={(e) => setData({ ...data, termsAccepted: e.target.checked })} data-testid="terms-checkbox" />
          <div className="text-sm text-brand-ink leading-relaxed">
            I have read and agree to the{" "}
            <button type="button" onClick={(e) => { e.preventDefault(); setShowTerms(true); }} className="text-brand-primary font-bold underline" data-testid="read-terms">
              Terms & Conditions
            </button>
            .
          </div>
        </label>

        
      </div>

      {showTerms && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" data-testid="terms-modal">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowTerms(false)} />
          <div className="relative bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[80vh] flex flex-col overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-brand-border">
              <h3 className="font-display font-black text-lg text-brand-ink">Terms & Conditions</h3>
              <button onClick={() => setShowTerms(false)} className="p-2 hover:bg-brand-bg rounded-xl" data-testid="close-terms">
                <X size={20} />
              </button>
            </div>
            <div className="overflow-y-auto px-6 py-5 space-y-4 flex-1">
              <p className="text-xs text-brand-muted">
                <strong>Simran's PetVilla</strong> — Navpreet Kaur Gill, Proprietor · Lohegaon, Pune 411047
              </p>
              {TERMS.map((s, i) => (
                <div key={i}>
                  <h4 className="font-display font-bold text-brand-ink mb-1">{s.h}</h4>
                  <p className="text-sm text-brand-muted leading-relaxed">{s.t}</p>
                </div>
              ))}
            </div>
            <div className="px-6 py-4 border-t border-brand-border">
              <button onClick={() => { setData((p) => ({ ...p, termsAccepted: true })); setShowTerms(false); }}
                className="w-full py-3 bg-brand-primary text-white rounded-full font-display font-bold hover:bg-brand-primary-hover" data-testid="accept-terms">
                I Accept — Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
