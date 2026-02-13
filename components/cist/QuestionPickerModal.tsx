
import React, { useState, useMemo } from 'react';
import { Question, AssessmentDomain } from '../../types';
import { LatexRenderer } from '../common/LatexRenderer';

interface QuestionPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (q: Question) => void;
  criteria: {
    topic: string;
    clo: string;
    taxonomy: string;
    marks: number;
  };
  availableQuestions: Question[];
  courseCode: string;
  maxTaxonomy: string;
  strict?: boolean; // If true, hide non-matching items
}

const DOMAIN_LEVELS: Record<AssessmentDomain, string[]> = {
  'Cognitive': ['C1', 'C2', 'C3', 'C4', 'C5', 'C6'],
  'Psychomotor': ['P1', 'P2', 'P3', 'P4', 'P5', 'P6', 'P7'],
  'Affective': ['A1', 'A2', 'A3', 'A4', 'A5']
};

export const QuestionPickerModal: React.FC<QuestionPickerModalProps> = ({ 
  isOpen, onClose, onSelect, criteria, availableQuestions, courseCode, maxTaxonomy, strict 
}) => {
  if (!isOpen) return null;

  const [searchTerm, setSearchTerm] = useState('');

  const getMatchQuality = (q: Question) => {
    let score = 0;
    if (q.taxonomy === criteria.taxonomy) score += 10;
    if (q.marks === criteria.marks) score += 10;
    if (q.topic === criteria.topic || q.topic?.includes(criteria.topic)) score += 5;
    return score;
  };

  const filtered = useMemo(() => {
    return availableQuestions.filter(q => {
      // Must match Course Code
      // if (q.courseId !== ... ) // Bank items usually tied to Course ID in real DB

      const searchMatch = !searchTerm || 
        q.text.toLowerCase().includes(searchTerm.toLowerCase()) || 
        q.topic?.toLowerCase().includes(searchTerm.toLowerCase());
      
      if (!searchMatch) return false;

      // In strict mode, we filter for items that satisfy the taxonomy and mark requirements of the slot
      if (strict) {
        return q.taxonomy === criteria.taxonomy && q.marks === criteria.marks;
      }
      
      return true;
    }).sort((a, b) => getMatchQuality(b) - getMatchQuality(a));
  }, [availableQuestions, criteria, searchTerm, strict]);

  return (
    <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md z-[60] flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-[40px] w-full max-w-5xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden border border-slate-200">
        
        <div className="p-8 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
          <div>
            <h3 className="text-2xl font-black text-slate-800 uppercase tracking-tight">Select Registry Item</h3>
            <div className="flex gap-3 mt-3">
               <div className="bg-blue-600 text-white px-3 py-1 rounded-lg text-[9px] font-black uppercase shadow-md flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 bg-white rounded-full"></span> Target: {criteria.taxonomy}
               </div>
               <div className="bg-slate-900 text-white px-3 py-1 rounded-lg text-[9px] font-black uppercase shadow-md">Required: {criteria.marks} Marks</div>
               <div className="bg-slate-200 text-slate-600 px-3 py-1 rounded-lg text-[9px] font-black uppercase">{criteria.topic || 'Any Topic'}</div>
            </div>
          </div>
          <button onClick={onClose} className="w-12 h-12 rounded-full bg-slate-200 hover:bg-slate-300 flex items-center justify-center font-bold text-slate-500 transition-all text-2xl shadow-inner">
            &times;
          </button>
        </div>

        <div className="p-6 border-b border-slate-100 bg-white">
           <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">🔍</span>
              <input 
                className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl pl-12 pr-6 py-4 text-sm font-bold outline-none focus:border-blue-400 transition shadow-inner"
                placeholder="Search matching questions in bank..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
           </div>
        </div>

        <div className="flex-grow overflow-y-auto p-8 space-y-4 custom-scrollbar bg-slate-50/30">
           {filtered.length > 0 ? filtered.map(q => (
             <div 
               key={q.id} 
               onClick={() => onSelect(q)}
               className="group relative p-6 rounded-[32px] border-2 border-white bg-white hover:border-blue-400 hover:shadow-2xl cursor-pointer transition-all animate-in slide-in-from-bottom-2"
             >
               <div className="flex justify-between items-start mb-4">
                  <div className="flex gap-2">
                     <span className="text-[10px] font-black px-2.5 py-1 rounded-lg uppercase bg-blue-100 text-blue-600 border border-blue-200">
                       {q.taxonomy}
                     </span>
                     <span className="text-[10px] font-black bg-slate-900 text-white px-2.5 py-1 rounded-lg uppercase shadow-sm">
                       {q.marks} Marks
                     </span>
                     <span className={`text-[10px] font-black px-2.5 py-1 rounded-lg uppercase ${q.topic === criteria.topic ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-400'}`}>
                       {q.topic}
                     </span>
                  </div>
                  <div className="text-[8px] font-black text-slate-300 uppercase tracking-widest group-hover:text-blue-500 transition-colors">
                     Bank ID: {q.id}
                  </div>
               </div>
               
               <div className="text-base text-slate-700 font-medium italic leading-relaxed mb-4 group-hover:text-slate-900 transition-colors">
                 <LatexRenderer text={q.text} />
               </div>

               <div className="pt-4 border-t border-dashed border-slate-100 flex justify-between items-center opacity-40 group-hover:opacity-100 transition-opacity">
                  <div className="flex gap-4">
                     <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{q.type.toUpperCase()} ITEM</span>
                     <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{q.construct}</span>
                  </div>
                  <span className="text-[10px] font-black text-blue-600 uppercase tracking-[0.2em] group-hover:translate-x-2 transition-transform">Fill Slot &rarr;</span>
               </div>
             </div>
           )) : (
             <div className="text-center py-32 opacity-30 flex flex-col items-center">
                <span className="text-7xl mb-6">🏜️</span>
                <h4 className="text-xl font-black uppercase tracking-[0.3em]">No Matching Items</h4>
                <p className="text-sm font-bold mt-2 max-w-sm">No items in the Registry Bank match the exact Marks ({criteria.marks}) and Taxonomy ({criteria.taxonomy}) required by the CIST for this slot.</p>
                <button onClick={onClose} className="mt-8 bg-slate-900 text-white px-10 py-4 rounded-full font-black text-[10px] uppercase tracking-widest hover:bg-slate-800 transition">Back to Terminal</button>
             </div>
           )}
        </div>
      </div>
    </div>
  );
};
