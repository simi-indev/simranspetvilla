import React from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import * as LucideIcons from "lucide-react";
import { api } from "../lib/api";
import { useBusinessInfo, buildWhatsAppLink } from "../lib/businessInfo";
import { Check, ArrowLeft, ArrowRight, Calendar, MessageCircle, CheckCircle2, X, Plus, Trash2, ShieldCheck, AlertTriangle, Percent, UserCheck } from "lucide-react";
import { toast } from "sonner";

/* ─────────── PRICING TABLE ─────────── */
const PRICING = {
  "pet-boarding": {
    "dog-small": 600, "dog-medium": 700, "dog-large": 750, "dog-giant": 800,
    cat: 500, bird: 500, rabbit: 300, turtle: 500,
    unit: "6-24hrs",
  },
  "pet-daycare": {
    "dog-small": 150, "dog-medium": 150, "dog-large": 150, "dog-giant": 150,
    cat: 100, bird: 100, rabbit: 100, turtle: 150,
    unit: "hr",
  },
  "home-grooming": {
    "dog-small": 1700, "dog-medium": 1700, "dog-large": 1700, "dog-giant": 1700,
    cat: 1700,
    unit: "session",
  },
  "pet-sitting": {
    hourly: 350,
    fullday: { dog: 1200, other: 1000 },
    multiday: { dog: 1500, other: 1200 },
  },
  "pet-food-delivery": { egg: 99, chicken: 149, fish: 179, lamb: 219, unit: "meal" },
  "pet-training": {
    "dog-small": 1500, "dog-medium": 1500, "dog-large": 1500, "dog-giant": 1500,
    unit: "session",
  },
};

const SITTING_MODES = [
  { value: "hourly", label: "A few hours", desc: "₹350/hr per pet · capped at day rate", icon: "⏱️" },
  { value: "fullday", label: "Full day", desc: "Morning to evening", icon: "☀️" },
  { value: "multiday", label: "Multiple days", desc: "Sitter stays with your pet", icon: "🗓️" },
];

const SPECIES = [
  { value: "Dog", label: "🐕 Dog" },
  { value: "Cat", label: "🐈 Cat" },
  { value: "Bird", label: "🐦 Bird" },
  { value: "Rabbit", label: "🐰 Rabbit" },
  { value: "Turtle", label: "🐢 Turtle" },
  { value: "Other", label: "🐾 Other" },
];

const DOG_SIZES = [
  { value: "small", label: "Small", desc: "Under 10 kg", examples: "Shih Tzu, Pom, Dachshund" },
  { value: "medium", label: "Medium", desc: "10–25 kg", examples: "Beagle, Cocker, Indie" },
  { value: "large", label: "Large", desc: "25–40 kg", examples: "Lab, Golden, GSD" },
  { value: "giant", label: "Giant", desc: "40 kg+", examples: "Great Dane, Saint Bernard, Rottweiler" },
];

const PROTEINS = [
  { value: "egg", label: "Egg + Paneer", price: 99, tag: "Budget" },
  { value: "chicken", label: "Chicken & Rice", price: 149, tag: "Popular" },
  { value: "fish", label: "Fish & Quinoa", price: 179, tag: "Skin & Coat" },
  { value: "lamb", label: "Lamb & Pumpkin", price: 219, tag: "Premium" },
];

const STEPS = ["Service", "Pets", "Dates", "Owner", "Review", "Done"];
const STATUS_PILL = (i, step) => i < step ? "bg-brand-sage text-brand-primary" : i === step ? "bg-brand-primary text-white" : "bg-brand-bg text-brand-muted";
const STATUS_BADGE = (i, step) => i < step ? "bg-brand-primary text-white" : i === step ? "bg-white text-brand-primary" : "bg-brand-border text-brand-muted";

/* ─────────── HELPERS ─────────── */
function priceKey(species, size) {
  if (species === "Dog") return `dog-${size || "medium"}`;
  return species.toLowerCase();
}

function getServicePrice(slug, species, size) {
  const table = PRICING[slug];
  if (!table) return 0;
  if (slug === "pet-food-delivery" || slug === "pet-sitting") return 0;
  const key = priceKey(species, size);
  return table[key] || 0;
}

function isServiceAvailable(slug, species) {
  if (slug === "pet-food-delivery") return ["Dog", "Cat"].includes(species);
  if (slug === "pet-training") return species === "Dog";
  if (slug === "home-grooming") return ["Dog", "Cat"].includes(species);
  if (slug === "pet-sitting") return true;
  const table = PRICING[slug];
  if (!table) return false;
  const key = priceKey(species, "medium");
  return table[key] !== undefined;
}

function getSittingCost(species, mode, hours, days) {
  const isDog = species === "Dog";
  if (mode === "hourly") {
    const hourlyTotal = hours * PRICING["pet-sitting"].hourly;
    const dayCap = isDog ? PRICING["pet-sitting"].multiday.dog : PRICING["pet-sitting"].multiday.other;
    return Math.min(hourlyTotal, dayCap);
  }
  if (mode === "fullday") {
    return (isDog ? PRICING["pet-sitting"].fullday.dog : PRICING["pet-sitting"].fullday.other) * (days || 1);
  }
  if (mode === "multiday") {
    return (isDog ? PRICING["pet-sitting"].multiday.dog : PRICING["pet-sitting"].multiday.other) * (days || 1);
  }
  return 0;
}

function validatePhone(phone) {
  const cleaned = phone.replace(/[\s\-\(\)]/g, "");
  const match = cleaned.match(/^(?:\+91|91)?(\d{10})$/);
  return match ? match[1] : null;
}

function diffDays(start, end) {
  if (!start || !end) return 1;
  const d = Math.ceil((new Date(end) - new Date(start)) / 86400000);
  return Math.max(d, 1);
}

function calculateQuote({ selectedServices, pets, dates, options }) {
  const lines = [];
  let subtotal = 0;

  pets.forEach((pet, pi) => {
    const label = pet.name || `Pet ${pi + 1}`;
    selectedServices.forEach((svc) => {
      if (!isServiceAvailable(svc.slug, pet.species)) return;

      if (svc.slug === "pet-food-delivery") {
        const protein = options.foodProtein || "chicken";
        const pp = PROTEINS.find((p) => p.value === protein);
        const mealsPerDay = options.mealsPerDay || 2;
        const days = dates.foodDays || 7;
        const cost = (pp?.price || 149) * mealsPerDay * days;
        lines.push({ label: `${label} — ${svc.name} (${pp?.label}, ${mealsPerDay}×/day, ${days} days)`, amount: cost });
        subtotal += cost;
      } else if (svc.slug === "pet-daycare") {
        const hours = dates.daycareHours || 4;
        const boardingRate = PRICING["pet-boarding"][priceKey(pet.species, pet.size)] || 600;
        const hourlyRate = PRICING["pet-daycare"][priceKey(pet.species, pet.size)] || 150;
        const dayCost = Math.min(hours * hourlyRate, boardingRate);
        const days = dates.daycareDays || 1;
        const cost = dayCost * days;
        const capped = hours * hourlyRate > boardingRate;
        lines.push({ label: `${label} — ${svc.name} (${hours}h × ${days}d${capped ? " · capped" : ""})`, amount: cost });
        subtotal += cost;
      } else if (svc.slug === "pet-boarding") {
        const nights = diffDays(dates.startDate, dates.endDate);
        const rate = getServicePrice(svc.slug, pet.species, pet.size);
        const cost = rate * nights;
        lines.push({ label: `${label} — ${svc.name} (₹${rate} × ${nights} night${nights > 1 ? "s" : ""})`, amount: cost });
        subtotal += cost;
      } else if (svc.slug === "pet-sitting") {
        const mode = dates.sittingMode || "hourly";
        const hours = dates.sittingHours || 3;
        const days = mode === "multiday" ? diffDays(dates.sittingStart, dates.sittingEnd) : (dates.sittingDays || 1);
        const cost = getSittingCost(pet.species, mode, hours, days);
        const isDog = pet.species === "Dog";
        const dayCap = isDog ? PRICING["pet-sitting"].multiday.dog : PRICING["pet-sitting"].multiday.other;
        const capped = mode === "hourly" && hours * PRICING["pet-sitting"].hourly > dayCap;
        const modeLabel = mode === "hourly" ? `${hours}h` : mode === "fullday" ? `${days} day${days > 1 ? "s" : ""}` : `${days} day${days > 1 ? "s" : ""} (live-in)`;
        lines.push({ label: `${label} — ${svc.name} (${modeLabel}${capped ? " · capped at day rate" : ""})`, amount: cost });
        subtotal += cost;
      } else if (svc.slug === "pet-training") {
        const sessions = dates.trainingSessions || 1;
        const rate = getServicePrice(svc.slug, pet.species, pet.size);
        const cost = rate * sessions;
        lines.push({ label: `${label} — ${svc.name} (${sessions} session${sessions > 1 ? "s" : ""})`, amount: cost });
        subtotal += cost;
      } else {
        const rate = getServicePrice(svc.slug, pet.species, pet.size);
        lines.push({ label: `${label} — ${svc.name}`, amount: rate });
        subtotal += rate;
      }
    });
  });

  let separateRoomCost = 0;
  if (options.separateRoom) {
    const nights = diffDays(dates.startDate, dates.endDate) || 1;
    separateRoomCost = 100 * nights;
    lines.push({ label: `Separate room (+₹100 × ${nights} night${nights > 1 ? "s" : ""})`, amount: separateRoomCost });
    subtotal += separateRoomCost;
  }

  let multiPetDiscount = 0;
  if (pets.length >= 2) multiPetDiscount = Math.round(subtotal * 0.1);
  const afterMultiPet = subtotal - multiPetDiscount;

  let adminDiscount = 0;
  if (options.discountPercent > 0) adminDiscount = Math.round(afterMultiPet * (options.discountPercent / 100));
  const afterDiscounts = afterMultiPet - adminDiscount;

  const fullPayDiscount = Math.round(afterDiscounts * 0.02);
  const pay50 = Math.round(afterDiscounts * 0.5);
  const pay100 = afterDiscounts - fullPayDiscount;

  return { lines, subtotal, separateRoomCost, multiPetDiscount, adminDiscount, afterDiscounts, fullPayDiscount, pay50, pay100 };
}

/* ─────────── TERMS ─────────── */
const TERMS = [
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

const newPet = () => ({
  id: Date.now(),
  name: "",
  species: "Dog",
  size: "medium",
  breed: "",
  age: "",
  weight: "",
  special_needs: "",
  vaccinated: true,
  vaccination_at_dropoff: false,
  vaccination_file: "",
  no_aggression: false,
});

/* ═══════════════════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════════════════ */
export default function BookingPage() {
  const [params] = useSearchParams();
  const preselect = params.get("service");
  const navigate = useNavigate();
  const { info } = useBusinessInfo();
  const [services, setServices] = React.useState([]);
  const [step, setStep] = React.useState(0);
  const [showSitterPopup, setShowSitterPopup] = React.useState(false);
  const [sitterAcknowledged, setSitterAcknowledged] = React.useState(false);
  const [data, setData] = React.useState({
    selectedSlugs: preselect ? [preselect] : [],
    pets: [newPet()],
    dates: {
      startDate: "", endDate: "", timeSlot: "",
      daycareHours: 4, daycareDays: 1,
      trainingSessions: 1,
      foodDays: 7, mealsPerDay: 2,
      sittingMode: "hourly", sittingHours: 3, sittingDays: 1, sittingStart: "", sittingEnd: "",
    },
    owner: {
      name: "", phone: "", email: "", locality: "", address: "", pickup_drop: false,
      emergency_name: "", emergency_phone: "", vet_name: "", vet_phone: "",
    },
    options: { separateRoom: false, foodProtein: "chicken", discountPercent: 0, discountCode: "", mealsPerDay: 2 },
    notes: "",
    paymentType: "50%",
    termsAccepted: false,
  });
  const [submitting, setSubmitting] = React.useState(false);
  const [bookingResult, setBookingResult] = React.useState(null);
  const [otherSpeciesDetected, setOtherSpeciesDetected] = React.useState(false);

  React.useEffect(() => {
    api.get("/services").then((r) => setServices(r.data)).catch(() => {});
  }, []);

  const selectedServices = services.filter((s) => data.selectedSlugs.includes(s.slug));
  const hasSitting = data.selectedSlugs.includes("pet-sitting");
  const quote = calculateQuote({
    selectedServices,
    pets: data.pets,
    dates: data.dates,
    options: { ...data.options, mealsPerDay: data.dates.mealsPerDay },
  });

  const next = () => setStep((s) => Math.min(s + 1, STEPS.length - 1));
  const back = () => setStep((s) => Math.max(s - 1, 0));

  const validate = () => {
    if (step === 0 && data.selectedSlugs.length === 0) {
      toast.error("Pick at least one service");
      return false;
    }
    if (step === 1) {
      for (const pet of data.pets) {
        if (!pet.name) { toast.error("Please enter a name for all pets"); return false; }
        if (pet.species === "Dog" && !pet.size) { toast.error(`Select a size for ${pet.name}`); return false; }
        if (pet.species === "Other") { setOtherSpeciesDetected(true); return false; }
        if ((pet.species === "Dog" || pet.species === "Cat") && !pet.no_aggression) {
          toast.error(`Confirm ${pet.name} has no aggression history`);
          return false;
        }
      }
    }
    if (step === 2) {
      if (!data.dates.startDate && !hasSitting) { toast.error("Start date required"); return false; }
      if (hasSitting && data.dates.sittingMode === "multiday" && !data.dates.sittingStart) {
        toast.error("Select sitting start date");
        return false;
      }
      if (hasSitting && !sitterAcknowledged) { setShowSitterPopup(true); return false; }
    }
    if (step === 3) {
      if (!data.owner.name) { toast.error("Your name is required"); return false; }
      if (!validatePhone(data.owner.phone)) { toast.error("Enter a valid Indian mobile number (10 digits)"); return false; }
    }
    return true;
  };

  const handleNext = () => { if (validate()) next(); };

  const submit = async () => {
    if (!data.termsAccepted) { toast.error("Please accept the Terms & Conditions"); return; }
    setSubmitting(true);
    try {
      const payload = {
        services: data.selectedSlugs,
        pet: data.pets[0],
        pets: data.pets,
        start_date: hasSitting && data.dates.sittingMode === "multiday" ? data.dates.sittingStart : data.dates.startDate,
        end_date: hasSitting && data.dates.sittingMode === "multiday" ? data.dates.sittingEnd : (data.dates.endDate || null),
        time_slot: data.dates.timeSlot || null,
        owner: {
          name: data.owner.name,
          phone: validatePhone(data.owner.phone) ? `+91${validatePhone(data.owner.phone)}` : data.owner.phone,
          email: data.owner.email || null,
          locality: data.owner.locality || null,
          address: data.owner.address || null,
          pickup_drop: data.owner.pickup_drop,
        },
        estimated_price: data.paymentType === "100%" ? quote.pay100 : quote.pay50,
        notes: [
          data.notes,
          data.pets.length > 1 ? `Multi-pet (${data.pets.length})` : "",
          data.options.separateRoom ? "Separate room" : "",
          data.selectedSlugs.includes("pet-food-delivery") ? `Food: ${data.options.foodProtein}` : "",
          hasSitting ? `Sitting: ${data.dates.sittingMode}${data.dates.sittingMode === "hourly" ? ` ${data.dates.sittingHours}h` : ""}` : "",
          `Payment: ${data.paymentType}`,
          data.options.discountCode ? `Discount: ${data.options.discountCode} (${data.options.discountPercent}%)` : "",
          data.owner.emergency_name ? `Emergency: ${data.owner.emergency_name} (${data.owner.emergency_phone})` : "",
          data.owner.vet_name ? `Vet: ${data.owner.vet_name} (${data.owner.vet_phone})` : "",
          ...data.pets.filter((p) => p.vaccination_at_dropoff).map((p) => `${p.name}: vacc at drop-off`),
          ...data.pets.filter((p) => p.vaccination_file).map((p) => `${p.name}: vacc uploaded (${p.vaccination_file})`),
        ].filter(Boolean).join(" | "),
      };
      const res = await api.post("/bookings", payload);
      setBookingResult(res.data);
      setStep(5);
    } catch {
      toast.error("Booking failed. Please try WhatsApp.");
    } finally {
      setSubmitting(false);
    }
  };

  const toggleService = (slug) => {
    setData((d) => ({
      ...d,
      selectedSlugs: d.selectedSlugs.includes(slug)
        ? d.selectedSlugs.filter((s) => s !== slug)
        : [...d.selectedSlugs, slug],
    }));
  };

  const updatePet = (idx, u) => {
    setData((d) => {
      const pets = [...d.pets];
      pets[idx] = { ...pets[idx], ...u };
      return { ...d, pets };
    });
  };

  const addPet = () => setData((d) => ({ ...d, pets: [...d.pets, newPet()] }));
  const removePet = (idx) => setData((d) => ({ ...d, pets: d.pets.filter((_, i) => i !== idx) }));

  /* ─── Other species redirect ─── */
  if (otherSpeciesDetected) {
    return (
      <div className="section-pad bg-brand-bg min-h-[calc(100vh-80px)]" data-testid="booking-page">
        <div className="container-pv max-w-lg text-center py-20">
          <div className="text-6xl mb-4">🐾</div>
          <h2 className="font-display font-black text-3xl text-brand-ink mb-3">Exotic pet? Let's chat!</h2>
          <p className="text-brand-muted text-lg mb-6">We'd love to help but need to discuss care details first.</p>
          <a href={buildWhatsAppLink(info.whatsapp_number, "Hi! I have an exotic pet and would like to discuss care options.")} target="_blank" rel="noreferrer" className="btn-primary inline-flex" data-testid="other-whatsapp">
            <MessageCircle size={18} /> Chat on WhatsApp
          </a>
          <div className="mt-4">
            <button onClick={() => setOtherSpeciesDetected(false)} className="btn-outline text-sm">
              <ArrowLeft size={14} /> Go back
            </button>
          </div>
        </div>
      </div>
    );
  }

  /* ─── Main render ─── */
  return (
    <div className="section-pad bg-brand-bg min-h-[calc(100vh-80px)]" data-testid="booking-page">
      <div className="container-pv max-w-4xl">
        <div className="mb-6">
          <Link to="/" className="inline-flex items-center gap-1.5 text-sm text-brand-muted hover:text-brand-primary">
            <ArrowLeft size={14} /> Back to home
          </Link>
          <h1 className="font-display font-black text-3xl md:text-5xl text-brand-ink mt-3">Book a service</h1>
          <p className="text-brand-muted mt-2">Step {Math.min(step + 1, 5)} of 5 · We confirm everything on WhatsApp</p>
        </div>

        {/* Progress */}
        <div className="card-pv mb-6 flex flex-wrap gap-2" data-testid="booking-progress">
          {STEPS.slice(0, 5).map((label, i) => (
            <div key={label} className={`flex items-center gap-2 text-xs md:text-sm font-display font-bold px-3 py-2 rounded-full transition-colors ${STATUS_PILL(i, step)}`}>
              <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${STATUS_BADGE(i, step)}`}>
                {i < step ? <Check size={12} strokeWidth={3} /> : i + 1}
              </span>
              {label}
            </div>
          ))}
        </div>

        {/* Steps */}
        <div className="card-pv">
          {step === 0 && <Step1 services={services} selected={data.selectedSlugs} toggle={toggleService} />}
          {step === 1 && <Step2 pets={data.pets} updatePet={updatePet} addPet={addPet} removePet={removePet} />}
          {step === 2 && <Step3 data={data} setData={setData} selectedSlugs={data.selectedSlugs} sitterAcknowledged={sitterAcknowledged} onShowSitterPopup={() => setShowSitterPopup(true)} />}
          {step === 3 && <Step4 owner={data.owner} setOwner={(o) => setData({ ...data, owner: o })} notes={data.notes} setNotes={(n) => setData({ ...data, notes: n })} hasSitting={hasSitting} />}
          {step === 4 && <Step5 data={data} setData={setData} quote={quote} selectedServices={selectedServices} />}
          {step === 5 && bookingResult && <Step6 booking={bookingResult} paymentType={data.paymentType} quote={quote} />}
        </div>

        {/* Nav */}
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
              <button onClick={submit} disabled={submitting || !data.termsAccepted} className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed" data-testid="booking-submit-btn">
                {submitting ? "Booking…" : `Pay ₹${(data.paymentType === "100%" ? quote.pay100 : quote.pay50).toLocaleString("en-IN")} & Confirm`} <Check size={16} />
              </button>
            )}
          </div>
        )}
      </div>

      {/* Pet Sitter Popup */}
      {showSitterPopup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" data-testid="sitter-popup">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowSitterPopup(false)} />
          <div className="relative bg-white rounded-3xl shadow-2xl max-w-md w-full p-6 text-center">
            <div className="w-16 h-16 rounded-full bg-brand-sage flex items-center justify-center mx-auto mb-4">
              <UserCheck size={32} className="text-brand-primary" />
            </div>
            <h3 className="font-display font-black text-xl text-brand-ink mb-2">About your pet sitter</h3>
            <p className="text-brand-muted leading-relaxed mb-4">
              Pet sitters may vary during your booking period. Only <strong className="text-brand-ink">experienced and verified</strong> sitters will be assigned to your pet. You'll receive sitter details and confirmation on WhatsApp after booking.
            </p>
            <p className="text-sm text-brand-muted mb-6">You can always connect on WhatsApp to discuss sitter preferences before confirming.</p>
            <div className="flex gap-3">
              <a href={buildWhatsAppLink(info.whatsapp_number, "Hi! I'd like to discuss pet sitter options before booking.")} target="_blank" rel="noreferrer"
                className="flex-1 py-3 bg-[#25D366] text-white rounded-full font-display font-bold text-sm flex items-center justify-center gap-2" data-testid="sitter-whatsapp">
                <MessageCircle size={16} /> Discuss first
              </a>
              <button onClick={() => { setSitterAcknowledged(true); setShowSitterPopup(false); }}
                className="flex-1 py-3 bg-brand-primary text-white rounded-full font-display font-bold text-sm hover:bg-brand-primary-hover" data-testid="sitter-ok">
                Got it, proceed
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`.input-pv{width:100%;padding:12px 16px;background:#FAFAF8;border:2px solid #E0E0D0;border-radius:16px;font-family:'Inter',sans-serif;font-size:15px;color:#111;outline:none;transition:border-color .2s}.input-pv:focus{border-color:#1B7B8A;background:#fff}`}</style>
    </div>
  );
}


/* ═══════════════ STEP 1 — SERVICE ═══════════════ */
function Step1({ services, selected, toggle }) {
  return (
    <div data-testid="booking-step-service">
      <h2 className="font-display font-black text-2xl text-brand-ink mb-1">Which services do you need?</h2>
      <p className="text-brand-muted text-sm mb-6">Pick one or combine. Combo bookings welcome.</p>
      <div className="grid sm:grid-cols-2 gap-3">
        {services.map((s) => {
          const Icon = LucideIcons[s.icon] || LucideIcons.PawPrint;
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


/* ═══════════════ STEP 2 — PETS ═══════════════ */
function Step2({ pets, updatePet, addPet, removePet }) {
  return (
    <div data-testid="booking-step-pets">
      <div className="flex items-center justify-between mb-1">
        <h2 className="font-display font-black text-2xl text-brand-ink">Your pet{pets.length > 1 ? "s" : ""}</h2>
        <button onClick={addPet} className="flex items-center gap-1.5 text-sm font-display font-bold text-brand-primary hover:underline" data-testid="add-pet-btn">
          <Plus size={16} /> Add another pet
        </button>
      </div>
      {pets.length >= 2 && (
        <div className="flex items-center gap-2 bg-brand-sage/60 text-brand-primary text-sm font-display font-bold px-4 py-2 rounded-full w-fit mb-4" data-testid="multi-pet-badge">
          <Percent size={14} /> 10% multi-pet discount applied!
        </div>
      )}
      <div className="space-y-6">
        {pets.map((pet, idx) => (
          <div key={pet.id}>
            {pets.length > 1 && (
              <div className="flex items-center justify-between mb-2">
                <span className="font-display font-bold text-brand-ink">Pet {idx + 1}</span>
                <button onClick={() => removePet(idx)} className="flex items-center gap-1 text-xs text-red-500 hover:underline" data-testid={`remove-pet-${idx}`}>
                  <Trash2 size={12} /> Remove
                </button>
              </div>
            )}
            <PetForm pet={pet} onChange={(u) => updatePet(idx, u)} idx={idx} />
          </div>
        ))}
      </div>
    </div>
  );
}

function PetForm({ pet, onChange, idx }) {
  return (
    <div className="bg-brand-bg border border-brand-border rounded-2xl p-4 space-y-4" data-testid={`pet-form-${idx}`}>
      <div className="grid grid-cols-2 gap-3">
        <Inp label="Pet's Name" value={pet.name} set={(v) => onChange({ name: v })} ph="Bruno" tid={`pet-name-${idx}`} />
        <div>
          <span className="block text-sm font-display font-bold text-brand-ink mb-1.5">Species</span>
          <select className="input-pv" value={pet.species} onChange={(e) => onChange({ species: e.target.value, size: e.target.value === "Dog" ? "medium" : "" })} data-testid={`pet-species-${idx}`}>
            {SPECIES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
          </select>
        </div>
      </div>

      {/* Dog size */}
      {pet.species === "Dog" && (
        <div>
          <span className="block text-sm font-display font-bold text-brand-ink mb-2">Size</span>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {DOG_SIZES.map((s) => (
              <button key={s.value} type="button" onClick={() => onChange({ size: s.value })} data-testid={`pet-size-${s.value}-${idx}`}
                className={`p-3 rounded-xl border-2 text-left transition-all ${pet.size === s.value ? "border-brand-primary bg-brand-sage/40" : "border-brand-border hover:border-brand-primary/50"}`}>
                <div className="font-display font-bold text-sm text-brand-ink">{s.label}</div>
                <div className="text-xs text-brand-muted">{s.desc}</div>
                <div className="text-[10px] text-brand-muted mt-0.5">{s.examples}</div>
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-3 gap-3">
        <Inp label="Breed" value={pet.breed} set={(v) => onChange({ breed: v })} ph="Labrador" tid={`pet-breed-${idx}`} />
        <Inp label="Age" value={pet.age} set={(v) => onChange({ age: v })} ph="2 years" tid={`pet-age-${idx}`} />
        <Inp label="Weight (kg)" value={pet.weight} set={(v) => onChange({ weight: v })} ph="12" tid={`pet-weight-${idx}`} />
      </div>

      <Inp label="Special needs / allergies / medications" value={pet.special_needs} set={(v) => onChange({ special_needs: v })} ph="e.g. allergic to chicken, on ear drops" tid={`pet-special-${idx}`} area />

      {/* Vaccination — upload first, bring in person as fallback */}
      {(pet.species === "Dog" || pet.species === "Cat") && (
        <div className="bg-white border border-brand-border rounded-xl p-3 space-y-3">
          <div className="flex items-center gap-2">
            <ShieldCheck size={16} className="text-brand-primary" />
            <span className="text-sm font-display font-bold text-brand-ink">
              Vaccination Certificate ({pet.species === "Dog" ? "DHPPiL + Rabies" : "FVRCP + Rabies"}) *
            </span>
          </div>
          <div className="space-y-2">
            <label className="block cursor-pointer" data-testid={`pet-vacc-upload-${idx}`}>
              <input
                type="file"
                accept="image/*,.pdf"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) onChange({ vaccination_file: f.name, vaccination_at_dropoff: false });
                }}
                data-testid={`pet-vacc-file-${idx}`}
              />
              <div className={`w-full p-3 border-2 border-dashed rounded-xl text-center cursor-pointer transition-all ${pet.vaccination_file ? "border-brand-primary bg-brand-sage/30" : "border-brand-border hover:border-brand-primary/50"}`}>
                {pet.vaccination_file ? (
                  <span className="text-sm text-brand-primary font-bold flex items-center justify-center gap-2">
                    <CheckCircle2 size={14} /> {pet.vaccination_file}
                  </span>
                ) : (
                  <span className="text-sm text-brand-muted">📄 Upload vaccination certificate (photo or PDF)</span>
                )}
              </div>
            </label>
            <div className="flex items-center gap-2 text-brand-muted text-xs">
              <div className="flex-1 border-t border-brand-border" />
              <span>or</span>
              <div className="flex-1 border-t border-brand-border" />
            </div>
            <label className="flex items-center gap-3 cursor-pointer p-2 rounded-lg hover:bg-brand-bg" data-testid={`pet-vacc-dropoff-${idx}`}>
              <input
                type="checkbox"
                className="w-4 h-4 accent-brand-primary"
                checked={pet.vaccination_at_dropoff}
                onChange={(e) => onChange({ vaccination_at_dropoff: e.target.checked, vaccination_file: e.target.checked ? "" : pet.vaccination_file })}
              />
              <span className="text-sm text-brand-muted">I'll bring the certificate in person at drop-off</span>
            </label>
          </div>
          <p className="text-[11px] text-brand-muted">⚠️ Vaccination is mandatory. Without a certificate, service may be declined.</p>
        </div>
      )}

      {/* Aggression acknowledgment */}
      {(pet.species === "Dog" || pet.species === "Cat") && (
        <label className="flex items-start gap-3 cursor-pointer p-3 bg-white border border-brand-border rounded-xl" data-testid={`pet-aggression-${idx}`}>
          <input type="checkbox" className="w-4 h-4 accent-brand-primary mt-0.5" checked={pet.no_aggression} onChange={(e) => onChange({ no_aggression: e.target.checked })} />
          <div>
            <span className="text-sm font-display font-bold text-brand-ink">I confirm my pet has no history of aggression</span>
            <p className="text-[11px] text-brand-muted mt-0.5">Aggressive pets cannot be accommodated for safety reasons.</p>
          </div>
        </label>
      )}
    </div>
  );
}


/* ═══════════════ STEP 3 — DATES ═══════════════ */
function Step3({ data, setData, selectedSlugs, sitterAcknowledged, onShowSitterPopup }) {
  const d = data.dates;
  const setDates = (u) => setData({ ...data, dates: { ...d, ...u } });
  const hasBoarding = selectedSlugs.includes("pet-boarding");
  const hasDaycare = selectedSlugs.includes("pet-daycare");
  const hasFood = selectedSlugs.includes("pet-food-delivery");
  const hasTraining = selectedSlugs.includes("pet-training");
  const hasSitting = selectedSlugs.includes("pet-sitting");

  return (
    <div data-testid="booking-step-dates">
      <h2 className="font-display font-black text-2xl text-brand-ink mb-1">When & how?</h2>
      <p className="text-brand-muted text-sm mb-6">Pick your dates and options.</p>
      <div className="space-y-5">

        {/* General dates */}
        {(hasBoarding || (!hasSitting && !hasDaycare)) && (
          <div className="grid md:grid-cols-2 gap-4">
            <Inp label={hasBoarding ? "Check-in date" : "Service date"} type="date" value={d.startDate} set={(v) => setDates({ startDate: v })} tid="start-date" min={new Date().toISOString().split("T")[0]} />
            {hasBoarding && (
              <Inp label="Check-out date" type="date" value={d.endDate} set={(v) => setDates({ endDate: v })} tid="end-date" min={d.startDate || new Date().toISOString().split("T")[0]} />
            )}
            {!hasBoarding && !hasDaycare && !hasSitting && (
              <div>
                <span className="block text-sm font-display font-bold text-brand-ink mb-1.5">Preferred time</span>
                <select className="input-pv" value={d.timeSlot} onChange={(e) => setDates({ timeSlot: e.target.value })} data-testid="time-slot">
                  <option value="">Select a time</option>
                  <option>Morning (9 AM – 12 PM)</option>
                  <option>Afternoon (12 – 4 PM)</option>
                  <option>Evening (4 – 8 PM)</option>
                </select>
              </div>
            )}
          </div>
        )}

        {/* Daycare */}
        {hasDaycare && (
          <div className="bg-brand-bg border border-brand-border rounded-2xl p-4 space-y-3">
            <h3 className="font-display font-bold text-brand-ink flex items-center gap-2">☀️ Daycare</h3>
            <div className="grid md:grid-cols-3 gap-3">
              <Inp label="Date" type="date" value={d.startDate} set={(v) => setDates({ startDate: v })} tid="daycare-date" min={new Date().toISOString().split("T")[0]} />
              <Inp label="Hours per day" type="number" value={d.daycareHours} set={(v) => setDates({ daycareHours: Math.max(1, Math.min(24, Number(v))) })} tid="daycare-hours" />
              <Inp label="Number of days" type="number" value={d.daycareDays} set={(v) => setDates({ daycareDays: Math.max(1, Number(v)) })} tid="daycare-days" />
            </div>
            <p className="text-xs text-brand-muted">₹150/hr for dogs, ₹100/hr for others. Capped at boarding rate if exceeded.</p>
          </div>
        )}

        {/* Pet Sitting */}
        {hasSitting && (
          <div className="bg-brand-bg border border-brand-border rounded-2xl p-4 space-y-4">
            <h3 className="font-display font-bold text-brand-ink flex items-center gap-2">🏠 Pet Sitting</h3>

            <div className="grid grid-cols-3 gap-2">
              {SITTING_MODES.map((m) => (
                <button key={m.value} type="button" onClick={() => setDates({ sittingMode: m.value })} data-testid={`sitting-mode-${m.value}`}
                  className={`p-3 rounded-xl border-2 text-center transition-all ${d.sittingMode === m.value ? "border-brand-primary bg-brand-sage/40" : "border-brand-border hover:border-brand-primary/50"}`}>
                  <div className="text-xl mb-1">{m.icon}</div>
                  <div className="font-display font-bold text-sm text-brand-ink">{m.label}</div>
                  <div className="text-[10px] text-brand-muted">{m.desc}</div>
                </button>
              ))}
            </div>

            {d.sittingMode === "hourly" && (
              <div className="grid md:grid-cols-2 gap-3">
                <Inp label="Date" type="date" value={d.sittingStart || d.startDate} set={(v) => setDates({ sittingStart: v, startDate: v })} tid="sitting-date" min={new Date().toISOString().split("T")[0]} />
                <Inp label="Number of hours" type="number" value={d.sittingHours} set={(v) => setDates({ sittingHours: Math.max(1, Math.min(24, Number(v))) })} tid="sitting-hours" />
              </div>
            )}

            {d.sittingMode === "fullday" && (
              <div className="grid md:grid-cols-2 gap-3">
                <Inp label="Date" type="date" value={d.sittingStart || d.startDate} set={(v) => setDates({ sittingStart: v, startDate: v })} tid="sitting-date-fd" min={new Date().toISOString().split("T")[0]} />
                <Inp label="Number of days" type="number" value={d.sittingDays} set={(v) => setDates({ sittingDays: Math.max(1, Number(v)) })} tid="sitting-days-fd" />
              </div>
            )}

            {d.sittingMode === "multiday" && (
              <div className="grid md:grid-cols-2 gap-3">
                <Inp label="Start date" type="date" value={d.sittingStart} set={(v) => setDates({ sittingStart: v })} tid="sitting-start" min={new Date().toISOString().split("T")[0]} />
                <Inp label="End date" type="date" value={d.sittingEnd} set={(v) => setDates({ sittingEnd: v })} tid="sitting-end" min={d.sittingStart || new Date().toISOString().split("T")[0]} />
              </div>
            )}

            <div className="text-xs text-brand-muted space-y-1 bg-white rounded-xl p-3 border border-brand-border">
              <div>⏱️ <strong>Hourly:</strong> ₹350/hr per pet · capped at day rate</div>
              <div>☀️ <strong>Full day:</strong> ₹1,200/day (dogs) · ₹1,000/day (others)</div>
              <div>🗓️ <strong>Multi-day:</strong> ₹1,500/day (dogs) · ₹1,200/day (others)</div>
              <div className="pt-1 border-t border-brand-border mt-1 text-brand-primary font-semibold">Pet sitters may vary during assignment. Only experienced, verified sitters.</div>
            </div>

            {sitterAcknowledged ? (
              <div className="flex items-center gap-2 text-sm text-brand-primary font-display font-bold">
                <CheckCircle2 size={16} /> Sitter assignment acknowledged
              </div>
            ) : (
              <button type="button" onClick={onShowSitterPopup} className="text-sm text-brand-primary font-display font-bold underline" data-testid="show-sitter-info">
                Read about sitter assignment →
              </button>
            )}
          </div>
        )}

        {/* Training */}
        {hasTraining && (
          <div className="bg-brand-bg border border-brand-border rounded-2xl p-4 space-y-3">
            <h3 className="font-display font-bold text-brand-ink">🎓 Training</h3>
            <Inp label="Number of sessions (₹1,500/session)" type="number" value={d.trainingSessions} set={(v) => setDates({ trainingSessions: Math.max(1, Number(v)) })} tid="training-sessions" />
          </div>
        )}

        {/* Food */}
        {hasFood && (
          <div className="bg-brand-bg border border-brand-border rounded-2xl p-4 space-y-3">
            <h3 className="font-display font-bold text-brand-ink">🍗 Meal Protein</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {PROTEINS.map((p) => (
                <button key={p.value} type="button" onClick={() => setData({ ...data, options: { ...data.options, foodProtein: p.value } })} data-testid={`protein-${p.value}`}
                  className={`p-3 rounded-xl border-2 text-left transition-all ${data.options.foodProtein === p.value ? "border-brand-primary bg-brand-sage/40" : "border-brand-border hover:border-brand-primary/50"}`}>
                  <div className="font-display font-bold text-sm text-brand-ink">{p.label}</div>
                  <div className="text-brand-primary font-bold text-sm">₹{p.price}/meal</div>
                  <div className="text-[10px] text-brand-muted">{p.tag}</div>
                </button>
              ))}
            </div>
            <div className="grid md:grid-cols-2 gap-3">
              <Inp label="Meals per day" type="number" value={d.mealsPerDay} set={(v) => setDates({ mealsPerDay: Math.max(1, Math.min(3, Number(v))) })} tid="meals-per-day" />
              <Inp label="Number of days" type="number" value={d.foodDays} set={(v) => setDates({ foodDays: Math.max(1, Number(v)) })} tid="food-days" />
            </div>
          </div>
        )}

        {/* Separate room */}
        {(hasBoarding || hasDaycare) && (
          <label className="flex items-center gap-3 cursor-pointer p-4 bg-white border-2 border-brand-border rounded-xl hover:border-brand-primary/50" data-testid="separate-room">
            <input type="checkbox" className="w-5 h-5 accent-brand-primary" checked={data.options.separateRoom}
              onChange={(e) => setData({ ...data, options: { ...data.options, separateRoom: e.target.checked } })} />
            <div>
              <div className="font-display font-bold text-brand-ink">My pet needs a separate room</div>
              <div className="text-xs text-brand-muted">+₹100/night if your pet doesn't get along with others</div>
            </div>
          </label>
        )}
      </div>
    </div>
  );
}


/* ═══════════════ STEP 4 — OWNER ═══════════════ */
function Step4({ owner, setOwner, notes, setNotes, hasSitting }) {
  const set = (u) => setOwner({ ...owner, ...u });
  return (
    <div data-testid="booking-step-owner">
      <h2 className="font-display font-black text-2xl text-brand-ink mb-1">Your details</h2>
      <p className="text-brand-muted text-sm mb-6">So we can confirm on WhatsApp.</p>
      <div className="space-y-4">
        <div className="grid md:grid-cols-2 gap-4">
          <Inp label="Your Name" value={owner.name} set={(v) => set({ name: v })} ph="Anjali Mehta" tid="owner-name" />
          <div>
            <span className="block text-sm font-display font-bold text-brand-ink mb-1.5">WhatsApp Number</span>
            <div className="flex">
              <span className="flex items-center px-3 bg-brand-bg border-2 border-r-0 border-brand-border rounded-l-2xl text-sm text-brand-muted font-bold">+91</span>
              <input className="input-pv rounded-l-none" value={owner.phone} onChange={(e) => set({ phone: e.target.value })} placeholder="98765 43210" maxLength={14} data-testid="owner-phone" />
            </div>
            {owner.phone && !validatePhone(owner.phone) && (
              <p className="text-red-500 text-xs mt-1">Enter a valid 10-digit mobile number</p>
            )}
          </div>
        </div>
        <div className="grid md:grid-cols-2 gap-4">
          <Inp label="Email (optional)" type="email" value={owner.email} set={(v) => set({ email: v })} ph="you@example.com" tid="owner-email" />
          <Inp label="Locality" value={owner.locality} set={(v) => set({ locality: v })} ph="Viman Nagar, Kharadi…" tid="owner-locality" />
        </div>
        <Inp label="Full Address (for home services / pickup)" value={owner.address} set={(v) => set({ address: v })} ph="Flat No, Society, Street" tid="owner-address" area />

        {/* Pickup & Drop — hidden for pet sitting */}
        {!hasSitting && (
          <label className="flex items-center gap-3 cursor-pointer p-3 bg-brand-bg rounded-xl border-2 border-brand-border" data-testid="pickup-drop">
            <input type="checkbox" className="w-5 h-5 accent-brand-primary" checked={owner.pickup_drop} onChange={(e) => set({ pickup_drop: e.target.checked })} />
            <div>
              <div className="font-display font-bold text-brand-ink">I'd like pickup & drop</div>
              <div className="text-xs text-brand-muted">₹150–300 based on locality</div>
            </div>
          </label>
        )}

        {/* Emergency & Vet */}
        <div className="bg-brand-bg border border-brand-border rounded-2xl p-4 space-y-3">
          <div className="flex items-center gap-2 mb-1">
            <AlertTriangle size={16} className="text-brand-secondary" />
            <span className="font-display font-bold text-sm text-brand-ink">Emergency & Vet Details</span>
          </div>
          <div className="grid md:grid-cols-2 gap-3">
            <Inp label="Emergency Contact Name" value={owner.emergency_name} set={(v) => set({ emergency_name: v })} ph="Spouse, parent, friend" tid="emergency-name" />
            <Inp label="Emergency Phone" value={owner.emergency_phone} set={(v) => set({ emergency_phone: v })} ph="98765 43210" tid="emergency-phone" />
          </div>
          <div className="grid md:grid-cols-2 gap-3">
            <Inp label="Your Vet's Name (optional)" value={owner.vet_name} set={(v) => set({ vet_name: v })} ph="Dr. Sharma" tid="vet-name" />
            <Inp label="Vet Phone (optional)" value={owner.vet_phone} set={(v) => set({ vet_phone: v })} ph="020-12345678" tid="vet-phone" />
          </div>
        </div>

        <Inp label="Anything else? (optional)" value={notes} set={setNotes} ph="Special requests, food preferences…" tid="notes" area />
      </div>
    </div>
  );
}


/* ═══════════════ STEP 5 — REVIEW ═══════════════ */
function Step5({ data, setData, quote, selectedServices }) {
  const [showTerms, setShowTerms] = React.useState(false);

  return (
    <div data-testid="booking-step-review">
      <h2 className="font-display font-black text-2xl text-brand-ink mb-1">Review & Pay</h2>
      <p className="text-brand-muted text-sm mb-6">Check everything. We'll confirm on WhatsApp.</p>
      <div className="space-y-4">

        {/* Quote breakdown */}
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

        {/* Payment choice */}
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

        {/* Discount code */}
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

        {/* T&C */}
        <label className="flex items-start gap-3 cursor-pointer p-4 bg-brand-bg border-2 border-brand-border rounded-2xl hover:border-brand-primary/50" data-testid="terms-wrap">
          <input type="checkbox" className="w-5 h-5 accent-brand-primary mt-0.5" checked={data.termsAccepted}
            onChange={(e) => setData({ ...data, termsAccepted: e.target.checked })} data-testid="terms-checkbox" />
          <div className="text-sm text-brand-ink leading-relaxed">
            I have read and agree to the{" "}
            <button type="button" onClick={(e) => { e.preventDefault(); setShowTerms(true); }} className="text-brand-primary font-bold underline" data-testid="read-terms">
              Terms & Conditions
            </button>
            , including cancellation policy, vet cost responsibility, and photo consent.
          </div>
        </label>

        <p className="text-[11px] text-brand-muted text-center">
          Cancel 48h+: full refund minus ₹100 · 24-48h: 70% refund · Under 24h: case-by-case
        </p>
      </div>

      {/* Terms Modal */}
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


/* ═══════════════ STEP 6 — DONE ═══════════════ */
function Step6({ booking, paymentType, quote }) {
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


/* ─────────── FIELD HELPER ─────────── */
function Inp({ label, value, set, ph = "", tid, type = "text", area = false, min }) {
  const Tag = area ? "textarea" : "input";
  return (
    <label className="block" data-testid={`${tid}-field`}>
      <span className="block text-sm font-display font-bold text-brand-ink mb-1.5">{label}</span>
      <Tag
        className={`input-pv ${area ? "resize-none" : ""}`}
        type={type}
        value={value ?? ""}
        onChange={(e) => set(e.target.value)}
        placeholder={ph}
        rows={area ? 3 : undefined}
        min={min}
        data-testid={tid}
      />
    </label>
  );
}