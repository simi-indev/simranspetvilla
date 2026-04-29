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
  about_image: "https://images.unsplash.com/photo-1534361960057-19889db9621e?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2Njl8MHwxfHNlYXJjaHwxfHxoYXBweSUyMGRvZ3xlbnwwfHx8fDE3NzcwOTk3ODR8MA&ixlib=rb-4.1.0&q=85",
  tags: ["Cage-free", "Women-owned", "LGBTQ+ friendly", "24/7 care", "500+ happy pet parents"],
};

const BusinessInfoContext = React.createContext({ info: DEFAULT_INFO, refresh: () => {} });

export function BusinessInfoProvider({ children }) {
  const [info, setInfo] = React.useState(() => {
    try {
      const cached = localStorage.getItem("pv_business_info");
      return cached ? { ...DEFAULT_INFO, ...JSON.parse(cached) } : DEFAULT_INFO;
    } catch (err) {
      console.warn("[BusinessInfoProvider] Failed to read cached business info:", err);
      return DEFAULT_INFO;
    }
  });

  const refresh = React.useCallback(async () => {
    try {
      const res = await api.get("/business-info");
      setInfo({ ...DEFAULT_INFO, ...res.data });
      try {
        localStorage.setItem("pv_business_info", JSON.stringify(res.data));
      } catch (storageErr) {
        console.warn("[BusinessInfoProvider] Failed to cache business info:", storageErr);
      }
    } catch (err) {
      console.warn("[BusinessInfoProvider] Failed to fetch business info, using cached/default values:", err);
    }
  }, []);

  React.useEffect(() => {
    refresh();
  }, [refresh]);

  const value = React.useMemo(() => ({ info, refresh }), [info, refresh]);

  return (
    <BusinessInfoContext.Provider value={value}>
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
