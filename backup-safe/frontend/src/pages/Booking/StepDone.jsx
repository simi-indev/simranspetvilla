import React from "react";
import { Link } from "react-router-dom";
import { CheckCircle2, MessageCircle } from "lucide-react";
import { useBusinessInfo, buildWhatsAppLink } from "../../lib/businessInfo";

export default function StepDone({ booking, paymentType, quote }) {
  const { info } = useBusinessInfo();
  const amount = paymentType === "100%" ? quote.pay100 : quote.pay50;
  const msg = `Hi! I just booked: ${booking.services.join(", ")} for ${booking.pet?.name} on ${booking.start_date}. ID: ${booking.id.slice(0, 8)}. Amount: ₹${amount} (${paymentType}). Please confirm.`;

  return (
    <div className="text-center py-6" data-testid="booking-step-done">
      <div className="w-20 h-20 rounded-full bg-brand-sage flex items-center justify-center mx-auto mb-4">
        <CheckCircle2 size={40} className="text-brand-primary" />
      </div>
      <h2 className="font-display font-black text-3xl text-brand-ink mb-2">Booking received!</h2>
      <p className="text-brand-muted text-lg max-w-md mx-auto">We'll WhatsApp you within 30 minutes to confirm and share payment details.</p>
      <div className="mt-4 inline-block bg-brand-bg border-2 border-brand-border rounded-2xl px-5 py-3 font-mono text-sm" data-testid="booking-id">
        Booking ID: <strong className="text-brand-primary">{booking.id.slice(0, 8).toUpperCase()}</strong>
      </div>
      <div className="mt-2 text-sm text-brand-muted">
        Amount: <strong className="text-brand-ink">₹{amount.toLocaleString("en-IN")}</strong> ({paymentType})
      </div>
      <div className="mt-6 flex flex-wrap gap-3 justify-center">
        <a href={buildWhatsAppLink(info.whatsapp_number, msg)} target="_blank" rel="noreferrer" className="btn-primary" data-testid="done-whatsapp">
          <MessageCircle size={18} /> Send to WhatsApp
        </a>
        <Link to="/" className="btn-outline" data-testid="done-home">Back to home</Link>
      </div>
    </div>
  );
}
