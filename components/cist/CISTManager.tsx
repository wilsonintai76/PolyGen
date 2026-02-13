
import React, { useState, useMemo } from 'react';
import { Question, Course, MatrixRow, AssessmentDomain } from '../../types';
import { QuestionPickerModal } from './QuestionPickerModal';

interface CISTManagerProps {
  currentQuestions: Question[];
  onUpdateQuestions: (qs: Question[]) => void;
  availableCourses: Course[];
  activeCourseId?: string;
  assessmentType: string;
  onBack: () => void;
  onNext: () => void;
  fullBank: Question[];
}

export const CISTManager: React.FC<CISTManagerProps> = ({
  currentQuestions,
  onUpdateQuestions,
  availableCourses,
  activeCourseId,
  assessmentType,
  onBack,
  onNext,
  fullBank
}) => {
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const [activeSlotIdx, setActiveSlotIdx] = useState<number | null>(null);

  const activeCourse = useMemo(() => availableCourses.find(c => c.id === activeCourseId), [availableCourses, activeCourseId]);
  
  // The Master Blueprint: All rows from CIST for this specific assessment task
  const blueprintSlots = useMemo(() => {
    if (!activeCourse?.jsuTemplate) return [];
    
    // We flatten the CIST rows because one CIST row can have multiple question numbers/levels
    const flattened: any[] = [];
    activeCourse.jsuTemplate
      .filter(r => r.task === assessmentType)
      .forEach(row => {
        Object.entries(row.levels || {}).forEach(([lvl, data]) => {
           if (data.marks > 0) {
             flattened.push({
               ...row,
               targetNumber: data.count, // e.g. "1" or "2a"
               targetMarks: data.marks,
               targetTaxonomy: lvl,
               originalRow: row
             });
           }
        });
      });
    return flattened.sort((a, b) => a.targetNumber.localeCompare(b.targetNumber, undefined, { numeric: true }));
  }, [activeCourse, assessmentType]);

  const handleOpenPicker = (idx: number) => {
    setActiveSlotIdx(idx);
    setIsPickerOpen(true);
  };

  const handleSelectQuestion = (q: Question) => {
    if (activeSlotIdx === null) return;
    
    const slot = blueprintSlots[activeSlotIdx];
    // Attach the CIST-determined number to the question instance for this paper
    const questionWithNumber = { ...q, number: slot.targetNumber };
    
    // Update the question list
    const updated = [...currentQuestions];
    // Find if we already filled this slot index or number
    const existingIdx = updated.findIndex(item => item.number === slot.targetNumber);
    
    if (existingIdx >= 0) {
      updated[existingIdx] = questionWithNumber;
    } else {
      updated.push(questionWithNumber);
    }
    
    onUpdateQuestions(updated);
    setIsPickerOpen(false);
  };

  const getFilledQuestion = (targetNumber: string) => {
    return currentQuestions.find(q => q.number === targetNumber);
  };

  const totalFilled = currentQuestions.length;
  const isReady = totalFilled === blueprintSlots.length;

  return (
    <div className="min-h-screen p-8 animate-in fade-in duration-500 bg-slate-50/50">
      <div className="max-w-[1400px] mx-auto">
        <header className="mb-10 flex justify-between items-end">
          <div>
            <div className="flex items-center gap-3 mb-2">
               <span className="bg-blue-600 text-white px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest shadow-lg">BLUEPRINT MODE</span>
               <h2 className="text-4xl font-black text-slate-900 tracking-tight uppercase">{assessmentType} Question Terminal</h2>
            </div>
            <p className="text-slate-500 font-bold uppercase text-[11px] tracking-widest mt-1 italic border-l-4 border-blue-600 pl-4">
              {activeCourse?.code} &bull; Pulling data from CIST Master Specification
            </p>
          </div>
          <div className="flex gap-4">
             <div className="bg-white px-8 py-4 rounded-[28px] shadow-sm border border-slate-200 text-center">
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">Completion</p>
                <p className="text-2xl font-black text-blue-600">{totalFilled} / {blueprintSlots.length}</p>
             </div>
             <button 
               onClick={onNext} 
               disabled={!isReady}
               className="bg-slate-900 text-white px-10 rounded-[28px] font-black shadow-xl hover:bg-slate-800 transition transform active:scale-95 disabled:opacity-30 flex items-center gap-3 uppercase text-xs tracking-widest"
             >
               Finalize Paper &rarr;
             </button>
          </div>
        </header>

        <div className="bg-white rounded-[40px] shadow-2xl border border-slate-200 overflow-hidden ring-1 ring-black/5">
           <div className="p-8 bg-slate-900 text-white flex justify-between items-center">
              <div>
                 <h3 className="text-lg font-black uppercase tracking-tight">Active Specifications</h3>
                 <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Questions must strictly match CIST requirements to be valid</p>
              </div>
           </div>
           
           <table className="w-full text-left border-collapse table-fixed">
             <thead>
               <tr className="bg-slate-50 text-slate-400 text-[10px] font-black uppercase tracking-widest border-b border-slate-200">
                 <th className="p-6 w-24 text-center">Q. NO</th>
                 <th className="p-6 w-[20%]">Requirement (CLO / Topic)</th>
                 <th className="p-6 w-32 text-center">Taxonomy</th>
                 <th className="p-6 w-28 text-center">Marks</th>
                 <th className="p-6">Registry Question Item</th>
                 <th className="p-6 w-32 text-center">Status</th>
               </tr>
             </thead>
             <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
               {blueprintSlots.map((slot, idx) => {
                 const filledQ = getFilledQuestion(slot.targetNumber);
                 return (
                   <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                     <td className="p-6 text-center">
                        <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center font-black text-slate-900 text-lg border border-slate-200 m-auto">
                           {slot.targetNumber}
                        </div>
                     </td>
                     <td className="p-6">
                        <div className="flex gap-1 flex-wrap mb-1">
                           {slot.clos?.map((c: string) => <span key={c} className="bg-purple-100 text-purple-600 text-[8px] font-black px-1.5 py-0.5 rounded uppercase">{c}</span>)}
                        </div>
                        <div className="text-[11px] font-black text-slate-400 uppercase tracking-tight">{slot.topicCode}</div>
                     </td>
                     <td className="p-6 text-center">
                        <span className="bg-blue-50 text-blue-600 text-[11px] font-black px-3 py-1 rounded-full border border-blue-100">
                           {slot.targetTaxonomy}
                        </span>
                     </td>
                     <td className="p-6 text-center font-black text-slate-800">{slot.targetMarks}M</td>
                     <td className="p-4">
                        {filledQ ? (
                          <div onClick={() => handleOpenPicker(idx)} className="bg-emerald-50 border-2 border-emerald-200 p-4 rounded-2xl cursor-pointer hover:bg-emerald-100 transition group flex justify-between items-center shadow-sm">
                             <div className="flex-grow overflow-hidden">
                                <div className="text-[10px] font-bold text-emerald-900 truncate uppercase tracking-tight">{filledQ.text}</div>
                                <div className="text-[8px] font-black text-emerald-500 uppercase tracking-widest mt-1">Syllabus Match Confirmed</div>
                             </div>
                             <span className="text-[8px] font-black text-emerald-600 border border-emerald-200 px-2 py-1 rounded-lg ml-4 group-hover:bg-emerald-600 group-hover:text-white transition-colors">SWAP</span>
                          </div>
                        ) : (
                          <button onClick={() => handleOpenPicker(idx)} className="w-full py-5 border-2 border-dashed border-blue-200 rounded-2xl text-blue-400 text-[10px] font-black uppercase tracking-[0.2em] hover:border-blue-400 hover:bg-blue-50 transition-all flex items-center justify-center gap-3">
                             <span className="text-lg">+</span> Pull Valid Item
                          </button>
                        )}
                     </td>
                     <td className="p-6 text-center">
                        {filledQ ? (
                           <div className="flex items-center justify-center gap-2 text-emerald-500 font-black text-[10px] uppercase">
                              <span className="w-2 h-2 rounded-full bg-emerald-500"></span> Validated
                           </div>
                        ) : (
                           <div className="text-slate-300 font-black text-[10px] uppercase tracking-widest italic">Empty Slot</div>
                        )}
                     </td>
                   </tr>
                 );
               })}
             </tbody>
           </table>
           
           {blueprintSlots.length === 0 && (
              <div className="py-32 text-center flex flex-col items-center bg-slate-50">
                 <span className="text-6xl mb-4 grayscale opacity-20">📜</span>
                 <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">CIST Blueprint not found for this task</p>
                 <p className="text-xs text-slate-400 mt-2">Please define specifications in the Course Registry first.</p>
              </div>
           )}
        </div>
      </div>

      <QuestionPickerModal 
        isOpen={isPickerOpen} 
        onClose={() => setIsPickerOpen(false)} 
        onSelect={handleSelectQuestion} 
        availableQuestions={fullBank} 
        courseCode={activeCourse?.code || ''}
        maxTaxonomy={blueprintSlots[activeSlotIdx!]?.targetTaxonomy || 'C6'}
        criteria={{
          topic: blueprintSlots[activeSlotIdx!]?.topicCode || '',
          clo: blueprintSlots[activeSlotIdx!]?.clos?.[0] || '',
          taxonomy: blueprintSlots[activeSlotIdx!]?.targetTaxonomy || '',
          marks: blueprintSlots[activeSlotIdx!]?.targetMarks || 0
        }}
        strict
      />
    </div>
  );
};
