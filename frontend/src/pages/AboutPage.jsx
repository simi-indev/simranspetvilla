import React from "react";
import { Link } from "react-router-dom";
import { Heart, Shield, Star, Award, Home as HomeIcon } from "lucide-react";

export default function AboutPage() {
  return (
    <div data-testid="about-page">
      <section className="section-pad bg-brand-bg border-b border-brand-border">
        <div className="container-pv grid md:grid-cols-2 gap-12 items-center">
          <div>
            <span className="trust-badge mb-3">Our story</span>
            <h1 className="font-display font-black text-4xl md:text-[52px] text-brand-ink leading-tight">A home, not a hospital. A family, not a chain.</h1>
            <p className="text-brand-muted mt-5 text-lg leading-relaxed">
              I'm Simran. Six years ago I started boarding a few dogs in my own home in Lohegaon because I couldn't bear to see them in cages. What began as a favour to friends turned into Pune's most-reviewed cage-free pet care home.
            </p>
            <p className="text-brand-muted mt-4 text-lg leading-relaxed">
              Today, we look after 8 pets at any time — sleeping, playing, eating and getting groomed in the same warm home. Plus, our team delivers grooming, sitting, food and training across Pune to pets who prefer to stay in their own bed.
            </p>
          </div>
          <div className="rounded-3xl overflow-hidden shadow-hover aspect-[4/5]">
            <img src="https://images.unsplash.com/photo-1534361960057-19889db9621e?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2Njl8MHwxfHNlYXJjaHwxfHxoYXBweSUyMGRvZ3xlbnwwfHx8fDE3NzcwOTk3ODR8MA&ixlib=rb-4.1.0&q=85" alt="Simran with dogs" className="w-full h-full object-cover" />
          </div>
        </div>
      </section>

      <section className="section-pad" data-testid="values-section">
        <div className="container-pv">
          <div className="max-w-2xl mb-12">
            <span className="trust-badge mb-3">What makes us different</span>
            <h2 className="font-display font-black text-3xl md:text-5xl text-brand-ink leading-tight">Cage-free is not a marketing line. It's a promise.</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-5">
            {[
              { icon: HomeIcon, t: "Real home", d: "Pets sleep on dog beds in shared rooms — never in kennels or cages." },
              { icon: Shield, t: "Vaccinated only", d: "Every pet must show current vaccination certificates. Zero exceptions." },
              { icon: Heart, t: "Max 8 at a time", d: "We cap intake so every pet gets real attention — not assembly-line care." },
              { icon: Star, t: "4.4★ on Google", d: "80+ verified reviews from real Pune pet parents. We respond to every one." },
              { icon: Award, t: "6 years of experience", d: "Hundreds of stays, dozens of breeds, and one unbroken 5-star track record." },
              { icon: Heart, t: "Vet on call 24/7", d: "Partner vet 5 minutes away for emergencies. We've never had a serious incident." },
            ].map((v, i) => {
              const Icon = v.icon;
              return (
                <div key={i} className="card-pv" data-testid={`value-${i}`}>
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
