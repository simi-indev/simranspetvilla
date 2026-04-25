import React from "react";
import { api } from "../lib/api";
import ServiceCard from "../components/ServiceCard";

export default function ServicesIndexPage() {
  const [services, setServices] = React.useState([]);

  React.useEffect(() => {
    api.get("/services").then((r) => setServices(r.data)).catch(() => {});
  }, []);

  return (
    <div className="section-pad" data-testid="services-index-page">
      <div className="container-pv">
        <div className="max-w-3xl mb-10">
          <span className="trust-badge mb-3">All Services</span>
          <h1 className="font-display font-black text-4xl md:text-[52px] text-brand-ink leading-tight">Six trusted services. One cozy home.</h1>
          <p className="text-brand-muted mt-4 text-lg">Pick what your pet needs today — combine multiple to save more.</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6">
          {services.map((s) => <ServiceCard key={s.slug} service={s} />)}
        </div>
      </div>
    </div>
  );
}
