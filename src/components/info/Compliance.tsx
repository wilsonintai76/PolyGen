import React from 'react';

export const Compliance: React.FC = () => {
  return (
    <div className="max-w-6xl mx-auto px-6 py-12 font-sans text-slate-700">
      <div className="text-center mb-16">
        <h1 className="text-5xl font-black text-slate-900 mb-6 uppercase tracking-tight tracking-tighter">Academic Compliance</h1>
        <p className="text-xl text-slate-500 max-w-3xl mx-auto leading-relaxed">
          PolyGen ensures that every assessment generated meets the rigorous standards of the Dublin Accord.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-16">
        <div className="bg-white p-10 rounded-[48px] border border-slate-200 shadow-sm">
          <h2 className="text-2xl font-black text-slate-900 mb-6 uppercase tracking-tight">Dublin Accord Standards</h2>
          <p className="leading-relaxed mb-6">
            The system is pre-configured with the latest Dublin Accord standards. It enforces the correct mapping of Learning Domains and Taxonomy levels (Cognitive, Psychomotor, Affective) to every assessment item.
          </p>
          <div className="space-y-4">
            <div className="flex items-center gap-3 text-sm font-bold text-slate-600">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-600"></span>
              Automated CLO-PLO Alignment
            </div>
            <div className="flex items-center gap-3 text-sm font-bold text-slate-600">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-600"></span>
              Taxonomy Level Verification
            </div>
            <div className="flex items-center gap-3 text-sm font-bold text-slate-600">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-600"></span>
              Institutional Quality Assurance (IQA)
            </div>
          </div>
        </div>

        <div className="bg-white p-10 rounded-[48px] border border-slate-200 shadow-sm">
          <h2 className="text-2xl font-black text-slate-900 mb-6 uppercase tracking-tight">Endorsement Workflow</h2>
          <p className="leading-relaxed mb-6">
            PolyGen digitizes the institutional review and endorsement process. Examination papers must pass through authorized Reviewers and Endorsers before final approval.
          </p>
          <div className="space-y-4">
            <div className="flex items-center gap-3 text-sm font-bold text-slate-600">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
              Digital Endorsement Signatures
            </div>
            <div className="flex items-center gap-3 text-sm font-bold text-slate-600">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
              Review Checklist Compliance
            </div>
            <div className="flex items-center gap-3 text-sm font-bold text-slate-600">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
              Version Control & Archiving
            </div>
          </div>
        </div>
      </div>

      <div className="bg-slate-900 p-12 rounded-[48px] text-white">
        <h2 className="text-3xl font-black mb-8 uppercase tracking-tight">Institutional Reporting</h2>
        <p className="text-slate-400 mb-8 leading-relaxed">
          PolyGen generates comprehensive reports for institutional audits and quality assurance reviews. These reports provide evidence of constructive alignment and assessment quality at the department and programme level.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="p-6 bg-white/5 rounded-3xl border border-white/10">
            <div className="text-2xl font-black text-white mb-2">100%</div>
            <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest">CIST Alignment</div>
          </div>
          <div className="p-6 bg-white/5 rounded-3xl border border-white/10">
            <div className="text-2xl font-black text-white mb-2 uppercase">Dublin Accord</div>
            <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Standard Compliance</div>
          </div>
          <div className="p-6 bg-white/5 rounded-3xl border border-white/10">
            <div className="text-2xl font-black text-white mb-2">Audit</div>
            <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Ready Reports</div>
          </div>
        </div>
      </div>
    </div>
  );
};
