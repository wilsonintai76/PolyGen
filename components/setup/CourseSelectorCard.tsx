
import React from 'react';
import { Course, HeaderData } from '../../types';

interface CourseSelectorCardProps {
  availableCourses: Course[];
  header: HeaderData;
  onCourseSelect: (id: string) => void;
}

export const CourseSelectorCard: React.FC<CourseSelectorCardProps> = ({ availableCourses, header, onCourseSelect }) => {
  return (
    <section className="bg-[#f8fafc] p-6 rounded-[24px] border border-[#f1f5f9] space-y-5 shadow-sm">
      <h3 className="font-black text-[#3b82f6] uppercase tracking-widest text-[11px] mb-4 flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-blue-400"></span>
        1. TARGET COURSE
      </h3>
      <select 
        className="w-full border border-[#e2e8f0] rounded-xl p-3 text-sm font-bold text-[#1e293b] bg-white outline-none focus:border-blue-500 shadow-sm transition-all" 
        onChange={e => onCourseSelect(e.target.value)} 
        value={availableCourses.find(c => c.code === header.courseCode)?.id || ''}
      >
        <option value="">-- Choose Course --</option>
        {availableCourses.map(c => <option key={c.id} value={c.id}>{c.code} - {c.name}</option>)}
      </select>
    </section>
  );
};
