import React from "react";
import { Plus, Percent, Trash2, ShieldCheck, CheckCircle2 } from "lucide-react";
import { Inp, SPECIES, DOG_SIZES } from "./BookingFields";

export default function StepPets({ pets, updatePet, addPet, removePet }) {
  return (
    <div data-testid="booking-step-pets">
      <div className="flex items-center justify-between mb-1">
        <h2 className="font-display font-black text-2xl text-brand-ink">Your pet{pets.length > 1 ? "s" : ""}</h2>
        <button onClick={addPet} className="flex items-center gap-1.5 text-sm font-display font-bold text-brand-primary hover:underline" data-testid="add-pet-btn">
          <Plus size={16} /> Add another pet
        </button>
      </div>
      {pets.length >= 2 && (
        <div className="flex items-center gap-2 bg-brand-sage/60 text-brand-primary text-sm font-display font-bold px-4 py-2 rounded-full w-fit mb-4" data-testid="multi-pet-badge">
          <Percent size={14} /> 10% multi-pet discount applied!
        </div>
      )}
      <div className="space-y-6">
        {pets.map((pet, idx) => (
          <div key={pet.id}>
            {pets.length > 1 && (
              <div className="flex items-center justify-between mb-2">
                <span className="font-display font-bold text-brand-ink">Pet {idx + 1}</span>
                <button onClick={() => removePet(idx)} className="flex items-center gap-1 text-xs text-red-500 hover:underline" data-testid={`remove-pet-${idx}`}>
                  <Trash2 size={12} /> Remove
                </button>
              </div>
            )}
            <PetForm pet={pet} onChange={(u) => updatePet(idx, u)} idx={idx} />
          </div>
        ))}
      </div>
    </div>
  );
}

function PetForm({ pet, onChange, idx }) {
  return (
    <div className="bg-brand-bg border border-brand-border rounded-2xl p-4 space-y-4" data-testid={`pet-form-${idx}`}>
      <div className="grid grid-cols-2 gap-3">
        <Inp label="Pet's Name" value={pet.name} set={(v) => onChange({ name: v })} ph="Bruno" tid={`pet-name-${idx}`} />
        <div>
          <span className="block text-sm font-display font-bold text-brand-ink mb-1.5">Species</span>
          <select className="input-pv" value={pet.species} onChange={(e) => onChange({ species: e.target.value, size: e.target.value === "Dog" ? "medium" : "" })} data-testid={`pet-species-${idx}`}>
            {SPECIES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
          </select>
        </div>
      </div>

      {pet.species === "Dog" && (
        <div>
          <span className="block text-sm font-display font-bold text-brand-ink mb-2">Size</span>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {DOG_SIZES.map((s) => (
              <button key={s.value} type="button" onClick={() => onChange({ size: s.value })} data-testid={`pet-size-${s.value}-${idx}`}
                className={`p-3 rounded-xl border-2 text-left transition-all ${pet.size === s.value ? "border-brand-primary bg-brand-sage/40" : "border-brand-border hover:border-brand-primary/50"}`}>
                <div className="font-display font-bold text-sm text-brand-ink">{s.label}</div>
                <div className="text-xs text-brand-muted">{s.desc}</div>
                <div className="text-[10px] text-brand-muted mt-0.5">{s.examples}</div>
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-3 gap-3">
        <Inp label="Breed" value={pet.breed} set={(v) => onChange({ breed: v })} ph="Labrador" tid={`pet-breed-${idx}`} />
        <Inp label="Age" value={pet.age} set={(v) => onChange({ age: v })} ph="2 years" tid={`pet-age-${idx}`} />
        <Inp label="Weight (kg)" value={pet.weight} set={(v) => onChange({ weight: v })} ph="12" tid={`pet-weight-${idx}`} />
      </div>

      <Inp label="Special needs / allergies / medications" value={pet.special_needs} set={(v) => onChange({ special_needs: v })} ph="e.g. allergic to chicken, on ear drops" tid={`pet-special-${idx}`} area />

      {(pet.species === "Dog" || pet.species === "Cat") && (
        <div className="bg-white border border-brand-border rounded-xl p-3 space-y-3">
          <div className="flex items-center gap-2">
            <ShieldCheck size={16} className="text-brand-primary" />
            <span className="text-sm font-display font-bold text-brand-ink">
              Vaccination Certificate ({pet.species === "Dog" ? "DHPPiL + Rabies" : "FVRCP + Rabies"}) *
            </span>
          </div>
          <div className="space-y-2">
            <label className="block cursor-pointer" data-testid={`pet-vacc-upload-${idx}`}>
              <input
                type="file"
                accept="image/*,.pdf"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) onChange({ vaccination_file: f.name, vaccination_at_dropoff: false });
                }}
                data-testid={`pet-vacc-file-${idx}`}
              />
              <div className={`w-full p-3 border-2 border-dashed rounded-xl text-center cursor-pointer transition-all ${pet.vaccination_file ? "border-brand-primary bg-brand-sage/30" : "border-brand-border hover:border-brand-primary/50"}`}>
                {pet.vaccination_file ? (
                  <span className="text-sm text-brand-primary font-bold flex items-center justify-center gap-2">
                    <CheckCircle2 size={14} /> {pet.vaccination_file}
                  </span>
                ) : (
                  <span className="text-sm text-brand-muted">📄 Upload vaccination certificate (photo or PDF)</span>
                )}
              </div>
            </label>
            <div className="flex items-center gap-2 text-brand-muted text-xs">
              <div className="flex-1 border-t border-brand-border" />
              <span>or</span>
              <div className="flex-1 border-t border-brand-border" />
            </div>
            <label className="flex items-center gap-3 cursor-pointer p-2 rounded-lg hover:bg-brand-bg" data-testid={`pet-vacc-dropoff-${idx}`}>
              <input
                type="checkbox"
                className="w-4 h-4 accent-brand-primary"
                checked={pet.vaccination_at_dropoff}
                onChange={(e) => onChange({ vaccination_at_dropoff: e.target.checked, vaccination_file: e.target.checked ? "" : pet.vaccination_file })}
              />
              <span className="text-sm text-brand-muted">I'll bring the certificate in person at drop-off</span>
            </label>
          </div>
          <p className="text-[11px] text-brand-muted">⚠️ Vaccination is mandatory. Without a certificate, service may be declined.</p>
        </div>
      )}

      {(pet.species === "Dog" || pet.species === "Cat") && (
        <label className="flex items-start gap-3 cursor-pointer p-3 bg-white border border-brand-border rounded-xl" data-testid={`pet-aggression-${idx}`}>
          <input type="checkbox" className="w-4 h-4 accent-brand-primary mt-0.5" checked={pet.no_aggression} onChange={(e) => onChange({ no_aggression: e.target.checked })} />
          <div>
            <span className="text-sm font-display font-bold text-brand-ink">I confirm my pet has no history of aggression</span>
            <p className="text-[11px] text-brand-muted mt-0.5">Aggressive pets cannot be accommodated for safety reasons.</p>
          </div>
        </label>
      )}
    </div>
  );
}
