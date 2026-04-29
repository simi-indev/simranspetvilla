import React from "react";
import { api, adminHeaders } from "../../lib/api";
import { Star, Edit, Trash2, Plus, Eye, EyeOff, Save } from "lucide-react";
import { toast } from "sonner";
import { Input } from "./AdminUI";

function ReviewModal({ review, onClose, onSaved }) {
  const [form, setForm] = React.useState(
    review || { name: "", pet: "", rating: 5, service: "", text: "", visible: true }
  );
  const [saving, setSaving] = React.useState(false);

  const save = async (e) => {
    e.preventDefault();
    if (!form.name || !form.text) {
      toast.error("Name and text are required");
      return;
    }
    setSaving(true);
    try {
      if (review) {
        await api.patch(`/admin/reviews/${review.id}`, form, { headers: adminHeaders() });
      } else {
        await api.post("/admin/reviews", form, { headers: adminHeaders() });
      }
      toast.success(review ? "Review updated" : "Review added");
      onSaved();
    } catch (err) {
      toast.error("Save failed");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center p-4 bg-black/40" onClick={onClose} data-testid="review-modal">
      <form onClick={(e) => e.stopPropagation()} onSubmit={save} className="bg-white rounded-3xl p-6 md:p-8 w-full max-w-lg shadow-2xl max-h-[90vh] overflow-y-auto">
        <h3 className="font-display font-black text-xl text-brand-ink mb-4">{review ? "Edit review" : "Add review"}</h3>
        <div className="space-y-3">
          <Input label="Name" value={form.name} onChange={(v) => setForm({ ...form, name: v })} testid="review-name-input" />
          <Input label="Pet (optional)" value={form.pet || ""} onChange={(v) => setForm({ ...form, pet: v })} testid="review-pet-input" placeholder="Bruno (Labrador)" />
          <div className="grid grid-cols-2 gap-3">
            <label className="block">
              <span className="block text-sm font-display font-bold text-brand-ink mb-1.5">Rating</span>
              <select
                value={form.rating}
                onChange={(e) => setForm({ ...form, rating: parseInt(e.target.value, 10) })}
                className="w-full p-3 px-4 bg-brand-bg border-2 border-brand-border rounded-2xl outline-none focus:border-brand-primary"
                data-testid="review-rating-input"
              >
                {[5, 4, 3, 2, 1].map((n) => <option key={n} value={n}>{n}★</option>)}
              </select>
            </label>
            <Input label="Service" value={form.service || ""} onChange={(v) => setForm({ ...form, service: v })} testid="review-service-input" placeholder="Pet Boarding" />
          </div>
          <label className="block">
            <span className="block text-sm font-display font-bold text-brand-ink mb-1.5">Review text</span>
            <textarea
              rows={4}
              value={form.text}
              onChange={(e) => setForm({ ...form, text: e.target.value })}
              className="w-full p-3 px-4 bg-brand-bg border-2 border-brand-border rounded-2xl outline-none focus:border-brand-primary resize-none"
              data-testid="review-text-input"
            />
          </label>
          <label className="flex items-center gap-2 text-sm text-brand-ink">
            <input
              type="checkbox"
              checked={form.visible}
              onChange={(e) => setForm({ ...form, visible: e.target.checked })}
              className="w-4 h-4 accent-brand-primary"
              data-testid="review-visible-input"
            />
            Visible on website
          </label>
        </div>
        <div className="mt-6 flex gap-2 justify-end">
          <button type="button" onClick={onClose} className="px-4 py-2 rounded-xl border border-brand-border" data-testid="review-cancel-btn">Cancel</button>
          <button type="submit" disabled={saving} className="btn-primary py-2 px-5" data-testid="review-save-btn">
            <Save size={14} /> {saving ? "Saving…" : "Save"}
          </button>
        </div>
      </form>
    </div>
  );
}

function ReviewRow({ review, onToggle, onEdit, onDelete }) {
  return (
    <div className={`card-pv ${!review.visible ? "opacity-60" : ""}`} data-testid={`review-row-${review.id}`}>
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span className="font-display font-bold text-brand-ink">{review.name}</span>
            <span className="flex items-center gap-0.5">
              {[...Array(review.rating)].map((_, i) => <Star key={`${review.id}-s-${i}`} size={12} className="text-yellow-500" fill="currentColor" />)}
            </span>
            {!review.visible && <span className="text-xs px-2 py-0.5 bg-red-50 text-red-700 rounded-full">Hidden</span>}
            {review.rating < 4 && <span className="text-xs px-2 py-0.5 bg-orange-50 text-orange-700 rounded-full">Auto-filtered (low rating)</span>}
          </div>
          <div className="text-xs text-brand-muted mb-2">{review.pet || "—"} · {review.service || "General"}</div>
          <p className="text-brand-ink leading-relaxed text-sm">"{review.text}"</p>
        </div>
        <div className="flex flex-col gap-1.5 shrink-0">
          <button onClick={() => onToggle(review)} className="p-2 rounded-xl hover:bg-brand-sage/40 text-brand-muted" title={review.visible ? "Hide" : "Show"} data-testid={`toggle-review-${review.id}`}>
            {review.visible ? <Eye size={16} /> : <EyeOff size={16} />}
          </button>
          <button onClick={() => onEdit(review)} className="p-2 rounded-xl hover:bg-brand-sage/40 text-brand-primary" title="Edit" data-testid={`edit-review-${review.id}`}>
            <Edit size={16} />
          </button>
          <button onClick={() => onDelete(review)} className="p-2 rounded-xl hover:bg-red-50 text-red-500" title="Delete" data-testid={`delete-review-${review.id}`}>
            <Trash2 size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}

export default function ReviewsTab({ reviews, reload }) {
  const [editing, setEditing] = React.useState(null);
  const [creating, setCreating] = React.useState(false);

  const toggleVisible = async (r) => {
    try {
      await api.patch(`/admin/reviews/${r.id}`, { visible: !r.visible }, { headers: adminHeaders() });
      toast.success(r.visible ? "Review hidden from website" : "Review now visible");
      reload();
    } catch (err) {
      toast.error("Failed to update");
    }
  };

  const remove = async (r) => {
    if (!window.confirm(`Delete review by ${r.name}?`)) return;
    try {
      await api.delete(`/admin/reviews/${r.id}`, { headers: adminHeaders() });
      toast.success("Review deleted");
      reload();
    } catch (err) {
      toast.error("Failed to delete");
    }
  };

  const closeModal = () => { setEditing(null); setCreating(false); };
  const onSaved = () => { closeModal(); reload(); };
  const reviewCountLabel = `${reviews.length} review${reviews.length !== 1 ? "s" : ""}`;

  return (
    <div data-testid="reviews-tab">
      <div className="flex items-center justify-between mb-4">
        <div className="text-sm text-brand-muted">{reviewCountLabel} · only ratings ≥4★ and visible ones show on the website</div>
        <button onClick={() => setCreating(true)} className="btn-primary text-sm py-2 px-4" data-testid="add-review-btn">
          <Plus size={14} /> Add review
        </button>
      </div>
      <div className="space-y-3">
        {reviews.length === 0 ? (
          <div className="card-pv text-center text-brand-muted py-12">No reviews yet.</div>
        ) : (
          reviews.map((r) => (
            <ReviewRow key={r.id} review={r} onToggle={toggleVisible} onEdit={setEditing} onDelete={remove} />
          ))
        )}
      </div>
      {(editing || creating) && (
        <ReviewModal review={editing} onClose={closeModal} onSaved={onSaved} />
      )}
    </div>
  );
}
