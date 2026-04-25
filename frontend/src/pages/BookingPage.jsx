import React from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import * as LucideIcons from "lucide-react";
import { api } from "../lib/api";
import { useBusinessInfo, buildWhatsAppLink } from "../lib/businessInfo";
import { Check, ArrowLeft, ArrowRight, Calendar, MessageCircle, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

const STEPS = ["Service", "Pet", "Dates", "Owner", "Review", "Done"];

export default function BookingPage() {
  const [params] = useSearchParams();
  const preselect = params.get("service");
  const navigate = useNavigate();
  const [services, setServices] = React.useState([]);
  const [step, setStep] = React.useState(0);
  const [data, setData] = React.useState({
    services: preselect ? [preselect] : [],
    pet: { name: "", species: "Dog", breed: "", age: "", weight: "", special_needs: "", vaccinated: true },
    start_date: "",
    end_date: "",
    time_slot: "",
    owner: { name: "", phone: "", email: "", locality: "", address: "", pickup_drop: false },
    notes: "",
  });
  const [submitting, setSubmitting] = React.useState(false);
  const [bookingResult, setBookingResult] = React.useState(null);

  React.useEffect(() => {
    api.get("/services").then((r) => setServices(r.data));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const selectedServices = services.filter((s) => data.services.includes(s.slug));
  const estimatedPrice = selectedServices.reduce((sum, s) => sum + s.starting_price, 0);

  const next = () => setStep((s) => Math.min(s + 1, STEPS.length - 1));
  const back = () => setStep((s) => Math.max(s - 1, 0));

  const validateStep = () => {
    if (step === 0 && data.services.length === 0) { toast.error("Pick at least one service"); return false; }
    if (step === 1 && (!data.pet.name || !data.pet.breed)) { toast.error("Pet name and breed required"); return false; }
    if (step === 2 && !data.start_date) { toast.error("Start date required"); return false; }
    if (step === 3 && (!data.owner.name || !data.owner.phone)) { toast.error("Your name and phone required"); return false; }
    return true;
  };

  const handleNext = () => { if (validateStep()) next(); };

  const submit = async () => {
    setSubmitting(true);
    try {
      const payload = { ...data, estimated_price: estimatedPrice };
      const res = await api.post("/bookings", payload);
      setBookingResult(res.data);
      setStep(5);
    } catch (e) {
      toast.error("Booking failed. Please try again or WhatsApp us.");
    } finally {
      setSubmitting(false);
    }
  };

  const toggleService = (slug) => {
    setData((d) => ({
      ...d,
      services: d.services.includes(slug) ? d.services.filter((s) => s !== slug) : [...d.services, slug],
    }));
  };

  return (
    <div className="section-pad bg-brand-bg min-h-[calc(100vh-80px)]" data-testid="booking-page">
      <div className="container-pv max-w-4xl">
        <div className="mb-6">
          <Link to="/" className="inline-flex items-center gap-1.5 text-sm text-brand-muted hover:text-brand-primary"><ArrowLeft size={14} /> Back to home</Link>
          <h1 className="font-display font-black text-3xl md:text-5xl text-brand-ink mt-3">Book a service</h1>
          <p className="text-brand-muted mt-2">Step {Math.min(step + 1, 5)} of 5 · We confirm everything on WhatsApp</p>
        </div>

        {/* Progress */}
        <div className="card-pv mb-6 flex flex-wrap gap-2" data-testid="booking-progress">
          {STEPS.slice(0, 5).map((label, i) => (
            <div key={label} className={`flex items-center gap-2 text-xs md:text-sm font-display font-bold px-3 py-2 rounded-full transition-colors ${i < step ? "bg-brand-sage text-brand-primary" : i === step ? "bg-brand-primary text-white" : "bg-brand-bg text-brand-muted"}`}>
              <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${i < step ? "bg-brand-primary text-white" : i === step ? "bg-white text-brand-primary" : "bg-brand-border text-brand-muted"}`}>
                {i < step ? <Check size={12} strokeWidth={3} /> : i + 1}
              </span>
              {label}
            </div>
          ))}
        </div>

        {/* Steps */}
        <div className="card-pv">
          {step === 0 && (
            <Step1Service services={services} selected={data.services} toggle={toggleService} />
          )}
          {step === 1 && (
            <Step2Pet pet={data.pet} setPet={(pet) => setData({ ...data, pet })} />
          )}
          {step === 2 && (
            <Step3Dates data={data} setData={setData} hasBoarding={data.services.includes("pet-boarding")} hasDaycare={data.services.includes("pet-daycare")} />
          )}
          {step === 3 && (
            <Step4Owner owner={data.owner} setOwner={(owner) => setData({ ...data, owner })} notes={data.notes} setNotes={(notes) => setData({ ...data, notes })} />
          )}
          {step === 4 && (
            <Step5Review data={data} services={selectedServices} estimatedPrice={estimatedPrice} />
          )}
          {step === 5 && bookingResult && (
            <Step6Done booking={bookingResult} />
          )}
        </div>

        {/* Actions */}
        {step < 5 && (
          <div className="mt-6 flex flex-col-reverse md:flex-row md:justify-between gap-3">
            <button onClick={back} disabled={step === 0} className="btn-outline disabled:opacity-30 disabled:cursor-not-allowed" data-testid="booking-back-btn">
              <ArrowLeft size={16} /> Back
            </button>
            {step < 4 ? (
              <button onClick={handleNext} className="btn-primary" data-testid="booking-next-btn">
                Continue <ArrowRight size={16} />
              </button>
            ) : (
              <button onClick={submit} disabled={submitting} className="btn-primary" data-testid="booking-submit-btn">
                {submitting ? "Booking…" : "Confirm Booking"} <Check size={16} />
              </button>
            )}
          </div>
        )}
      </div>

      <style>{`
        .input-pv {
          width: 100%; padding: 12px 16px; background: #FAFAF8; border: 2px solid #E0E0D0;
          border-radius: 16px; font-family: 'Inter', sans-serif; font-size: 15px; color: #111;
          outline: none; transition: border-color .2s;
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

function Step1Service({ services, selected, toggle }) {
  return (
    <div data-testid="booking-step-service">
      <h2 className="font-display font-black text-2xl text-brand-ink mb-1">Which services do you need?</h2>
      <p className="text-brand-muted text-sm mb-6">Pick one or combine multiple. Combo bookings get a 10% discount.</p>
      <div className="grid sm:grid-cols-2 gap-3">
        {services.map((s) => {
          const Icon = LucideIcons[s.icon] || LucideIcons.PawPrint;
          const isSelected = selected.includes(s.slug);
          return (
            <button
              key={s.slug}
              onClick={() => toggle(s.slug)}
              className={`text-left p-4 rounded-2xl border-2 transition-all flex items-start gap-3 ${isSelected ? "border-brand-primary bg-brand-sage/40" : "border-brand-border bg-brand-bg hover:border-brand-primary/50"}`}
              data-testid={`service-select-${s.slug}`}
            >
              <div className={`w-11 h-11 shrink-0 rounded-2xl flex items-center justify-center ${isSelected ? "bg-brand-primary text-white" : "bg-white text-brand-primary"}`}>
                <Icon size={22} />
              </div>
              <div className="flex-1">
                <div className="font-display font-extrabold text-brand-ink">{s.name}</div>
                <div className="text-xs text-brand-muted mt-0.5">From ₹{s.starting_price}/{s.unit}</div>
              </div>
              {isSelected && <Check size={18} className="text-brand-primary mt-1" strokeWidth={3} />}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function Step2Pet({ pet, setPet }) {
  return (
    <div data-testid="booking-step-pet">
      <h2 className="font-display font-black text-2xl text-brand-ink mb-1">Tell us about your pet</h2>
      <p className="text-brand-muted text-sm mb-6">So we can plan their stay perfectly.</p>
      <div className="grid md:grid-cols-2 gap-4">
        <Field label="Pet's Name" testid="pet-name-field">
          <input className="input-pv" value={pet.name} onChange={(e) => setPet({ ...pet, name: e.target.value })} placeholder="Bruno" data-testid="pet-name-input" />
        </Field>
        <Field label="Species" testid="pet-species-field">
          <select className="input-pv" value={pet.species} onChange={(e) => setPet({ ...pet, species: e.target.value })} data-testid="pet-species-input">
            <option>Dog</option><option>Cat</option><option>Other</option>
          </select>
        </Field>
        <Field label="Breed" testid="pet-breed-field">
          <input className="input-pv" value={pet.breed} onChange={(e) => setPet({ ...pet, breed: e.target.value })} placeholder="Labrador, Indie, Persian…" data-testid="pet-breed-input" />
        </Field>
        <Field label="Age" testid="pet-age-field">
          <input className="input-pv" value={pet.age} onChange={(e) => setPet({ ...pet, age: e.target.value })} placeholder="2 years" data-testid="pet-age-input" />
        </Field>
        <Field label="Weight (kg)" testid="pet-weight-field">
          <input className="input-pv" value={pet.weight} onChange={(e) => setPet({ ...pet, weight: e.target.value })} placeholder="12 kg" data-testid="pet-weight-input" />
        </Field>
        <Field label="Vaccinated?" testid="pet-vaccinated-field">
          <select className="input-pv" value={pet.vaccinated ? "yes" : "no"} onChange={(e) => setPet({ ...pet, vaccinated: e.target.value === "yes" })} data-testid="pet-vaccinated-input">
            <option value="yes">Yes — current</option>
            <option value="no">Not yet</option>
          </select>
        </Field>
      </div>
      <Field label="Special needs / allergies / medications" testid="pet-special-field">
        <textarea rows={3} className="input-pv resize-none mt-4" value={pet.special_needs} onChange={(e) => setPet({ ...pet, special_needs: e.target.value })} placeholder="e.g. allergic to chicken, nervous around big dogs, on twice-daily ear drops" data-testid="pet-special-input" />
      </Field>
    </div>
  );
}

function Step3Dates({ data, setData, hasBoarding, hasDaycare }) {
  return (
    <div data-testid="booking-step-dates">
      <h2 className="font-display font-black text-2xl text-brand-ink mb-1">When?</h2>
      <p className="text-brand-muted text-sm mb-6">Pick your dates and time.</p>
      <div className="grid md:grid-cols-2 gap-4">
        <Field label={hasBoarding ? "Check-in date" : "Service date"} testid="start-date-field">
          <input type="date" className="input-pv" value={data.start_date} onChange={(e) => setData({ ...data, start_date: e.target.value })} min={new Date().toISOString().split("T")[0]} data-testid="start-date-input" />
        </Field>
        {hasBoarding && (
          <Field label="Check-out date" testid="end-date-field">
            <input type="date" className="input-pv" value={data.end_date} onChange={(e) => setData({ ...data, end_date: e.target.value })} min={data.start_date || new Date().toISOString().split("T")[0]} data-testid="end-date-input" />
          </Field>
        )}
        {!hasBoarding && (
          <Field label="Preferred time slot" testid="time-slot-field">
            <select className="input-pv" value={data.time_slot} onChange={(e) => setData({ ...data, time_slot: e.target.value })} data-testid="time-slot-input">
              <option value="">Select a time</option>
              <option>Morning (9 AM – 12 PM)</option>
              <option>Afternoon (12 – 4 PM)</option>
              <option>Evening (4 – 8 PM)</option>
            </select>
          </Field>
        )}
      </div>
      {hasDaycare && !hasBoarding && (
        <p className="mt-4 text-sm text-brand-muted bg-brand-sage/40 p-3 rounded-xl">Daycare runs 8 AM to 8 PM. Drop and pickup are flexible by 30 minutes.</p>
      )}
    </div>
  );
}

function Step4Owner({ owner, setOwner, notes, setNotes }) {
  return (
    <div data-testid="booking-step-owner">
      <h2 className="font-display font-black text-2xl text-brand-ink mb-1">Your details</h2>
      <p className="text-brand-muted text-sm mb-6">So we can confirm on WhatsApp.</p>
      <div className="grid md:grid-cols-2 gap-4">
        <Field label="Your Name" testid="owner-name-field">
          <input className="input-pv" value={owner.name} onChange={(e) => setOwner({ ...owner, name: e.target.value })} placeholder="Anjali Mehta" data-testid="owner-name-input" />
        </Field>
        <Field label="WhatsApp Number" testid="owner-phone-field">
          <input className="input-pv" value={owner.phone} onChange={(e) => setOwner({ ...owner, phone: e.target.value })} placeholder="+91 98765 43210" data-testid="owner-phone-input" />
        </Field>
        <Field label="Email (optional)" testid="owner-email-field">
          <input type="email" className="input-pv" value={owner.email} onChange={(e) => setOwner({ ...owner, email: e.target.value })} placeholder="you@example.com" data-testid="owner-email-input" />
        </Field>
        <Field label="Locality" testid="owner-locality-field">
          <input className="input-pv" value={owner.locality} onChange={(e) => setOwner({ ...owner, locality: e.target.value })} placeholder="Viman Nagar, Kharadi…" data-testid="owner-locality-input" />
        </Field>
      </div>
      <Field label="Full Address (for home services / pickup)" testid="owner-address-field">
        <textarea rows={2} className="input-pv resize-none mt-4" value={owner.address} onChange={(e) => setOwner({ ...owner, address: e.target.value })} placeholder="Flat No, Society, Street, Landmark" data-testid="owner-address-input" />
      </Field>
      <label className="mt-4 flex items-center gap-3 cursor-pointer p-3 bg-brand-bg rounded-xl border-2 border-brand-border" data-testid="pickup-drop-field">
        <input type="checkbox" className="w-5 h-5 accent-brand-primary" checked={owner.pickup_drop} onChange={(e) => setOwner({ ...owner, pickup_drop: e.target.checked })} data-testid="pickup-drop-input" />
        <div>
          <div className="font-display font-bold text-brand-ink">I'd like pickup & drop</div>
          <div className="text-xs text-brand-muted">₹150–300 extra based on locality</div>
        </div>
      </label>
      <Field label="Anything else? (optional)" testid="notes-field">
        <textarea rows={3} className="input-pv resize-none mt-4" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Special requests, food preferences, vet contact…" data-testid="notes-input" />
      </Field>
    </div>
  );
}

function Step5Review({ data, services, estimatedPrice }) {
  return (
    <div data-testid="booking-step-review">
      <h2 className="font-display font-black text-2xl text-brand-ink mb-1">Looks good?</h2>
      <p className="text-brand-muted text-sm mb-6">Review and confirm. We'll WhatsApp you final pricing within 30 minutes.</p>
      <div className="space-y-4">
        <ReviewBlock title="Services">
          <div className="flex flex-wrap gap-2">
            {services.map((s) => (
              <span key={s.slug} className="trust-badge" data-testid={`review-service-${s.slug}`}>{s.name} · ₹{s.starting_price}/{s.unit}</span>
            ))}
          </div>
        </ReviewBlock>
        <ReviewBlock title="Pet">
          <div className="text-brand-ink"><strong>{data.pet.name}</strong> · {data.pet.species} · {data.pet.breed} · {data.pet.age} · {data.pet.weight} kg</div>
          <div className="text-sm text-brand-muted mt-1">Vaccinated: {data.pet.vaccinated ? "Yes" : "No"}</div>
          {data.pet.special_needs && <div className="text-sm text-brand-muted mt-1">Special: {data.pet.special_needs}</div>}
        </ReviewBlock>
        <ReviewBlock title="Dates">
          <div className="text-brand-ink">{data.start_date}{data.end_date ? ` → ${data.end_date}` : ""} {data.time_slot && `· ${data.time_slot}`}</div>
        </ReviewBlock>
        <ReviewBlock title="Contact">
          <div className="text-brand-ink"><strong>{data.owner.name}</strong> · {data.owner.phone}</div>
          {data.owner.email && <div className="text-sm text-brand-muted">{data.owner.email}</div>}
          {data.owner.locality && <div className="text-sm text-brand-muted">{data.owner.locality}</div>}
          {data.owner.pickup_drop && <div className="text-sm text-brand-secondary mt-1">+ Pickup & Drop</div>}
        </ReviewBlock>
        {data.notes && <ReviewBlock title="Notes"><div className="text-brand-ink">{data.notes}</div></ReviewBlock>}
        <div className="bg-brand-primary text-white rounded-2xl p-5 flex items-center justify-between" data-testid="review-price-summary">
          <div>
            <div className="text-sm opacity-90">Estimated starting price</div>
            <div className="font-display font-black text-3xl">₹{estimatedPrice}</div>
          </div>
          <div className="text-xs opacity-80 text-right max-w-[180px]">Final price confirmed on WhatsApp based on pet size, breed and dates.</div>
        </div>
        <p className="text-xs text-brand-muted text-center">By confirming you agree to our cancellation policy: full refund 48h+ before, 50% refund 24–48h, no refund &lt;24h.</p>
      </div>
    </div>
  );
}

function ReviewBlock({ title, children }) {
  return (
    <div className="bg-brand-bg border border-brand-border rounded-2xl p-4">
      <div className="text-xs font-display font-bold text-brand-primary uppercase tracking-wider mb-2">{title}</div>
      {children}
    </div>
  );
}

function Step6Done({ booking }) {
  const { info } = useBusinessInfo();
  const summaryMessage = `Hi! I just booked: ${booking.services.join(", ")} for ${booking.pet.name} on ${booking.start_date}. Booking ID: ${booking.id.slice(0, 8)}. Please confirm.`;
  return (
    <div className="text-center py-6" data-testid="booking-step-done">
      <div className="w-20 h-20 rounded-full bg-brand-sage flex items-center justify-center mx-auto mb-4">
        <CheckCircle2 size={40} className="text-brand-primary" />
      </div>
      <h2 className="font-display font-black text-3xl text-brand-ink mb-2">Booking received!</h2>
      <p className="text-brand-muted text-lg max-w-md mx-auto">We'll WhatsApp you within 30 minutes to confirm pricing, availability and next steps.</p>
      <div className="mt-6 inline-block bg-brand-bg border-2 border-brand-border rounded-2xl px-5 py-3 font-mono text-sm" data-testid="booking-id">
        Booking ID: <strong className="text-brand-primary">{booking.id.slice(0, 8).toUpperCase()}</strong>
      </div>
      <div className="mt-7 flex flex-wrap gap-3 justify-center">
        <a href={buildWhatsAppLink(info.whatsapp_number, summaryMessage)} target="_blank" rel="noreferrer" className="btn-primary" data-testid="done-whatsapp-btn">
          <MessageCircle size={18} /> Send to WhatsApp
        </a>
        <Link to="/" className="btn-outline" data-testid="done-home-btn">Back to home</Link>
      </div>
    </div>
  );
}
