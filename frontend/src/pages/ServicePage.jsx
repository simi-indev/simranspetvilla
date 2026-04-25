import React from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import * as LucideIcons from "lucide-react";
import { api } from "../lib/api";
import { useBusinessInfo, buildWhatsAppLink } from "../lib/businessInfo";
import FAQ from "../components/FAQ";
import ServiceCard from "../components/ServiceCard";
import { Check, ArrowRight, Calendar, MessageCircle } from "lucide-react";

export default function ServicePage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { info } = useBusinessInfo();
  const [service, setService] = React.useState(null);
  const [allServices, setAllServices] = React.useState([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    setLoading(true);
    api.get(`/services/${slug}`)
      .then((r) => setService(r.data))
      .catch(() => setService(null))
      .finally(() => setLoading(false));
    api.get("/services").then((r) => setAllServices(r.data));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug]);

  if (loading) return <div className="container-pv py-20 text-center text-brand-muted" data-testid="service-loading">Loading…</div>;
  if (!service) return (
    <div className="container-pv py-20 text-center" data-testid="service-not-found">
      <h1 className="font-display font-bold text-2xl">Service not found</h1>
      <Link to="/services" className="btn-primary mt-6">Browse all services</Link>
    </div>
  );

  const Icon = LucideIcons[service.icon] || LucideIcons.PawPrint;
  const related = allServices.filter((s) => s.slug !== slug).slice(0, 3);

  return (
    <div data-testid={`service-page-${slug}`}>
      {/* Hero */}
      <section className="bg-brand-bg border-b border-brand-border">
        <div className="container-pv py-12 md:py-20 grid md:grid-cols-2 gap-10 items-center">
          <div>
            <Link to="/services" className="text-sm text-brand-muted hover:text-brand-primary mb-4 inline-block" data-testid="breadcrumb-back">← All services</Link>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-2xl bg-brand-primary text-white flex items-center justify-center"><Icon size={24} /></div>
              <span className="font-display font-bold text-brand-primary">{service.name}</span>
            </div>
            <h1 className="font-display font-black text-4xl md:text-[52px] text-brand-ink leading-tight">{service.tagline}</h1>
            <p className="text-brand-muted mt-5 text-lg leading-relaxed">{service.description}</p>
            <div className="mt-6 flex items-center gap-4">
              <div>
                <div className="text-sm text-brand-muted">Starting at</div>
                <div className="font-display font-black text-3xl text-brand-secondary">₹{service.starting_price}<span className="text-base font-normal text-brand-muted">/{service.unit}</span></div>
              </div>
              <div className="text-sm text-brand-muted border-l border-brand-border pl-4">up to ₹{service.max_price}/{service.unit}<br />based on size & breed</div>
            </div>
            <div className="mt-7 flex flex-wrap gap-3">
              <button onClick={() => navigate(`/book?service=${service.slug}`)} className="btn-primary" data-testid="service-book-btn"><Calendar size={18} /> Book {service.name}</button>
              <a href={buildWhatsAppLink(info.whatsapp_number, `Hi, I'd like to know more about ${service.name}.`)} target="_blank" rel="noreferrer" className="btn-outline" data-testid="service-whatsapp-btn"><MessageCircle size={18} /> Ask on WhatsApp</a>
            </div>
          </div>
          <div className="aspect-[4/3] rounded-3xl overflow-hidden shadow-hover">
            <img src={service.image} alt={service.name} className="w-full h-full object-cover" />
          </div>
        </div>
      </section>

      {/* What's Included */}
      <section className="section-pad" data-testid="includes-section">
        <div className="container-pv grid md:grid-cols-2 gap-12 items-start">
          <div>
            <span className="trust-badge mb-3">What's included</span>
            <h2 className="font-display font-black text-3xl md:text-5xl text-brand-ink leading-tight">Everything your pet deserves.</h2>
            <p className="text-brand-muted mt-4 text-lg">No upsells. No surprise fees. The price you see is what you pay.</p>
          </div>
          <ul className="space-y-3">
            {service.includes.map((item, i) => (
              <li key={item} className="flex items-start gap-3 bg-white border border-brand-border rounded-2xl p-4 shadow-soft" data-testid={`include-${i}`}>
                <div className="w-8 h-8 rounded-xl bg-brand-sage flex items-center justify-center text-brand-primary shrink-0"><Check size={18} strokeWidth={3} /></div>
                <span className="text-brand-ink font-medium pt-1">{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* How to Book */}
      <section className="section-pad bg-white border-y border-brand-border" data-testid="how-to-book-section">
        <div className="container-pv">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="trust-badge mb-3">How to book</span>
            <h2 className="font-display font-black text-3xl md:text-5xl text-brand-ink leading-tight">Three quick steps.</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { n: "1", t: "Fill the form", d: "Tell us about your pet, dates and address." },
              { n: "2", t: "We confirm on WhatsApp", d: "Within 30 minutes — pricing and availability." },
              { n: "3", t: "Pet care happens", d: "We deliver the service. You relax." },
            ].map((s) => (
              <div key={s.n} className="card-pv">
                <div className="w-10 h-10 rounded-2xl bg-brand-secondary text-white flex items-center justify-center font-display font-extrabold mb-4">{s.n}</div>
                <h3 className="font-display font-extrabold text-xl mb-1.5">{s.t}</h3>
                <p className="text-brand-muted">{s.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="section-pad" data-testid="service-faq-section">
        <div className="container-pv max-w-4xl">
          <div className="text-center mb-10">
            <span className="trust-badge mb-3">FAQs</span>
            <h2 className="font-display font-black text-3xl md:text-5xl text-brand-ink leading-tight">Common questions.</h2>
          </div>
          <FAQ items={service.faqs} testIdPrefix="service-faq" />
        </div>
      </section>

      {/* Related */}
      <section className="section-pad bg-brand-sage/30" data-testid="related-services-section">
        <div className="container-pv">
          <div className="flex items-end justify-between flex-wrap gap-4 mb-8">
            <h2 className="font-display font-black text-3xl md:text-4xl text-brand-ink">Other services you might love</h2>
            <Link to="/services" className="text-brand-primary font-display font-bold inline-flex items-center gap-1.5">All services <ArrowRight size={16} /></Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {related.map((s) => <ServiceCard key={s.slug} service={s} />)}
          </div>
        </div>
      </section>
    </div>
  );
}
