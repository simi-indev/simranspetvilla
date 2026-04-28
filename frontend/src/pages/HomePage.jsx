import React from "react";
import { Link } from "react-router-dom";
import { api, WHATSAPP_LINK } from "../lib/api";
import { useBusinessInfo, buildWhatsAppLink } from "../lib/businessInfo";
import ServiceCard from "../components/ServiceCard";
import TrustBar from "../components/TrustBar";
import FAQ from "../components/FAQ";
import { ArrowRight, Calendar, MessageCircle, Smile, Star, MapPin, Quote } from "lucide-react";

const HOME_FAQS = [
  { q: "Is the facility really cage-free?", a: "Yes. Pets stay in our home, sleep on dog beds in shared rooms, and roam freely in indoor and outdoor play areas. Maximum 8 pets at a time, all temperament-matched." },
  { q: "How do I book a service?", a: "Click 'Book a Service', fill the 6-step form with your pet and dates, and we'll confirm on WhatsApp within 30 minutes. UPI advance optional." },
  { q: "What breeds and species do you accept?", a: "All friendly, vaccinated dogs and cats — including Indies, Labs, Goldens, Shih Tzus, Persians, and more. Aggressive pets are evaluated case-by-case." },
  { q: "Do you offer pickup and drop?", a: "Yes — pickup and drop is available across Pune at ₹150–300 depending on locality. Free for stays of 7+ nights." },
  { q: "How much does pet boarding cost in Pune?", a: "Boarding starts at ₹499/night for small dogs and ₹699/night for large dogs. Daycare from ₹299/day. Discounts on weekly and monthly packages." },
  { q: "Are your caretakers trained?", a: "Yes. Simran has 6+ years of pet care experience, and our groomer and trainer are certified. We have a partner vet on call 24/7." },
  { q: "What vaccinations are required?", a: "Dogs: DHPPiL + Rabies (annual). Cats: FVRCP + Rabies. Vaccination certificate must be shared at booking — no exceptions." },
  { q: "Can I visit before booking?", a: "Absolutely — we welcome a free 30-minute pre-booking visit. Just message us on WhatsApp to schedule." },
];

const GALLERY_IMAGES = [
  "https://images.unsplash.com/photo-1534361960057-19889db9621e?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2Njl8MHwxfHNlYXJjaHwxfHxoYXBweSUyMGRvZ3xlbnwwfHx8fDE3NzcwOTk3ODR8MA&ixlib=rb-4.1.0&q=85",
  "https://images.pexels.com/photos/13923477/pexels-photo-13923477.jpeg",
  "https://images.pexels.com/photos/6131576/pexels-photo-6131576.jpeg",
  "https://images.pexels.com/photos/35133324/pexels-photo-35133324.jpeg",
  "https://images.pexels.com/photos/8434635/pexels-photo-8434635.jpeg",
  "https://images.unsplash.com/photo-1601880348117-25c1127a95df?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA1NjZ8MHwxfHNlYXJjaHwxfHxkb2clMjBzbGVlcHxlbnwwfHx8fDE3NzcwOTk3ODR8MA&ixlib=rb-4.1.0&q=85",
];

export default function HomePage() {
  const [services, setServices] = React.useState([]);
  const [reviews, setReviews] = React.useState([]);
  const { info } = useBusinessInfo();
  const waLink = buildWhatsAppLink(info.whatsapp_number);
  const [homeContent, setHomeContent] = React.useState(null);

  React.useEffect(() => {
    api.get("/services").then((r) => setServices(r.data)).catch(() => {});
    api.get("/reviews").then((r) => setReviews(r.data)).catch(() => {});
    api.get("/homepage-content").then((r) => setHomeContent(r.data)).catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const galleryImages = homeContent?.gallery_images || GALLERY_IMAGES;

  return (
    <div data-testid="home-page">
      {/* HERO */}
      <section className="relative overflow-hidden bg-brand-bg" data-testid="hero-section">
        <div className="absolute inset-0 bg-gradient-to-br from-brand-sage/40 via-transparent to-brand-peach/40 pointer-events-none" />
        <div className="container-pv relative pt-12 md:pt-20 pb-12 md:pb-20 grid md:grid-cols-2 gap-10 md:gap-14 items-center">
          <div className="animate-fade-up">
            <span className="trust-badge mb-5" data-testid="hero-eyebrow"><Star size={14} className="text-yellow-500" /> Pune's most trusted cage-free pet care · {info.rating}★ on Google</span>
            <h1 className="font-display font-black text-[42px] md:text-[60px] leading-[1.05] text-brand-ink tracking-tight">
              A real <span className="text-brand-primary">home</span> for your pet — <span className="bg-brand-peach px-2 -rotate-1 inline-block rounded-lg">not a cage.</span>
            </h1>
            <p className="text-brand-muted mt-5 md:mt-6 text-lg leading-relaxed max-w-xl">
              {info.tagline}. Boarding, daycare, home grooming, sitting, fresh-cooked food and training — six trusted pet services from a real home in Lohegaon, Pune. Open 24 hours.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link to="/book" className="btn-primary" data-testid="hero-book-btn">
                <Calendar size={18} /> Book a Service
              </Link>
              <a href={waLink} target="_blank" rel="noreferrer" className="btn-outline" data-testid="hero-whatsapp-btn">
                <MessageCircle size={18} /> Chat on WhatsApp
              </a>
            </div>
            <div className="mt-8"><TrustBar /></div>
          </div>

          <div className="relative animate-fade-up" style={{ animationDelay: "120ms" }}>
            <div className="relative aspect-[4/5] rounded-[32px] overflow-hidden shadow-hover">
            <img src={homeContent?.hero_image || "https://images.unsplash.com/photo-1534361960057-19889db9621e?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2Njl8MHwxfHNlYXJjaHwxfHxoYXBweSUyMGRvZ3xlbnwwfHx8fDE3NzcwOTk3ODR8MA&ixlib=rb-4.1.0&q=85"} alt="Happy dog at PetVilla" className="w-full h-full object-cover" />            </div>
            <div className="hidden md:flex absolute -bottom-6 -left-6 bg-white rounded-3xl shadow-hover px-5 py-4 items-center gap-3 max-w-xs">
              <div className="w-10 h-10 rounded-full bg-brand-secondary flex items-center justify-center text-white"><Smile size={20} /></div>
              <div>
                <div className="font-display font-extrabold text-brand-ink leading-tight">{info.review_count}+ pet parents</div>
                <div className="text-xs text-brand-muted">cage-free, vet-checked, loved</div>
              </div>
            </div>
            <div className="hidden md:flex absolute -top-6 -right-6 bg-brand-primary text-white rounded-3xl shadow-hover px-5 py-4 items-center gap-3">
              <Star size={22} fill="currentColor" />
              <div>
                <div className="font-display font-black text-2xl leading-none">{info.rating}</div>
                <div className="text-xs opacity-90">on Google · {info.review_count}+ reviews</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SERVICES */}
      <section className="section-pad bg-white border-y border-brand-border" data-testid="services-section">
        <div className="container-pv">
          <div className="max-w-3xl mb-10 md:mb-14">
            <span className="trust-badge mb-3">Six services · One trusted home</span>
            <h2 className="font-display font-black text-[32px] md:text-5xl text-brand-ink leading-tight">Everything your pet needs — under one roof.</h2>
            <p className="text-brand-muted mt-4 text-lg">From overnight stays to fresh-cooked meals delivered daily — pick one or combine.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6">
            {services.map((s) => <ServiceCard key={s.slug} service={s} />)}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="section-pad" data-testid="how-it-works-section">
        <div className="container-pv">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="font-display font-black text-[32px] md:text-5xl text-brand-ink leading-tight">Booking is stupid simple.</h2>
            <p className="text-brand-muted mt-3 text-lg">Three steps. Done in 90 seconds.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { num: "01", title: "Book online", desc: "Pick your service, share your pet's details and dates. Takes 90 seconds." },
              { num: "02", title: "We confirm on WhatsApp", desc: "Within 30 minutes, you'll get a personal message confirming everything." },
              { num: "03", title: "Your pet is happy", desc: "Daily photos and videos while we look after your best friend like family." },
            ].map((s, i) => (
              <div key={s.num} className="card-pv relative" data-testid={`how-step-${i + 1}`}>
                <div className="font-display font-black text-7xl text-brand-sage leading-none mb-2">{s.num}</div>
                <h3 className="font-display font-extrabold text-xl text-brand-ink mb-2">{s.title}</h3>
                <p className="text-brand-muted leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="section-pad bg-brand-sage/40" data-testid="testimonials-section">
        <div className="container-pv">
          <div className="flex items-end justify-between flex-wrap gap-4 mb-10">
            <div className="max-w-2xl">
              <span className="trust-badge mb-3">Real Pune pet parents</span>
              <h2 className="font-display font-black text-[32px] md:text-5xl text-brand-ink leading-tight">Loved by {info.review_count}+ families.</h2>
            </div>
            <Link to="/reviews" className="btn-outline" data-testid="see-all-reviews-btn">See all reviews <ArrowRight size={16} /></Link>
          </div>
          <div className="grid md:grid-cols-3 gap-5">
            {reviews.slice(0, 3).map((r) => (
              <div key={r.id} className="card-pv relative" data-testid={`testimonial-${r.id}`}>
                <Quote size={28} className="text-brand-secondary opacity-30 mb-3" />
                <div className="flex items-center gap-1 mb-3">
                  {[...Array(r.rating)].map((_, i) => <Star key={`${r.id}-star-${i}`} size={14} className="text-yellow-500" fill="currentColor" />)}
                </div>
                <p className="text-brand-ink leading-relaxed mb-5">"{r.text}"</p>
                <div className="border-t border-brand-border pt-4">
                  <div className="font-display font-bold text-brand-ink">{r.name}</div>
                  <div className="text-sm text-brand-muted">{r.pet} · {r.service}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* GALLERY */}
      <section className="section-pad" data-testid="gallery-section">
        <div className="container-pv">
          <div className="max-w-2xl mb-8">
            <span className="trust-badge mb-3">Real moments · No stock photos</span>
            <h2 className="font-display font-black text-[32px] md:text-5xl text-brand-ink leading-tight">A peek inside the villa.</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
            {galleryImages.map((src, i) => (
              <div key={`${src}-${i}`} className={`overflow-hidden rounded-3xl ${i === 0 ? "row-span-2 col-span-2 md:col-span-1 md:row-span-2" : ""}`}>
                <img src={src} alt="" className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" loading="lazy" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SERVICE AREA */}
      <section className="section-pad bg-white border-y border-brand-border" data-testid="service-area-section">
        <div className="container-pv grid md:grid-cols-2 gap-10 items-center">
          <div>
            <span className="trust-badge mb-3"><MapPin size={14} /> Service Area</span>
            <h2 className="font-display font-black text-[32px] md:text-5xl text-brand-ink leading-tight">Across all of <span className="text-brand-primary">Pune</span>.</h2>
            <p className="text-brand-muted mt-4 text-lg">Boarding & daycare at our Lohegaon facility. Home grooming, sitting, food delivery and training — pickup-drop and door-to-door across these areas:</p>
            <div className="mt-5 grid grid-cols-2 gap-2 max-w-md">
              {["Lohegaon", "Dhanori", "Viman Nagar", "Kharadi", "Kalyani Nagar", "Koregaon Park", "Wagholi", "Wadgaon Sheri", "Yerwada", "Magarpatta"].map((a) => (
                <div key={a} className="flex items-center gap-2 text-brand-ink"><span className="w-1.5 h-1.5 bg-brand-secondary rounded-full" /> {a}</div>
              ))}
            </div>
          </div>
          <div className="rounded-3xl overflow-hidden shadow-soft border border-brand-border h-[360px]">
            <iframe
              title="PetVilla Map"
              src={`https://www.google.com/maps?q=${encodeURIComponent(info.address)}&output=embed`}
              className="w-full h-full"
              loading="lazy"
            />
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="section-pad" data-testid="home-faq-section">
        <div className="container-pv max-w-4xl">
          <div className="text-center mb-10">
            <span className="trust-badge mb-3">Frequently Asked Questions</span>
            <h2 className="font-display font-black text-[32px] md:text-5xl text-brand-ink leading-tight">Everything you wanted to know.</h2>
          </div>
          <FAQ items={HOME_FAQS} testIdPrefix="home-faq" />
        </div>
      </section>

      {/* CTA */}
      <section className="section-pad" data-testid="home-cta-section">
        <div className="container-pv">
          <div className="bg-brand-primary text-white rounded-[32px] px-6 md:px-16 py-14 md:py-20 text-center relative overflow-hidden">
            <div className="absolute -top-20 -right-20 w-80 h-80 rounded-full bg-brand-secondary/30 blur-3xl pointer-events-none" />
            <div className="absolute -bottom-20 -left-20 w-80 h-80 rounded-full bg-brand-sage/40 blur-3xl pointer-events-none" />
            <h2 className="relative font-display font-black text-3xl md:text-5xl leading-tight max-w-3xl mx-auto">Ready to give your pet a real home while you're away?</h2>
            <p className="relative text-white/85 mt-4 text-lg max-w-xl mx-auto">Book in 90 seconds. We confirm on WhatsApp within 30 minutes.</p>
            <div className="relative mt-7 flex flex-wrap gap-3 justify-center">
              <Link to="/book" className="bg-white text-brand-primary hover:bg-brand-bg transition-all rounded-full px-8 py-3 font-display font-bold shadow-lg" data-testid="cta-book-btn">Book a Service</Link>
              <a href={waLink} target="_blank" rel="noreferrer" className="bg-[#25D366] hover:bg-[#1ea957] transition-all rounded-full px-8 py-3 font-display font-bold inline-flex items-center gap-2" data-testid="cta-whatsapp-btn"><MessageCircle size={18} /> WhatsApp Us</a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
