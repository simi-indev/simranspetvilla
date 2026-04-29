import React from "react";

export default function RefundPolicyPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-2">Cancellation & Refund Policy</h1>
      <p className="text-sm text-gray-500 mb-8">Last updated: April 2026</p>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-3">Cancellation by Customer</h2>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="bg-gray-100">
                <th className="border p-3 text-left">Cancellation Time</th>
                <th className="border p-3 text-left">Refund</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="border p-3">7+ days before check-in</td>
                <td className="border p-3 text-green-600 font-medium">100% refund</td>
              </tr>
              <tr className="bg-gray-50">
                <td className="border p-3">3–6 days before check-in</td>
                <td className="border p-3 text-yellow-600 font-medium">50% refund</td>
              </tr>
              <tr>
                <td className="border p-3">Less than 3 days before check-in</td>
                <td className="border p-3 text-red-600 font-medium">No refund</td>
              </tr>
              <tr className="bg-gray-50">
                <td className="border p-3">No show / same day cancellation</td>
                <td className="border p-3 text-red-600 font-medium">No refund</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-3">How to Cancel</h2>
        <p className="text-gray-700">To cancel your booking, WhatsApp us at +91 your-number with your booking ID. Cancellations are only accepted via WhatsApp or phone call — not email.</p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-3">Refund Process</h2>
        <p className="text-gray-700">Approved refunds are processed within <strong>5–7 business days</strong> to the original payment method. UPI refunds are typically faster (1–2 days).</p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-3">Cancellation by Us</h2>
        <p className="text-gray-700">In the rare event we need to cancel (emergency, illness outbreak, force majeure), you will receive a <strong>100% refund</strong> and we will help rebook or refer to a trusted alternative.</p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-3">Contact for Refunds</h2>
        <p className="text-gray-700">📞 WhatsApp: +91 your-number<br />
        📧 Email: simranspetvilla@gmail.com</p>
      </section>
    </div>
  );
}
