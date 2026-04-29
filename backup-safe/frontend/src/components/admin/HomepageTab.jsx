import React from "react";
import { api, adminHeaders } from "../../lib/api";
import { toast } from "sonner";
import { Save, Plus, Trash2 } from "lucide-react";

const DEFAULT = {
  hero_headline: "",
  hero_subtext: "",
  hero_cta_primary: "Book a Service",
  hero_cta_secondary: "See Services",
  hero_image: "",
  gallery_images: [],
  how_it_works: [
    { step: 1, title: "", description: "" },
    { step: 2, title: "", description: "" },
    { step: 3, title: "", description: "" },
  ],
  trust_bar_items: [],
};

export default function HomepageTab({ reload }) {
  const [form, setForm] = React.useState(DEFAULT);
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);

  React.useEffect(() => {
    api.get("/homepage-content").then((res) => {
      setForm({ ...DEFAULT, ...res.data });
    }).catch(() => {
      toast.error("Failed to load homepage content");
    }).finally(() => setLoading(false));
  }, []);

  const save = async () => {
    setSaving(true);
    try {
      await api.put("/admin/homepage-content", form, { headers: adminHeaders() });
      toast.success("Homepage updated! Changes are live.");
      if (reload) reload();
    } catch {
      toast.error("Failed to save homepage content");
    } finally {
      setSaving(false);
    }
  };

  const updateStep = (idx, field, val) => {
    const steps = [...form.how_it_works];
    steps[idx] = { ...steps[idx], [field]: val };
    setForm({ ...form, how_it_works: steps });
  };

  const updateTrustItem = (idx, val) => {
    const items = [...form.trust_bar_items];
    items[idx] = val;
    setForm({ ...form, trust_bar_items: items });
  };

  const addTrustItem = () => setForm({ ...form, trust_bar_items: [...form.trust_bar_items, ""] });
  const removeTrustItem = (idx) => setForm({ ...form, trust_bar_items: form.trust_bar_items.filter((_, i) => i !== idx) });

  const updateGalleryItem = (idx, val) => {
    const items = [...(form.gallery_images || [])];
    items[idx] = val;
    setForm({ ...form, gallery_images: items });
  };
  const addGalleryItem = () => setForm({ ...form, gallery_images: [...(form.gallery_images || []), ""] });
  const removeGalleryItem = (idx) => setForm({ ...form, gallery_images: (form.gallery_images || []).filter((_, i) => i !== idx) });

  if (loading) return <div className="card-pv text-center text-brand-muted py-12">Loading…</div>;

  return (
    <div className="space-y-6" data-testid="homepage-tab">

      {/* Hero Section */}
      <div className="card-pv space-y-4">
        <h3 className="font-display font-black text-lg text-brand-ink">Hero Section</h3>

        <Field
          label="Hero Headline"
          value={form.hero_headline}
          onChange={(v) => setForm({ ...form, hero_headline: v })}
          testid="hero-headline"
          placeholder="Pune's Most Trusted Cage-Free Pet Care"
        />
        <Field
          label="Hero Image URL"
          value={form.hero_image}
          onChange={(v) => setForm({ ...form, hero_image: v })}
          testid="hero-image"
          placeholder="/static/uploads/hero/... or https://..."
        />
        {form.hero_image && (
          <img src={form.hero_image} alt="Hero preview" className="h-40 w-full object-cover rounded-2xl border border-brand-border" />
        )}

        <div>
          <label className="block text-sm font-display font-bold text-brand-ink mb-1.5">Hero Subtext</label>
          <textarea
            value={form.hero_subtext}
            onChange={(e) => setForm({ ...form, hero_subtext: e.target.value })}
            rows={2}
            placeholder="Boarding, grooming, daycare…"
            className="w-full p-3 px-4 bg-brand-bg border-2 border-brand-border rounded-2xl outline-none focus:border-brand-primary focus:bg-white resize-none"
            data-testid="hero-subtext"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Field
            label="Primary Button Text"
            value={form.hero_cta_primary}
            onChange={(v) => setForm({ ...form, hero_cta_primary: v })}
            testid="hero-cta-primary"
          />
          <Field
            label="Secondary Button Text"
            value={form.hero_cta_secondary}
            onChange={(v) => setForm({ ...form, hero_cta_secondary: v })}
            testid="hero-cta-secondary"
          />
        </div>
      </div>

      {/* Trust Bar */}
      <div className="card-pv space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-display font-black text-lg text-brand-ink">Trust Bar Badges</h3>
          <button
            onClick={addTrustItem}
            className="flex items-center gap-1 text-sm text-brand-primary font-bold"
            data-testid="add-trust-item"
          >
            <Plus size={14} /> Add badge
          </button>
        </div>
        <p className="text-xs text-brand-muted">These appear as small badges below the hero — e.g. "4.8★ on Google", "Cage-free", "Open 24/7"</p>
        <div className="space-y-2">
          {form.trust_bar_items.map((item, idx) => (
            <div key={idx} className="flex gap-2">
              <input
                value={item}
                onChange={(e) => updateTrustItem(idx, e.target.value)}
                placeholder="e.g. Cage-free"
                className="flex-1 p-2 px-3 bg-brand-bg border border-brand-border rounded-xl outline-none focus:border-brand-primary text-sm"
                data-testid={`trust-item-${idx}`}
              />
              <button
                onClick={() => removeTrustItem(idx)}
                className="p-2 text-red-400 hover:bg-red-50 rounded-xl"
                data-testid={`remove-trust-${idx}`}
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Gallery Section */}
      <div className="card-pv space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-display font-black text-lg text-brand-ink">Gallery Images</h3>
          <button
            onClick={addGalleryItem}
            className="flex items-center gap-1 text-sm text-brand-primary font-bold"
            data-testid="add-gallery-item"
          >
            <Plus size={14} /> Add image
          </button>
        </div>
        <p className="text-xs text-brand-muted">These appear in the gallery section on Home and Reviews pages. Recommend 6 images.</p>
        <div className="grid md:grid-cols-2 gap-4">
          {(form.gallery_images || []).map((item, idx) => (
            <div key={idx} className="space-y-2 border border-brand-border p-3 rounded-2xl bg-brand-bg/50">
              <div className="flex gap-2">
                <input
                  value={item}
                  onChange={(e) => updateGalleryItem(idx, e.target.value)}
                  placeholder="Image URL"
                  className="flex-1 p-2 px-3 bg-white border border-brand-border rounded-xl outline-none focus:border-brand-primary text-sm"
                  data-testid={`gallery-item-${idx}`}
                />
                <button
                  onClick={() => removeGalleryItem(idx)}
                  className="p-2 text-red-400 hover:bg-red-50 rounded-xl"
                  data-testid={`remove-gallery-${idx}`}
                >
                  <Trash2 size={14} />
                </button>
              </div>
              {item && (
                <img src={item} alt="Preview" className="h-24 w-full object-cover rounded-lg border border-brand-border" />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* How It Works */}
      <div className="card-pv space-y-4">
        <h3 className="font-display font-black text-lg text-brand-ink">How It Works (3 Steps)</h3>
        <div className="space-y-4">
          {(form.how_it_works || []).map((step, idx) => (
            <div key={idx} className="bg-brand-bg rounded-2xl p-4 space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-brand-primary text-white flex items-center justify-center text-sm font-bold flex-shrink-0">
                  {idx + 1}
                </div>
                <input
                  value={step.title}
                  onChange={(e) => updateStep(idx, "title", e.target.value)}
                  placeholder={`Step ${idx + 1} title`}
                  className="flex-1 p-2 px-3 border border-brand-border rounded-xl outline-none focus:border-brand-primary text-sm bg-white font-display font-bold"
                  data-testid={`step-title-${idx}`}
                />
              </div>
              <textarea
                value={step.description}
                onChange={(e) => updateStep(idx, "description", e.target.value)}
                placeholder="Step description…"
                rows={2}
                className="w-full p-2 px-3 border border-brand-border rounded-xl outline-none focus:border-brand-primary text-sm bg-white resize-none"
                data-testid={`step-desc-${idx}`}
              />
            </div>
          ))}
        </div>
      </div>

      <button
        onClick={save}
        disabled={saving}
        className="inline-flex items-center gap-2 px-8 py-3 bg-brand-primary text-white rounded-full font-display font-bold hover:bg-brand-primary-hover transition-all disabled:opacity-60"
        data-testid="save-homepage"
      >
        <Save size={16} /> {saving ? "Saving…" : "Save homepage content"}
      </button>
    </div>
  );
}

function Field({ label, value, onChange, testid, placeholder = "" }) {
  return (
    <label className="block">
      <span className="block text-sm font-display font-bold text-brand-ink mb-1.5">{label}</span>
      <input
        value={value ?? ""}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full p-3 px-4 bg-brand-bg border-2 border-brand-border rounded-2xl outline-none focus:border-brand-primary focus:bg-white"
        data-testid={testid}
      />
    </label>
  );
}
