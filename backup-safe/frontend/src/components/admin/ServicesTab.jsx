import React from "react";
import { api, adminHeaders } from "../../lib/api";
import { toast } from "sonner";
import { Edit2, Save, X, Plus, Trash2, ChevronDown, ChevronUp } from "lucide-react";

const ICON_OPTIONS = ["Home", "Sun", "Scissors", "Heart", "UtensilsCrossed", "GraduationCap"];

export default function ServicesTab({ reload }) {
  const [services, setServices] = React.useState([]);
  const [editing, setEditing] = React.useState(null); // slug of service being edited
  const [form, setForm] = React.useState({});
  const [saving, setSaving] = React.useState(false);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    loadServices();
  }, []);

  const loadServices = async () => {
    setLoading(true);
    try {
      const res = await api.get("/admin/services", { headers: adminHeaders() });
      setServices(res.data);
    } catch {
      toast.error("Failed to load services");
    } finally {
      setLoading(false);
    }
  };

  const startEdit = (svc) => {
    setEditing(svc.slug);
    setForm({
      name: svc.name,
      tagline: svc.tagline,
      starting_price: svc.starting_price,
      max_price: svc.max_price,
      unit: svc.unit,
      description: svc.description,
      includes: [...(svc.includes || [])],
      faqs: [...(svc.faqs || [])],
      image: svc.image || "",
    });
  };

  const cancelEdit = () => {
    setEditing(null);
    setForm({});
  };

  const save = async (slug) => {
    setSaving(true);
    try {
      await api.put(`/admin/services/${slug}`, form, { headers: adminHeaders() });
      toast.success("Service updated!");
      setEditing(null);
      loadServices();
      if (reload) reload();
    } catch {
      toast.error("Failed to save service");
    } finally {
      setSaving(false);
    }
  };

  const updateInclude = (idx, val) => {
    const updated = [...form.includes];
    updated[idx] = val;
    setForm({ ...form, includes: updated });
  };

  const addInclude = () => setForm({ ...form, includes: [...form.includes, ""] });
  const removeInclude = (idx) => setForm({ ...form, includes: form.includes.filter((_, i) => i !== idx) });

  const updateFaq = (idx, field, val) => {
    const updated = [...form.faqs];
    updated[idx] = { ...updated[idx], [field]: val };
    setForm({ ...form, faqs: updated });
  };
  const addFaq = () => setForm({ ...form, faqs: [...form.faqs, { q: "", a: "" }] });
  const removeFaq = (idx) => setForm({ ...form, faqs: form.faqs.filter((_, i) => i !== idx) });

  if (loading) return <div className="card-pv text-center text-brand-muted py-12">Loading services…</div>;

  return (
    <div className="space-y-4" data-testid="services-tab">
      {services.map((svc) => (
        <div key={svc.slug} className="card-pv" data-testid={`service-card-${svc.slug}`}>
          {editing === svc.slug ? (
            <div className="space-y-5">
              <div className="flex items-center justify-between">
                <h3 className="font-display font-black text-lg text-brand-ink">Editing: {svc.name}</h3>
                <button onClick={cancelEdit} className="p-2 hover:bg-brand-bg rounded-xl text-brand-muted" data-testid="cancel-edit-service">
                  <X size={18} />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Field label="Service Name" value={form.name} onChange={(v) => setForm({ ...form, name: v })} testid="service-name" />
                <Field label="Tagline" value={form.tagline} onChange={(v) => setForm({ ...form, tagline: v })} testid="service-tagline" />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <Field label="Starting Price (₹)" type="number" value={form.starting_price} onChange={(v) => setForm({ ...form, starting_price: Number(v) })} testid="service-start-price" />
                <Field label="Max Price (₹)" type="number" value={form.max_price} onChange={(v) => setForm({ ...form, max_price: Number(v) })} testid="service-max-price" />
                <Field label="Unit (night/day/session/visit)" value={form.unit} onChange={(v) => setForm({ ...form, unit: v })} testid="service-unit" />
              </div>

              <div>
                <label className="block text-sm font-display font-bold text-brand-ink mb-1.5">Description</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  rows={3}
                  className="w-full p-3 px-4 bg-brand-bg border-2 border-brand-border rounded-2xl outline-none focus:border-brand-primary focus:bg-white resize-none"
                  data-testid="service-description"
                />
              </div>

              <Field label="Image URL" value={form.image} onChange={(v) => setForm({ ...form, image: v })} testid="service-image" placeholder="https://... or /static/uploads/..." />
              {form.image && (
                <img src={form.image} alt="preview" className="h-32 w-full object-cover rounded-2xl border border-brand-border" />
              )}

              {/* Includes */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-display font-bold text-brand-ink">What's Included</span>
                  <button onClick={addInclude} className="flex items-center gap-1 text-xs text-brand-primary font-bold" data-testid="add-include">
                    <Plus size={14} /> Add item
                  </button>
                </div>
                <div className="space-y-2">
                  {form.includes.map((item, idx) => (
                    <div key={idx} className="flex gap-2">
                      <input
                        value={item}
                        onChange={(e) => updateInclude(idx, e.target.value)}
                        className="flex-1 p-2 px-3 bg-brand-bg border border-brand-border rounded-xl outline-none focus:border-brand-primary text-sm"
                        data-testid={`include-${idx}`}
                      />
                      <button onClick={() => removeInclude(idx)} className="p-2 text-red-400 hover:bg-red-50 rounded-xl" data-testid={`remove-include-${idx}`}>
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* FAQs */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-display font-bold text-brand-ink">FAQs</span>
                  <button onClick={addFaq} className="flex items-center gap-1 text-xs text-brand-primary font-bold" data-testid="add-faq">
                    <Plus size={14} /> Add FAQ
                  </button>
                </div>
                <div className="space-y-3">
                  {form.faqs.map((faq, idx) => (
                    <div key={idx} className="bg-brand-bg rounded-2xl p-3 space-y-2">
                      <div className="flex gap-2">
                        <input
                          value={faq.q}
                          onChange={(e) => updateFaq(idx, "q", e.target.value)}
                          placeholder="Question"
                          className="flex-1 p-2 px-3 border border-brand-border rounded-xl outline-none focus:border-brand-primary text-sm bg-white"
                          data-testid={`faq-q-${idx}`}
                        />
                        <button onClick={() => removeFaq(idx)} className="p-2 text-red-400 hover:bg-red-50 rounded-xl" data-testid={`remove-faq-${idx}`}>
                          <Trash2 size={14} />
                        </button>
                      </div>
                      <textarea
                        value={faq.a}
                        onChange={(e) => updateFaq(idx, "a", e.target.value)}
                        placeholder="Answer"
                        rows={2}
                        className="w-full p-2 px-3 border border-brand-border rounded-xl outline-none focus:border-brand-primary text-sm bg-white resize-none"
                        data-testid={`faq-a-${idx}`}
                      />
                    </div>
                  ))}
                </div>
              </div>

              <button
                onClick={() => save(svc.slug)}
                disabled={saving}
                className="inline-flex items-center gap-2 px-6 py-3 bg-brand-primary text-white rounded-full font-display font-bold text-sm hover:bg-brand-primary-hover transition-all disabled:opacity-60"
                data-testid="save-service"
              >
                <Save size={16} /> {saving ? "Saving…" : "Save changes"}
              </button>
            </div>
          ) : (
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                {svc.image && (
                  <img src={svc.image} alt={svc.name} className="w-16 h-16 object-cover rounded-2xl border border-brand-border flex-shrink-0" />
                )}
                <div>
                  <div className="font-display font-bold text-brand-ink">{svc.name}</div>
                  <div className="text-sm text-brand-muted">{svc.tagline}</div>
                  <div className="text-sm text-brand-primary font-semibold mt-0.5">
                    ₹{svc.starting_price}–{svc.max_price} / {svc.unit}
                  </div>
                </div>
              </div>
              <button
                onClick={() => startEdit(svc)}
                className="inline-flex items-center gap-1.5 px-4 py-2 border border-brand-border rounded-xl text-sm font-display font-bold hover:bg-brand-sage/40 transition-all flex-shrink-0"
                data-testid={`edit-service-${svc.slug}`}
              >
                <Edit2 size={14} /> Edit
              </button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

function Field({ label, value, onChange, testid, placeholder = "", type = "text" }) {
  return (
    <label className="block">
      <span className="block text-sm font-display font-bold text-brand-ink mb-1.5">{label}</span>
      <input
        type={type}
        value={value ?? ""}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full p-3 px-4 bg-brand-bg border-2 border-brand-border rounded-2xl outline-none focus:border-brand-primary focus:bg-white"
        data-testid={testid}
      />
    </label>
  );
}