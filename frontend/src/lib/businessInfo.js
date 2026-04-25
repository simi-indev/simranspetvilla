import React from "react";
import { api } from "./api";

const DEFAULT_INFO = {
  name: "Simran's PetVilla",
  tagline: "Your Pet's Second Home",
  rating: 4.8,
  review_count: 500,
  phone_primary: "+91 99889 75056",
  phone_secondary: "+91 77608 34823",
  whatsapp_number: "919988975056",
  email: "simran.kaurgill9@gmail.com",
  address: "Suryasadan, Sr. No. 76/1/1, Sant Nagar, Lohegaon-Wagholi Road, Lane 9, near Indian Oil Petrol Pump, Lohegaon, Pune, Maharashtra 411047",
  city: "Pune",
  pincode: "411047",
  hours: "Open 24 hours · 7 days a week",
  google_maps_url: "https://maps.app.goo.gl/xQ543QJ34P9vnNRE9",
  google_review_url: "https://maps.app.goo.gl/xQ543QJ34P9vnNRE9",
  instagram_url: "https://instagram.com/simranspetvilla",
  facebook_url: "https://facebook.com/simranspetvilla",
  founder_name: "Simran Kaur Gill",
  tags: ["Cage-free", "Women-owned", "LGBTQ+ friendly", "24/7 care", "500+ happy pet parents"],
};

const BusinessInfoContext = React.createContext(DEFAULT_INFO);

export function BusinessInfoProvider({ children }) {
  const [info, setInfo] = React.useState(() => {
    try {
      const cached = localStorage.getItem("pv_business_info");
      return cached ? { ...DEFAULT_INFO, ...JSON.parse(cached) } : DEFAULT_INFO;
    } catch { return DEFAULT_INFO; }
  });

  const refresh = React.useCallback(async () => {
    try {
      const res = await api.get("/business-info");
      setInfo({ ...DEFAULT_INFO, ...res.data });
      localStorage.setItem("pv_business_info", JSON.stringify(res.data));
    } catch (e) { /* fail silently, keep defaults */ }
  }, []);

  React.useEffect(() => { refresh(); }, [refresh]);

  return (
    <BusinessInfoContext.Provider value={{ info, refresh }}>
      {children}
    </BusinessInfoContext.Provider>
  );
}

export function useBusinessInfo() {
  return React.useContext(BusinessInfoContext);
}

export function buildWhatsAppLink(number, msg = "Hi! I'd like to know more about Simran's PetVilla services.") {
  const clean = (number || "919988975056").replace(/\D/g, "");
  return `https://wa.me/${clean}?text=${encodeURIComponent(msg)}`;
}
