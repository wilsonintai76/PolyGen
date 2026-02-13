
import React, { useState, useMemo } from 'react';
import { Question, Course } from '../../types';
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
}

export const QuestionPickerModal: React.FC<QuestionPickerModalProps> = ({ 
  isOpen, onClose, onSelect, criteria, availableQuestions, courseCode 
}) => {
  if (!isOpen) return null;

  const [searchTerm, setSearchTerm] = useState('');

  // Filtering logic: Prioritize exact matches, then loose matches
  const filtered = useMemo(() => {
    return availableQuestions.filter(q => {
      const searchMatch = !searchTerm || 
        q.text.toLowerCase().includes(searchTerm.toLowerCase()) || 
        q.topic?.toLowerCase().includes(searchTerm.toLowerCase());
      
      // We show all questions in the bank, but we will highlight the recommended ones
      return searchMatch;
    }).sort((a, b) => {
      // Sort recommended items to the top
      const aScore = (a.topic === criteria.topic ? 2 : 0) + (a.taxonomy === criteria.taxonomy ? 1 : 0);
      const bScore = (b.topic === criteria.topic ? 2 : 0) + (b.taxonomy === criteria.taxonomy ? 1 : 0);
      return bScore - aScore;
    });
  }, [availableQuestions, criteria, searchTerm]);

  return (
    <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-[32px] w-full max-w-4xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden border border-slate-200">
        
        {/* Header */}
        <div className="p-6 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
          <div>
            <h3 className="text-xl font-black text-slate-800">Select Question</h3>
            <div className="flex gap-2 mt-2">
               <span className="text-[10px] font-black bg-blue-100 text-blue-600 px-2 py-0.5 rounded uppercase">{criteria.topic || 'Any Topic'}</span>
               <span className="text-[10px] font-black bg-purple-100 text-purple-600 px-2 py-0.5 rounded uppercase">{criteria.taxonomy || 'Any Level'}</span>
               <span className="text-[10px] font-black bg-emerald-100 text-emerald-600 px-2 py-0.5 rounded uppercase">{criteria.clo || 'Any CLO'}</span>
            </div>
          </div>
          <button onClick={onClose} className="w-10 h-10 rounded-full bg-slate-200 hover:bg-slate-300 flex items-center justify-center font-bold text-slate-500 transition">
            &times;
          </button>
        </div>

        {/* Search */}
        <div className="p-4 border-b border-slate-100">
           <input 
             className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm font-bold outline-none focus:border-blue-400 transition"
             placeholder="Search question text..."
             value={searchTerm}
             onChange={e => setSearchTerm(e.target.value)}
           />
        </div>

        {/* List */}
        <div className="flex-grow overflow-y-auto p-6 space-y-4 custom-scrollbar bg-slate-50/50">
           {filtered.length > 0 ? filtered.map(q => {
             const isPerfectMatch = q.topic === criteria.topic && q.taxonomy === criteria.taxonomy;
             const isTopicMatch = q.topic === criteria.topic;

             return (
               <div 
                 key={q.id} 
                 onClick={() => onSelect(q)}
                 className={`group relative p-5 rounded-2xl border-2 cursor-pointer transition-all hover:shadow-lg ${
                   isPerfectMatch 
                     ? 'bg-emerald-50/50 border-emerald-200 hover:border-emerald-400' 
                     : 'bg-white border-slate-100 hover:border-blue-300'
                 }`}
               >
                 {isPerfectMatch && (
                   <div className="absolute -top-2 -right-2 bg-emerald-500 text-white text-[9px] font-black px-2 py-1 rounded-full shadow-sm uppercase tracking-widest">
                     Recommended Match
                   </div>
                 )}
                 <div className="flex justify-between items-start mb-2">
                    <div className="flex gap-2">
                       <span className="text-[9px] font-black bg-slate-100 text-slate-500 px-2 py-1 rounded uppercase">{q.taxonomy}</span>
                       <span className="text-[9px] font-black bg-slate-100 text-slate-500 px-2 py-1 rounded uppercase">{q.marks} Marks</span>
                       <span className={`text-[9px] font-black px-2 py-1 rounded uppercase ${isTopicMatch ? 'bg-blue-100 text-blue-600' : 'bg-slate-100 text-slate-400'}`}>
                         {q.topic}
                       </span>
                    </div>
                 </div>
                 <div className="text-sm text-slate-700 italic line-clamp-2 leading-relaxed">
                   <LatexRenderer text={q.text} />
                 </div>
                 <div className="mt-3 pt-3 border-t border-dashed border-slate-200 flex justify-between items-center opacity-60 group-hover:opacity-100 transition-opacity">
                    <span className="text-[9px] font-bold text-slate-400">{q.type.toUpperCase()} • {q.construct}</span>
                    <span className="text-[10px] font-black text-blue-600 group-hover:underline">Select This Question &rarr;</span>
                 </div>
               </div>
             );
           }) : (
             <div className="text-center py-20 opacity-40">
                <span className="text-4xl block mb-2">🔍</span>
                <p className="text-xs font-black uppercase">No questions found matching criteria</p>
             </div>
           )}
        </div>
      </div>
    </div>
  );
};
