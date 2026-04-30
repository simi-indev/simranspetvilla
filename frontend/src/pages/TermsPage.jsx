import React from "react";

export default function TermsPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-2">Terms & Conditions</h1>
      <p className="text-sm text-gray-500 mb-8">Last updated: April 2026</p>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-3">1. Booking & Confirmation</h2>
        <p className="text-gray-700">All bookings are confirmed only after payment of the advance amount. We will confirm your booking via WhatsApp within 30 minutes of payment. Simran's Pet Villa reserves the right to decline any booking.</p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-3">2. Pet Requirements</h2>
        <ul className="list-disc pl-5 text-gray-700 space-y-2">
          <li>All pets must be vaccinated (Dogs: DHPPiL + Rabies, Cats: FVRCP + Rabies)</li>
          <li>Vaccination certificate must be submitted at or before check-in</li>
          <li>Pets showing signs of illness will not be accepted</li>
          <li>Aggressive pets may be declined at our discretion</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-3">3. Owner Responsibilities</h2>
        <p className="text-gray-700">Pet owners must provide accurate pet information including medical conditions, allergies, and dietary needs. Owners are responsible for any damage caused by their pet. Emergency vet decisions will be made by us if owner is unreachable.</p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-3">4. Pickup & Drop</h2>
        <p className="text-gray-700">Pickup and drop is available across Pune at ₹150–300 depending on locality. Free for stays of 7+ nights. Timings are subject to availability and will be confirmed via WhatsApp.</p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-3">5. Liability</h2>
        <p className="text-gray-700">We take utmost care of all pets. However, Simran's Pet Villa is not liable for injuries caused by pet-to-pet interaction, pre-existing medical conditions, or accidents despite reasonable care. We have a 24/7 vet on call.</p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-3">6. Contact</h2>
        <p className="text-gray-700">📞 WhatsApp: +91 your-number<br />
        📧 Email: simranspetvilla@gmail.com<br />
        📍 Pune, Maharashtra</p>
      </section>
    </div>
  );
}

// v2
