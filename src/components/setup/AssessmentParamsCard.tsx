
import React, { useMemo } from 'react';
import { HeaderData, StudentSectionData, Course } from '../../types';

interface AssessmentParamsCardProps {
  header: HeaderData;
  student: StudentSectionData;
  onUpdateHeader: (h: HeaderData) => void;
  onUpdateStudent: (s: StudentSectionData) => void;
  availableCourses: Course[];
}

export const AssessmentParamsCard: React.FC<AssessmentParamsCardProps> = ({ header, student, onUpdateHeader, onUpdateStudent, availableCourses }) => {
  const inputClass = "w-full border border-[#e2e8f0] rounded-xl p-3 text-sm font-bold text-[#1e293b] bg-white outline-none focus:border-blue-500 shadow-sm transition-all";
  const labelClass = "block text-[10px] font-black text-[#94a3b8] uppercase tracking-tighter mb-1.5 ml-1";

  const selectedCourse = useMemo(() => 
    availableCourses.find(c => c.code === header.courseCode), 
    [availableCourses, header.courseCode]
  );

  const policies = selectedCourse?.assessmentPolicies || [];

  const handleTaskChange = (taskName: string) => {
    const policy = policies.find(p => p.name === taskName);
    if (policy) {
      onUpdateHeader({
        ...header,
        assessmentType: taskName,
        percentage: `${policy.weightage}%`
      });
      onUpdateStudent({
        ...student,
        duration: policy.duration
      });
    } else {
      onUpdateHeader({ ...header, assessmentType: taskName });
    }
  };

  return (
    <section className="bg-[#f8fafc] p-6 rounded-[24px] border border-[#f1f5f9] space-y-5 shadow-sm">
      <h3 className="font-black text-[#3b82f6] uppercase tracking-widest text-[11px] mb-4 flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-blue-400"></span>
        2. ASSESSMENT PARAMS
      </h3>
      
      <div>
        <label className={labelClass}>SESSION (AUTO-SYNCED)</label>
        <div className="w-full bg-slate-100 border border-slate-200 rounded-xl p-3 text-xs font-black text-slate-500 uppercase tracking-widest">
           {header.session || 'SESSION NOT SET'}
        </div>
      </div>

      <div>
        <label className={labelClass}>ASSESSMENT TASK (SYLLABUS ENFORCED)</label>
        <select 
          className={inputClass} 
          value={header.assessmentType} 
          onChange={e => handleTaskChange(e.target.value)}
          disabled={!header.courseCode}
        >
          <option value="">-- Choose Task --</option>
          {policies.map(p => (
            <option key={p.id} value={p.name}>{p.name}</option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={labelClass}>SET</label>
          <div className="flex gap-1 p-1 bg-white border border-[#e2e8f0] rounded-xl">
            {['A', 'B', 'C', 'D'].map(s => (
              <button key={s} onClick={() => onUpdateHeader({...header, set: s})} className={`flex-1 py-1.5 text-[10px] font-black rounded-lg transition-all ${header.set === s ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:bg-slate-50'}`}>{s}</button>
            ))}
          </div>
        </div>
        <div>
          <label className={labelClass}>PERCENT (AUTO)</label>
          <div className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm font-black text-slate-400 text-center">
             {header.percentage || '-'}
          </div>
        </div>
      </div>
      <div>
        <label className={labelClass}>DURATION (AUTO)</label>
        <div className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm font-black text-slate-400 text-center">
           {student.duration || '-'}
        </div>
      </div>
    </section>
  );
};
