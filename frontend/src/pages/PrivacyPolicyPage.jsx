import React from "react";

export default function PrivacyPolicyPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-12 bg-white text-black">
      <h1 className="text-3xl font-bold mb-2">Privacy Policy | Simran's Pet Villa</h1>
      <p className="text-sm text-gray-500 mb-8">Last updated: April 2026</p>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-3">1. Information We Collect</h2>
        <p className="text-gray-700">When you book a service or contact us, we collect your name, phone number, email address, pet details, and address. We also collect payment information processed securely via Razorpay.</p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-3">2. How We Use Your Information</h2>
        <ul className="list-disc pl-5 text-gray-700 space-y-2">
          <li>To confirm and manage your pet care bookings</li>
          <li>To contact you via WhatsApp or phone about your booking</li>
          <li>To send booking confirmations and payment receipts</li>
          <li>To improve our services based on your feedback</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-3">3. Data Sharing</h2>
        <p className="text-gray-700">We do not sell or share your personal data with third parties. Your data is only shared with payment processors (Razorpay) and used internally to provide our services.</p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-3">4. Data Storage</h2>
        <p className="text-gray-700">Your data is stored securely in our database. We retain booking records for up to 2 years for business purposes. You may request deletion of your data by contacting us.</p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-3">5. Cookies</h2>
        <p className="text-gray-700">Our website uses minimal cookies for authentication and analytics only. We do not use advertising cookies.</p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-3">6. Contact Us</h2>
        <p className="text-gray-700">For any privacy concerns, contact us at:<br />
        📞 WhatsApp: +91 your-number<br />
        📧 Email: simranspetvilla@gmail.com<br />
        📍 Pune, Maharashtra</p>
      </section>
    </div>
  );
}

// v2
