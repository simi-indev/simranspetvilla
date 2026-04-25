import React from "react";
import { api, WHATSAPP_LINK } from "../lib/api";
import { MapPin, Phone, Mail, MessageCircle, Clock } from "lucide-react";
import { toast } from "sonner";

export default function ContactPage() {
  const [form, setForm] = React.useState({ name: "", phone: "", email: "", message: "" });
  const [loading, setLoading] = React.useState(false);

  const submit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.phone || !form.message) {
      toast.error("Please fill name, phone and message");
      return;
    }
    setLoading(true);
    try {
      await api.post("/contact", form);
      toast.success("Thanks! We'll get back within a few hours.");
      setForm({ name: "", phone: "", email: "", message: "" });
    } catch (e) {
      toast.error("Couldn't send message. Try WhatsApp instead.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="section-pad" data-testid="contact-page">
      <div className="container-pv">
        <div className="max-w-2xl mb-10">
          <span className="trust-badge mb-3">Get in touch</span>
          <h1 className="font-display font-black text-4xl md:text-[52px] text-brand-ink leading-tight">Visit, call, WhatsApp — whatever's easier for you.</h1>
        </div>

        <div className="grid md:grid-cols-5 gap-8">
          <div className="md:col-span-2 space-y-4">
            <div className="card-pv flex items-start gap-4" data-testid="contact-address">
              <div className="w-11 h-11 rounded-2xl bg-brand-sage flex items-center justify-center text-brand-primary shrink-0"><MapPin size={20} /></div>
              <div>
                <div className="font-display font-bold text-brand-ink">Visit the villa</div>
                <div className="text-brand-muted text-sm mt-0.5">Lohegaon, Pune — 411047 (Free pre-booking visit, by appointment)</div>
              </div>
            </div>
            <div className="card-pv flex items-start gap-4" data-testid="contact-phone">
              <div className="w-11 h-11 rounded-2xl bg-brand-sage flex items-center justify-center text-brand-primary shrink-0"><Phone size={20} /></div>
              <div>
                <div className="font-display font-bold text-brand-ink">Call us</div>
                <div className="text-brand-muted text-sm mt-0.5">+91 98765 43210 (9 AM – 9 PM)</div>
              </div>
            </div>
            <a href={WHATSAPP_LINK()} target="_blank" rel="noreferrer" className="card-pv flex items-start gap-4 hover:border-brand-primary" data-testid="contact-whatsapp">
              <div className="w-11 h-11 rounded-2xl bg-[#25D366] flex items-center justify-center text-white shrink-0"><MessageCircle size={20} /></div>
              <div>
                <div className="font-display font-bold text-brand-ink">Message on WhatsApp</div>
                <div className="text-brand-muted text-sm mt-0.5">Fastest way — replies in under 30 minutes</div>
              </div>
            </a>
            <div className="card-pv flex items-start gap-4" data-testid="contact-email">
              <div className="w-11 h-11 rounded-2xl bg-brand-sage flex items-center justify-center text-brand-primary shrink-0"><Mail size={20} /></div>
              <div>
                <div className="font-display font-bold text-brand-ink">Email</div>
                <div className="text-brand-muted text-sm mt-0.5">hello@simranspetvilla.com</div>
              </div>
            </div>
            <div className="card-pv flex items-start gap-4">
              <div className="w-11 h-11 rounded-2xl bg-brand-sage flex items-center justify-center text-brand-primary shrink-0"><Clock size={20} /></div>
              <div>
                <div className="font-display font-bold text-brand-ink">Hours</div>
                <div className="text-brand-muted text-sm mt-0.5">Mon–Sun · 9 AM – 9 PM (drop-off & pickup by appointment)</div>
              </div>
            </div>
          </div>

          <div className="md:col-span-3 card-pv">
            <h2 className="font-display font-black text-2xl md:text-3xl text-brand-ink">Send us a quick message</h2>
            <p className="text-brand-muted mt-1 text-sm">Or use WhatsApp for faster replies.</p>
            <form onSubmit={submit} className="mt-6 space-y-4" data-testid="contact-form">
              <Field label="Your Name" testid="contact-name">
                <input className="input-pv" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Anjali" data-testid="contact-name-input" />
              </Field>
              <div className="grid md:grid-cols-2 gap-4">
                <Field label="Phone (WhatsApp)" testid="contact-phone-field">
                  <input className="input-pv" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="+91 98765 43210" data-testid="contact-phone-input" />
                </Field>
                <Field label="Email (optional)" testid="contact-email-field">
                  <input type="email" className="input-pv" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="you@example.com" data-testid="contact-email-input" />
                </Field>
              </div>
              <Field label="How can we help?" testid="contact-message-field">
                <textarea rows={5} className="input-pv resize-none" value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} placeholder="Tell us about your pet, your dates, or any questions…" data-testid="contact-message-input" />
              </Field>
              <button type="submit" disabled={loading} className="btn-primary w-full md:w-auto" data-testid="contact-submit-btn">
                {loading ? "Sending…" : "Send Message"}
              </button>
            </form>
          </div>
        </div>

        <div className="mt-10 rounded-3xl overflow-hidden border border-brand-border h-[360px] shadow-soft">
          <iframe title="PetVilla Map" src="https://www.google.com/maps?q=Lohegaon%2C%20Pune&output=embed" className="w-full h-full" loading="lazy" />
        </div>
      </div>

      <style>{`
        .input-pv {
          width: 100%;
          padding: 12px 16px;
          background: #FAFAF8;
          border: 2px solid #E0E0D0;
          border-radius: 16px;
          font-family: 'Inter', sans-serif;
          font-size: 15px;
          color: #111;
          outline: none;
          transition: border-color .2s;
        }
        .input-pv:focus { border-color: #1B7B8A; background: #fff; }
      `}</style>
    </div>
  );
}

function Field({ label, children, testid }) {
  return (
    <label className="block" data-testid={testid}>
      <span className="block text-sm font-display font-bold text-brand-ink mb-1.5">{label}</span>
      {children}
    </label>
  );
}
