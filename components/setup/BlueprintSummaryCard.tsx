
import React, { useMemo } from 'react';
import { Course, MatrixRow } from '../../types';

interface BlueprintSummaryCardProps {
  course?: Course;
  assessmentType: string;
}

export const BlueprintSummaryCard: React.FC<BlueprintSummaryCardProps> = ({ course, assessmentType }) => {
  const stats = useMemo(() => {
    if (!course?.jsuTemplate || !assessmentType) return null;

    const relevantRows = course.jsuTemplate.filter(r => r.task === assessmentType);
    
    let totalMarks = 0;
    let questionCount = 0;
    const taxonomyCounts: Record<string, number> = {};
    const domains = new Set<string>();

    relevantRows.forEach(row => {
      if (row.domain) domains.add(row.domain);
      
      Object.entries(row.levels || {}).forEach(([lvl, data]) => {
        if (data.marks > 0) {
          totalMarks += data.marks;
          // Count implies number of items, usually '1' per slot in this strict model
          // If count is "2", it means 2 questions. We parse it safely.
          const qQty = parseInt(data.count) || 1; 
          questionCount += qQty;
          taxonomyCounts[lvl] = (taxonomyCounts[lvl] || 0) + qQty;
        }
      });
    });

    return { totalMarks, questionCount, taxonomyCounts, domains: Array.from(domains) };
  }, [course, assessmentType]);

  if (!course) return null;

  return (
    <div className="bg-slate-900 text-white p-6 rounded-[24px] shadow-lg border border-slate-700 flex flex-col h-full relative overflow-hidden group">
      <div className="absolute top-0 right-0 p-3 opacity-10 text-6xl group-hover:opacity-20 transition-opacity">
        📐
      </div>
      
      <h3 className="font-black text-blue-400 uppercase tracking-widest text-[10px] mb-6 flex items-center gap-2 z-10">
        <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse"></span>
        CIST Blueprint Specification
      </h3>

      {stats ? (
        <div className="flex-grow flex flex-col justify-between z-10 space-y-6">
           <div className="grid grid-cols-2 gap-4">
              <div className="bg-slate-800/50 p-4 rounded-2xl border border-slate-700">
                 <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Marks</div>
                 <div className="text-3xl font-black text-white">{stats.totalMarks}</div>
              </div>
              <div className="bg-slate-800/50 p-4 rounded-2xl border border-slate-700">
                 <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Item Count</div>
                 <div className="text-3xl font-black text-white">{stats.questionCount}</div>
              </div>
           </div>

           <div>
              <div className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-2">Domain Coverage</div>
              <div className="flex flex-wrap gap-2">
                 {stats.domains.map(d => (
                   <span key={d} className="px-2 py-1 rounded-md bg-indigo-900/50 text-indigo-300 border border-indigo-800/50 text-[9px] font-black uppercase">
                     {d}
                   </span>
                 ))}
              </div>
           </div>

           <div>
              <div className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-2">Taxonomy Distribution</div>
              <div className="flex flex-wrap gap-1">
                 {Object.entries(stats.taxonomyCounts).map(([tax, count]) => (
                   <div key={tax} className="flex items-center bg-slate-800 rounded-lg overflow-hidden border border-slate-700">
                      <div className="px-2 py-1 bg-slate-700 text-[9px] font-black text-slate-300">{tax}</div>
                      <div className="px-2 py-1 text-[9px] font-bold text-white">{count}</div>
                   </div>
                 ))}
              </div>
           </div>
        </div>
      ) : (
        <div className="flex-grow flex flex-col items-center justify-center opacity-30 z-10 text-center">
           <div className="text-3xl mb-2">📋</div>
           <p className="text-[10px] font-black uppercase tracking-widest">Select Course & Task<br/>to load Blueprint</p>
        </div>
      )}
    </div>
  );
};
