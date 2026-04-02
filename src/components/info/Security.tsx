import React from 'react';

export const Security: React.FC = () => {
  return (
    <div className="max-w-6xl mx-auto px-6 py-12 font-sans text-slate-700">
      <div className="text-center mb-16">
        <h1 className="text-5xl font-black text-slate-900 mb-6 uppercase tracking-tight">Enterprise Security</h1>
        <p className="text-xl text-slate-500 max-w-3xl mx-auto leading-relaxed">
          PolyGen is built on a foundation of zero-trust security architecture, protecting the integrity of academic assessments.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
        <div className="bg-slate-900 p-8 rounded-[32px] text-white shadow-2xl">
          <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center text-xl mb-6 shadow-lg shadow-blue-600/20">🛡️</div>
          <h3 className="text-xl font-black mb-4 uppercase tracking-tight">Identity & Access</h3>
          <p className="text-slate-400 text-sm leading-relaxed">
            Strict institutional authentication via Google OAuth. Access is restricted exclusively to authorized @poliku.edu.my accounts.
          </p>
        </div>

        <div className="bg-slate-900 p-8 rounded-[32px] text-white shadow-2xl">
          <div className="w-12 h-12 bg-emerald-600 rounded-2xl flex items-center justify-center text-xl mb-6 shadow-lg shadow-emerald-600/20">🔒</div>
          <h3 className="text-xl font-black mb-4 uppercase tracking-tight">Data Encryption</h3>
          <p className="text-slate-400 text-sm leading-relaxed">
            All data is encrypted in transit using TLS 1.3 and at rest using AES-256. Your assessment content is protected by enterprise-grade encryption.
          </p>
        </div>

        <div className="bg-slate-900 p-8 rounded-[32px] text-white shadow-2xl">
          <div className="w-12 h-12 bg-rose-600 rounded-2xl flex items-center justify-center text-xl mb-6 shadow-lg shadow-rose-600/20">👁️</div>
          <h3 className="text-xl font-black mb-4 uppercase tracking-tight">Audit Logging</h3>
          <p className="text-slate-400 text-sm leading-relaxed">
            Every action on the platform is logged. Maintain a complete audit trail of question creation, paper generation, and endorsement workflows.
          </p>
        </div>
      </div>

      <div className="bg-white p-12 rounded-[48px] border border-slate-200 shadow-sm">
        <h2 className="text-3xl font-black text-slate-900 mb-8 uppercase tracking-tight">Security Infrastructure</h2>
        <div className="space-y-6">
          <div className="flex gap-6">
            <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center shrink-0">✅</div>
            <div>
              <h4 className="font-bold text-slate-900 mb-1">Role-Based Access Control (RBAC)</h4>
              <p className="text-slate-500 text-sm">Granular permissions ensure staff only access content relevant to their department and role (Creator, Reviewer, Endorser, Contributor, Administrator).</p>
            </div>
          </div>
          <div className="flex gap-6">
            <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center shrink-0">✅</div>
            <div>
              <h4 className="font-bold text-slate-900 mb-1">Secure Cloud Hosting</h4>
              <p className="text-slate-500 text-sm">Hosted on high-availability cloud infrastructure with automated backups and disaster recovery protocols.</p>
            </div>
          </div>
          <div className="flex gap-6">
            <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center shrink-0">✅</div>
            <div>
              <h4 className="font-bold text-slate-900 mb-1">Vulnerability Scanning</h4>
              <p className="text-slate-500 text-sm">Regular automated security scans and dependency monitoring to protect against emerging threats.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
