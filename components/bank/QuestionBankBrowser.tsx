
import React, { useState } from 'react';
import { Question, Course } from '../../types';

interface QuestionBankBrowserProps {
  selectedQuestions: Question[];
  availableQuestions: Question[];
  onToggle: (q: Question) => void;
  onBack: () => void;
  onFinish: () => void;
  availableCourses: Course[]; // Added to resolve course codes
}

export const QuestionBankBrowser: React.FC<QuestionBankBrowserProps> = ({ 
  selectedQuestions, availableQuestions, onToggle, onBack, onFinish, availableCourses
}) => {
  const [filter, setFilter] = useState('');
  
  const getCourseCode = (id?: string) => availableCourses.find(c => c.id === id)?.code || "GEN";

  const filtered = availableQuestions.filter(q => {
    const code = getCourseCode(q.courseId).toLowerCase();
    const search = filter.toLowerCase();
    return q.text.toLowerCase().includes(search) || 
      q.topic?.toLowerCase().includes(search) ||
      code.includes(search) ||
      q.cloKeys?.some(clo => clo.toLowerCase().includes(search));
  });

  const isSelected = (id: string) => selectedQuestions.some(q => q.id === id);

  return (
    <div className="bg-gray-50 min-h-screen p-8 w-full animate-in slide-in-from-right duration-300">
      <div className="max-w-6xl mx-auto flex flex-col h-full">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-4xl font-black text-slate-900 tracking-tight">Question Browser</h2>
            <p className="text-slate-500 font-bold uppercase text-[11px] tracking-widest">Select items to populate your assessment paper</p>
          </div>
          <div className="flex gap-4">
            <button onClick={onBack} className="text-slate-400 font-bold hover:text-slate-600 transition">← Back to Setup</button>
            <button 
              onClick={onFinish}
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-2xl font-black shadow-xl transition transform active:scale-95 disabled:opacity-30 flex items-center gap-3"
              disabled={selectedQuestions.length === 0}
            >
              FINALIZE PAPER ({selectedQuestions.length})
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
            </button>
          </div>
        </div>

        <div className="mb-8">
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300">🔍</span>
            <input 
              type="text"
              placeholder="Search by Course Code (DJJ...), Topic, CLO, or Taxonomy (C1...)"
              className="w-full pl-12 pr-6 py-5 rounded-[24px] border-2 border-slate-100 focus:border-blue-400 outline-none transition shadow-sm font-bold text-slate-700 placeholder:text-slate-300"
              value={filter}
              onChange={e => setFilter(e.target.value)}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 overflow-y-auto pr-2 custom-scrollbar pb-20">
          {filtered.length > 0 ? filtered.map(q => {
            const courseCode = getCourseCode(q.courseId);
            const active = isSelected(q.id);
            
            return (
              <div 
                key={q.id}
                onClick={() => onToggle(q)}
                className={`p-6 rounded-[32px] border-4 transition-all cursor-pointer flex flex-col justify-between group h-full ${
                  active ? 'border-blue-600 bg-blue-50 shadow-2xl scale-[0.98]' : 'border-white bg-white hover:border-slate-100 shadow-md hover:shadow-xl'
                }`}
              >
                <div>
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex flex-col gap-1">
                       <div className="flex items-center gap-2">
                          <span className="text-[9px] font-black bg-indigo-600 text-white px-2 py-1 rounded-lg uppercase tracking-widest shadow-sm">
                            {courseCode}
                          </span>
                          <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest border-l pl-2">
                            {q.topic}
                          </span>
                       </div>
                    </div>
                    <div className="flex gap-1.5">
                       <span className="text-[9px] font-black bg-blue-50 text-blue-600 px-2 py-1 rounded-lg uppercase border border-blue-100">
                         {q.taxonomy}
                       </span>
                       <span className="text-[9px] font-black bg-slate-900 text-white px-2 py-1 rounded-lg uppercase shadow-sm">
                         {q.marks} Marks
                       </span>
                    </div>
                  </div>
                  <div className="bg-slate-50/50 rounded-2xl p-4 mb-4 group-hover:bg-white transition-colors border border-transparent group-hover:border-slate-100">
                    <p className="text-slate-800 font-bold leading-relaxed line-clamp-4 italic text-sm">"{q.text}"</p>
                  </div>
                </div>
                
                <div className="flex justify-between items-center mt-auto pt-4 border-t border-slate-50">
                  <div className="flex gap-3">
                    <div className="flex flex-col">
                       <span className="text-[8px] font-black text-slate-300 uppercase tracking-tighter">Syllabus Link</span>
                       <span className="text-[10px] text-blue-500 font-black font-mono">
                         {q.cloKeys && q.cloKeys.length > 0 ? q.cloKeys.join(' • ') : 'GENERIC'}
                       </span>
                    </div>
                  </div>
                  <div className={`w-10 h-10 rounded-2xl border-4 flex items-center justify-center transition-all ${
                    active ? 'bg-blue-600 border-blue-400 text-white rotate-0' : 'border-slate-100 text-slate-100 -rotate-12 group-hover:rotate-0 group-hover:border-slate-200'
                  }`}>
                    {active ? '✓' : '+'}
                  </div>
                </div>
              </div>
            );
          }) : (
            <div className="col-span-full py-20 text-center flex flex-col items-center">
              <span className="text-6xl mb-6 grayscale opacity-20">📂</span>
              <h3 className="text-xl font-black text-slate-300 uppercase tracking-widest">No matching items in bank</h3>
              <p className="text-slate-400 text-sm mt-2">Try clearing filters or adding new questions in Bank Management.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
