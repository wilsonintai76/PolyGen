import React from 'react';

export const PrivacyPolicy: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto px-6 py-12 font-sans text-slate-700">
      <h1 className="text-4xl font-black text-slate-900 mb-8 uppercase tracking-tight">Privacy Policy</h1>
      <p className="text-sm text-slate-500 mb-8 font-bold uppercase tracking-widest">Last Updated: March 17, 2026</p>

      <section className="mb-10">
        <h2 className="text-xl font-bold text-slate-900 mb-4">1. Introduction</h2>
        <p className="leading-relaxed mb-4">
          PolyGen (&quot;we,&quot; &quot;our,&quot; or &quot;us&quot;) is committed to protecting the privacy of academic staff at Malaysian Polytechnic institutions. This Privacy Policy explains how we collect, use, and safeguard your information when you use our assessment generation platform.
        </p>
      </section>

      <section className="mb-10">
        <h2 className="text-xl font-bold text-slate-900 mb-4">2. Information We Collect</h2>
        <div className="space-y-4">
          <div>
            <h3 className="font-bold text-slate-800">A. Authentication Data</h3>
            <p className="leading-relaxed">
              We use Google OAuth for authentication. We collect your name, email address, and profile picture provided by Google to verify your institutional identity (@poliku.edu.my).
            </p>
          </div>
          <div>
            <h3 className="font-bold text-slate-800">B. Professional Information</h3>
            <p className="leading-relaxed">
              We collect information regarding your academic position, department, and programme to facilitate the assessment workflow and institutional reporting.
            </p>
          </div>
          <div>
            <h3 className="font-bold text-slate-800">C. Academic Content</h3>
            <p className="leading-relaxed">
              We store the assessment questions, course information, and examination papers you create on the platform. This data is stored securely and is accessible only to authorized institutional staff.
            </p>
          </div>
        </div>
      </section>

      <section className="mb-10">
        <h2 className="text-xl font-bold text-slate-900 mb-4">3. How We Use Your Information</h2>
        <ul className="list-disc pl-6 space-y-2 leading-relaxed">
          <li>To provide and maintain the assessment generation service.</li>
          <li>To verify institutional affiliation and restrict access to authorized staff.</li>
          <li>To facilitate the review and endorsement workflow of examination papers.</li>
          <li>To ensure compliance with academic standards (Dublin Accord).</li>
          <li>To generate institutional reports and analytics.</li>
        </ul>
      </section>

      <section className="mb-10">
        <h2 className="text-xl font-bold text-slate-900 mb-4">4. Data Security</h2>
        <p className="leading-relaxed">
          We implement enterprise-grade security measures to protect your data. All data is encrypted in transit and at rest. Access is strictly controlled via role-based access control (RBAC).
        </p>
      </section>

      <section className="mb-10">
        <h2 className="text-xl font-bold text-slate-900 mb-4">5. Data Retention</h2>
        <p className="leading-relaxed">
          Academic content is retained in accordance with institutional data retention policies. You may request the deletion of your personal account data by contacting your institutional administrator.
        </p>
      </section>

      <section className="mb-10">
        <h2 className="text-xl font-bold text-slate-900 mb-4">6. Contact Us</h2>
        <p className="leading-relaxed">
          If you have any questions about this Privacy Policy, please contact the Information Technology Department of your respective Polytechnic.
        </p>
      </section>
    </div>
  );
};
