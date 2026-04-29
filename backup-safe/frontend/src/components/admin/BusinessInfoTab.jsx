import React from "react";
import { api, adminHeaders } from "../../lib/api";
import { Building2, Save } from "lucide-react";
import { toast } from "sonner";
import { Input } from "./AdminUI";

const CONTACT_FIELDS = [
  { key: "name", label: "Business name", testid: "biz-name" },
  { key: "tagline", label: "Tagline", testid: "biz-tagline" },
  { key: "founder_name", label: "Founder name", testid: "biz-founder" },
  { key: "about_image", label: "About page image URL", testid: "biz-about-image" },
  { key: "hours", label: "Hours", testid: "biz-hours" },
  { key: "rating", label: "Rating (e.g. 4.8)", testid: "biz-rating" },
  { key: "review_count", label: "Review count", testid: "biz-review-count" },
  { key: "phone_primary", label: "Primary phone", testid: "biz-phone-primary" },
  { key: "phone_secondary", label: "Secondary phone", testid: "biz-phone-secondary" },
  { key: "whatsapp_number", label: "WhatsApp number (digits, e.g. 919988975056)", testid: "biz-whatsapp" },
  { key: "email", label: "Email", testid: "biz-email" },
  { key: "google_maps_url", label: "Google Maps URL", testid: "biz-maps-url" },
  { key: "google_review_url", label: "Google Review URL", testid: "biz-review-url" },
  { key: "instagram_url", label: "Instagram URL", testid: "biz-instagram" },
  { key: "facebook_url", label: "Facebook URL", testid: "biz-facebook" },
  { key: "city", label: "City", testid: "biz-city" },
  { key: "pincode", label: "Pincode", testid: "biz-pincode" },
];

function normalizePayload(form) {
  const payload = { ...form };
  if (typeof payload.tags === "string") {
    payload.tags = payload.tags.split(",").map((t) => t.trim()).filter(Boolean);
  }
  if (typeof payload.rating === "string") {
    payload.rating = parseFloat(payload.rating) || 4.8;
  }
  if (typeof payload.review_count === "string") {
    payload.review_count = parseInt(payload.review_count, 10) || 0;
  }
  return payload;
}

export default function BusinessInfoTab({ info, reload }) {
  const [form, setForm] = React.useState(info);
  const [saving, setSaving] = React.useState(false);

  React.useEffect(() => { setForm(info); }, [info]);

  const updateField = (key) => (value) => setForm((prev) => ({ ...prev, [key]: value }));

  const save = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.put("/admin/business-info", normalizePayload(form), { headers: adminHeaders() });
      toast.success("Business info updated");
      reload();
    } catch (err) {
      toast.error("Save failed");
    } finally {
      setSaving(false);
    }
  };

  const tagsValue = Array.isArray(form.tags) ? form.tags.join(", ") : (form.tags || "");

  return (
    <form onSubmit={save} className="card-pv max-w-3xl" data-testid="business-info-tab">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-12 h-12 rounded-2xl bg-brand-sage flex items-center justify-center text-brand-primary">
          <Building2 size={22} />
        </div>
        <div>
          <h2 className="font-display font-black text-xl text-brand-ink">Business information</h2>
          <p className="text-sm text-brand-muted">Edits here update the website immediately — header, footer, contact page and trust bar.</p>
        </div>
      </div>
      <div className="grid md:grid-cols-2 gap-3">
        {CONTACT_FIELDS.map((f) => (
          <Input
            key={f.key}
            label={f.label}
            value={form[f.key] ?? ""}
            onChange={updateField(f.key)}
            testid={f.testid}
          />
        ))}
      </div>
      <label className="block mt-3">
        <span className="block text-sm font-display font-bold text-brand-ink mb-1.5">Full address</span>
        <textarea
          rows={2}
          value={form.address || ""}
          onChange={(e) => setForm({ ...form, address: e.target.value })}
          className="w-full p-3 px-4 bg-brand-bg border-2 border-brand-border rounded-2xl outline-none focus:border-brand-primary resize-none"
          data-testid="biz-address"
        />
      </label>
      <label className="block mt-3">
        <span className="block text-sm font-display font-bold text-brand-ink mb-1.5">Tags (comma-separated)</span>
        <input
          value={tagsValue}
          onChange={(e) => setForm({ ...form, tags: e.target.value })}
          className="w-full p-3 px-4 bg-brand-bg border-2 border-brand-border rounded-2xl outline-none focus:border-brand-primary"
          data-testid="biz-tags"
        />
      </label>
      <button type="submit" disabled={saving} className="btn-primary mt-6" data-testid="biz-save-btn">
        <Save size={14} /> {saving ? "Saving…" : "Save changes"}
      </button>
    </form>
  );
}
