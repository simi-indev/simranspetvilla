import React from "react";
import { Link } from "react-router-dom";
import { Heart, Shield, Star, Award, Home as HomeIcon, Clock, Utensils, Truck } from "lucide-react";
import { useBusinessInfo } from "../lib/businessInfo";

export default function AboutPage() {
  const { info } = useBusinessInfo();
  return (
    <div data-testid="about-page">
      <section className="section-pad bg-brand-bg border-b border-brand-border">
        <div className="container-pv grid md:grid-cols-2 gap-12 items-center">
          <div>
            <span className="trust-badge mb-3">Our story</span>
            <h1 className="font-display font-black text-4xl md:text-[52px] text-brand-ink leading-tight">{info.tagline}. A real home, not a kennel.</h1>
            <p className="text-brand-muted mt-5 text-lg leading-relaxed">
              I'm <strong className="text-brand-ink">{info.founder_name}</strong>. Years ago I started boarding a few dogs in my own home in Lohegaon because I couldn't bear to see them in cages. What began as a favour to friends turned into one of Pune's most-loved cage-free pet care homes — rated <strong className="text-brand-primary">{info.rating}★</strong> by over <strong className="text-brand-primary">{info.review_count}+ pet parents</strong>.
            </p>
            <p className="text-brand-muted mt-4 text-lg leading-relaxed">
              At Simran's PetVilla we believe pets aren't just animals — they're family. Our mission is to provide pets with a safe, fun, nurturing environment while giving pet parents complete peace of mind. We're open <strong className="text-brand-ink">24 hours a day, 7 days a week</strong>, with emergency vet care just minutes away.
            </p>
            <div className="mt-5 flex flex-wrap gap-2">
              {(info.tags || []).map((t) => <span key={t} className="trust-badge">{t}</span>)}
            </div>
          </div>
          <div className="rounded-3xl overflow-hidden shadow-hover aspect-[4/5]">
            <img loading="lazy" src="https://images.unsplash.com/photo-1534361960057-19889db9621e?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2Njl8MHwxfHNlYXJjaHwxfHxoYXBweSUyMGRvZ3xlbnwwfHx8fDE3NzcwOTk3ODR8MA&ixlib=rb-4.1.0&q=85" alt="Simran with dogs" className="w-full h-full object-cover" />
          </div>
        </div>
      </section>

      <section className="section-pad" data-testid="values-section">
        <div className="container-pv">
          <div className="max-w-2xl mb-12">
            <span className="trust-badge mb-3">Why choose us</span>
            <h2 className="font-display font-black text-3xl md:text-5xl text-brand-ink leading-tight">Cage-free is not a marketing line. It's a promise.</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-5">
            {[
              { icon: HomeIcon, t: "Spacious & hygienic", d: "Dedicated areas for play, relaxation and grooming. Pets sleep on real beds — never kennels." },
              { icon: Utensils, t: "Home-cooked meals", d: "Wholesome, fresh food made with love — because your pet deserves more than processed kibble." },
              { icon: Clock, t: "Open 24 hours", d: "Pet lovers on duty round-the-clock. Drop-off, pickup and emergency support — anytime." },
              { icon: Truck, t: "Pickup & drop", d: "Hassle-free transport across Pune. We come to you so your pet's day starts and ends stress-free." },
              { icon: Heart, t: "Vet on call", d: "Partner emergency vet minutes away. We've never had a serious incident in our care." },
              { icon: Star, t: `${info.rating}★ on Google`, d: `${info.review_count}+ verified reviews from real Pune pet parents. We respond to every single one within 24 hours.` },
            ].map((v, i) => {
              const Icon = v.icon;
              return (
                <div key={v.t} className="card-pv" data-testid={`value-${i}`}>
                  <div className="w-12 h-12 rounded-2xl bg-brand-sage text-brand-primary flex items-center justify-center mb-4"><Icon size={22} /></div>
                  <h3 className="font-display font-extrabold text-xl mb-1.5">{v.t}</h3>
                  <p className="text-brand-muted leading-relaxed">{v.d}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="section-pad bg-brand-sage/40">
        <div className="container-pv text-center">
          <h2 className="font-display font-black text-3xl md:text-5xl text-brand-ink">Come visit before you book.</h2>
          <p className="text-brand-muted mt-4 text-lg max-w-xl mx-auto">A 30-minute walk-through so your pet (and you) feel comfortable.</p>
          <Link to="/contact" className="btn-primary mt-7" data-testid="about-contact-btn">Schedule a visit</Link>
        </div>
      </section>
    </div>
  );
}
