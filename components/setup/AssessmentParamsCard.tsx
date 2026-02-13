
import React from 'react';
import { HeaderData, StudentSectionData } from '../../types';

interface AssessmentParamsCardProps {
  header: HeaderData;
  student: StudentSectionData;
  onUpdateHeader: (h: HeaderData) => void;
  onUpdateStudent: (s: StudentSectionData) => void;
}

export const AssessmentParamsCard: React.FC<AssessmentParamsCardProps> = ({ header, student, onUpdateHeader, onUpdateStudent }) => {
  const inputClass = "w-full border border-[#e2e8f0] rounded-xl p-3 text-sm font-bold text-[#1e293b] bg-white outline-none focus:border-blue-500 shadow-sm transition-all";
  const labelClass = "block text-[10px] font-black text-[#94a3b8] uppercase tracking-tighter mb-1.5 ml-1";

  return (
    <section className="bg-[#f8fafc] p-6 rounded-[24px] border border-[#f1f5f9] space-y-5 shadow-sm">
      <h3 className="font-black text-[#3b82f6] uppercase tracking-widest text-[11px] mb-4 flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-blue-400"></span>
        2. ASSESSMENT PARAMS
      </h3>
      <div>
        <label className={labelClass}>SESSION</label>
        <input className={inputClass} value={header.session} onChange={e => onUpdateHeader({...header, session: e.target.value})} />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={labelClass}>SET</label>
          <div className="flex gap-1 p-1 bg-white border border-[#e2e8f0] rounded-xl">
            {['A', 'B', 'C', 'D'].map(s => (
              <button key={s} onClick={() => onUpdateHeader({...header, set: s})} className={`flex-1 py-1.5 text-[10px] font-black rounded-lg transition-all ${header.set === s ? 'bg-blue-600 text-white' : 'text-slate-400'}`}>{s}</button>
            ))}
          </div>
        </div>
        <div>
          <label className={labelClass}>PERCENT (%)</label>
          <input className={inputClass} value={header.percentage} onChange={e => onUpdateHeader({...header, percentage: e.target.value})} />
        </div>
      </div>
      <div>
        <label className={labelClass}>DURATION</label>
        <input className={inputClass} value={student.duration} onChange={e => onUpdateStudent({...student, duration: e.target.value})} />
      </div>
    </section>
  );
};
