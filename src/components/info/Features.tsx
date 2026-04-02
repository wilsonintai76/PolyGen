import React from 'react';

export const Features: React.FC = () => {
  return (
    <div className="max-w-6xl mx-auto px-6 py-12 font-sans text-slate-700">
      <div className="text-center mb-16">
        <h1 className="text-5xl font-black text-slate-900 mb-6 uppercase tracking-tight">System Features</h1>
        <p className="text-xl text-slate-500 max-w-3xl mx-auto leading-relaxed">
          PolyGen is engineered specifically for the Malaysian Polytechnic ecosystem, providing a comprehensive suite of tools for academic excellence.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        <div className="bg-white p-8 rounded-[32px] border border-slate-200 shadow-sm hover:shadow-md transition">
          <div className="w-14 h-14 bg-blue-600 rounded-2xl flex items-center justify-center text-2xl mb-6 text-white shadow-lg shadow-blue-600/20">🧬</div>
          <h2 className="text-2xl font-black text-slate-900 mb-4 uppercase tracking-tight">Smart CIST Mapping</h2>
          <p className="leading-relaxed">
            Our proprietary algorithm ensures perfect constructive alignment between Course Learning Outcomes (CLO), Programme Learning Outcomes (PLO), and assessment items. Automated mapping saves hours of manual verification.
          </p>
        </div>

        <div className="bg-white p-8 rounded-[32px] border border-slate-200 shadow-sm hover:shadow-md transition">
          <div className="w-14 h-14 bg-emerald-600 rounded-2xl flex items-center justify-center text-2xl mb-6 text-white shadow-lg shadow-emerald-600/20">🗄️</div>
          <h2 className="text-2xl font-black text-slate-900 mb-4 uppercase tracking-tight">Centralized Question Bank</h2>
          <p className="leading-relaxed">
            A secure, collaborative repository for vetted examination questions. Track question performance, reuse high-quality items, and maintain a consistent standard across departments.
          </p>
        </div>

        <div className="bg-white p-8 rounded-[32px] border border-slate-200 shadow-sm hover:shadow-md transition">
          <div className="w-14 h-14 bg-amber-600 rounded-2xl flex items-center justify-center text-2xl mb-6 text-white shadow-lg shadow-amber-600/20">📝</div>
          <h2 className="text-2xl font-black text-slate-900 mb-4 uppercase tracking-tight">One-Click Generation</h2>
          <p className="leading-relaxed">
            Generate perfectly formatted examination papers, answer schemes, and front covers instantly. Our templates are pre-configured to meet institutional branding and formatting requirements.
          </p>
        </div>

        <div className="bg-white p-8 rounded-[32px] border border-slate-200 shadow-sm hover:shadow-md transition">
          <div className="w-14 h-14 bg-purple-600 rounded-2xl flex items-center justify-center text-2xl mb-6 text-white shadow-lg shadow-purple-600/20">📊</div>
          <h2 className="text-2xl font-black text-slate-900 mb-4 uppercase tracking-tight">Analytics & Reporting</h2>
          <p className="leading-relaxed">
            Gain deep insights into assessment quality and student performance. Generate institutional reports for quality assurance audits and continuous quality improvement (CQI).
          </p>
        </div>

        <div className="bg-white p-8 rounded-[32px] border border-slate-200 shadow-sm hover:shadow-md transition">
          <div className="w-14 h-14 bg-cyan-600 rounded-2xl flex items-center justify-center text-2xl mb-6 text-white shadow-lg shadow-cyan-600/20">🔄</div>
          <h2 className="text-2xl font-black text-slate-900 mb-4 uppercase tracking-tight">Version Control</h2>
          <p className="leading-relaxed">
            Track changes and maintain a complete history of all assessment papers. Revert to previous versions if needed and maintain a clear audit trail of modifications.
          </p>
        </div>

        <div className="bg-white p-8 rounded-[32px] border border-slate-200 shadow-sm hover:shadow-md transition">
          <div className="w-14 h-14 bg-teal-600 rounded-2xl flex items-center justify-center text-2xl mb-6 text-white shadow-lg shadow-teal-600/20">🤝</div>
          <h2 className="text-2xl font-black text-slate-900 mb-4 uppercase tracking-tight">Collaboration</h2>
          <p className="leading-relaxed">
            Multi-user workflows for seamless review and endorsement processes. Assign reviewers, track status, and communicate feedback directly within the platform.
          </p>
        </div>
      </div>
    </div>
  );
};
