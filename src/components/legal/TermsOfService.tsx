import React from 'react';

export const TermsOfService: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto px-6 py-12 font-sans text-slate-700">
      <h1 className="text-4xl font-black text-slate-900 mb-8 uppercase tracking-tight">Terms of Service</h1>
      <p className="text-sm text-slate-500 mb-8 font-bold uppercase tracking-widest">Last Updated: March 17, 2026</p>

      <section className="mb-10">
        <h2 className="text-xl font-bold text-slate-900 mb-4">1. Acceptance of Terms</h2>
        <p className="leading-relaxed mb-4">
          By accessing and using PolyGen (&quot;the Service&quot;), you agree to be bound by these Terms of Service. If you do not agree to these terms, you should not use the Service.
        </p>
      </section>

      <section className="mb-10">
        <h2 className="text-xl font-bold text-slate-900 mb-4">2. Eligibility</h2>
        <p className="leading-relaxed mb-4">
          The Service is restricted to authorized academic staff of Malaysian Polytechnic institutions. You must use your institutional Google account (@poliku.edu.my) to access the Service.
        </p>
      </section>

      <section className="mb-10">
        <h2 className="text-xl font-bold text-slate-900 mb-4">3. User Responsibilities</h2>
        <p className="leading-relaxed mb-4">
          You are responsible for maintaining the confidentiality of your account and for all activities that occur under your account. You agree to:
        </p>
        <ul className="list-disc pl-6 space-y-2 leading-relaxed">
          <li>Use the Service only for authorized academic purposes.</li>
          <li>Ensure the accuracy and integrity of the assessment content you create.</li>
          <li>Comply with institutional academic integrity policies.</li>
          <li>Not share your account access with unauthorized individuals.</li>
          <li>Not attempt to circumvent any security measures of the Service.</li>
        </ul>
      </section>

      <section className="mb-10">
        <h2 className="text-xl font-bold text-slate-900 mb-4">4. Intellectual Property</h2>
        <p className="leading-relaxed mb-4">
          The assessment content created on the Service remains the intellectual property of the respective Polytechnic institution. The software platform and its underlying technology are the property of PolyGen.
        </p>
      </section>

      <section className="mb-10">
        <h2 className="text-xl font-bold text-slate-900 mb-4">5. Confidentiality</h2>
        <p className="leading-relaxed mb-4">
          Examination papers and assessment questions are strictly confidential. You must not disclose or share this content outside of the authorized institutional workflow.
        </p>
      </section>

      <section className="mb-10">
        <h2 className="text-xl font-bold text-slate-900 mb-4">6. Termination</h2>
        <p className="leading-relaxed mb-4">
          We reserve the right to suspend or terminate your access to the Service for any violation of these Terms or upon your separation from the institution.
        </p>
      </section>

      <section className="mb-10">
        <h2 className="text-xl font-bold text-slate-900 mb-4">7. Limitation of Liability</h2>
        <p className="leading-relaxed mb-4">
          The Service is provided &quot;as is&quot; without warranties of any kind. We are not liable for any damages arising from your use of the Service.
        </p>
      </section>

      <section className="mb-10">
        <h2 className="text-xl font-bold text-slate-900 mb-4">8. Changes to Terms</h2>
        <p className="leading-relaxed mb-4">
          We may update these Terms from time to time. Your continued use of the Service after such changes constitutes your acceptance of the new Terms.
        </p>
      </section>
    </div>
  );
};
