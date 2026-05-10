import React from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { api } from "../lib/api";
import { useBusinessInfo, buildWhatsAppLink } from "../lib/businessInfo";
import { Check, ArrowLeft, ArrowRight, MessageCircle, UserCheck } from "lucide-react";
import { toast } from "sonner";

// Modular Step Components
import { STEPS, STATUS_PILL, STATUS_BADGE, validatePhone } from "./Booking/BookingFields";
import StepService from "./Booking/StepService";
import StepPets from "./Booking/StepPets";
import StepDates from "./Booking/StepDates";
import StepOwner from "./Booking/StepOwner";
import StepReview from "./Booking/StepReview";
import StepDone from "./Booking/StepDone";
import BookingPaymentStep from "../components/booking/BookingPaymentStep";

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
      checkInTime: "10:00", checkOutTime: "10:00",
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
  const [quote, setQuote] = React.useState({
  lines: [], subtotal: 0, separateRoomCost: 0, multiPetDiscount: 0,
  adminDiscount: 0, afterDiscounts: 0, fullPayDiscount: 0, pay50: 0, pay100: 0
});

const estimatedPrice = quote?.subtotal || 0;

const [loadingQuote, setLoadingQuote] = React.useState(false);

  React.useEffect(() => {
    api.get("/services").then((r) => setServices(r.data)).catch(() => {});
  }, []);

  // Live Quote Fetch
  React.useEffect(() => {
    const fetchQuote = async () => {
      if (data.selectedSlugs.length === 0) {
        setQuote({
          lines: [], subtotal: 0, separateRoomCost: 0, multiPetDiscount: 0,
          adminDiscount: 0, afterDiscounts: 0, fullPayDiscount: 0, pay50: 0, pay100: 0
        });
        return;
      }
      setLoadingQuote(true);
      try {
        const res = await api.post("/bookings/quote", {
          selectedSlugs: data.selectedSlugs,
          pets: data.pets,
          dates: data.dates,
          options: data.options,
        });
        setQuote(res.data);
      } catch (err) {
        console.error("Quote fetch failed", err);
      } finally {
        setLoadingQuote(false);
      }
    };

    const timer = setTimeout(fetchQuote, 400); // Debounce
    return () => clearTimeout(timer);
  }, [data.selectedSlugs, data.pets, data.dates, data.options]);

  const selectedServices = services.filter((s) => data.selectedSlugs.includes(s.slug));
  const hasSitting = data.selectedSlugs.includes("pet-sitting");

  const next = () => { setStep((s) => Math.min(s + 1, STEPS.length - 1)); window.scrollTo({ top: 0, behavior: "smooth" }); };
  const back = () => { setStep((s) => Math.max(s - 1, 0)); window.scrollTo({ top: 0, behavior: "smooth" }); };

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
    if (data.owner.pickup_drop) {
    if (!data.owner.address?.trim()) { toast.error("Please enter your full address for pickup."); return false; }
    if (!data.owner.locality?.trim()) { toast.error("Please enter your locality for pickup."); return false; }
  }
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
        dates: data.dates,
        options: data.options,
        payment_type: data.paymentType,
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
          {step === 0 && <StepService services={services} selected={data.selectedSlugs} toggle={toggleService} />}
          {step === 1 && <StepPets pets={data.pets} updatePet={updatePet} addPet={addPet} removePet={removePet} />}
          {step === 2 && <StepDates data={data} setData={setData} selectedSlugs={data.selectedSlugs} sitterAcknowledged={sitterAcknowledged} onShowSitterPopup={() => setShowSitterPopup(true)} />}
          {step === 3 && <StepOwner owner={data.owner} setOwner={(o) => setData({ ...data, owner: o })} notes={data.notes} setNotes={(n) => setData({ ...data, notes: n })} hasSitting={hasSitting} hasGrooming={data.selectedSlugs.includes("pet-grooming")} />}
          {step === 4 && <StepReview data={data} setData={setData} quote={quote} />}
          {step === 5 && (
  <BookingPaymentStep
    bookingFormData={data}
    totalAmount={estimatedPrice}
    onPaymentSuccess={({ booking_id, payment_id }) => {
  console.log("Success:", booking_id, payment_id);
  setStep(6); // Move to success screen
}}
    onPaymentFailure={(msg) => {
      console.error("Payment failed:", msg);
    }}
  />
)}
      </div>
      {step === 6 && (
       <div className="text-center py-12 px-4">
      <div className="text-6xl mb-4">🎉</div>
      <h2 className="text-2xl font-bold text-green-600 mb-2">Booking Confirmed!</h2>
      <p className="text-gray-600 mb-2">Your payment was successful.</p>
      <p className="text-gray-600 mb-6">You'll receive a confirmation on WhatsApp shortly.</p>
      <a href="/" className="btn-primary inline-block">Back to Home</a>
      </div>
      )}
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
