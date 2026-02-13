
import React, { useState, useEffect } from 'react';
import { Question, Course, MatrixRow } from '../../types';
import { QuestionPickerModal } from './QuestionPickerModal';

interface CISTManagerProps {
  currentQuestions: Question[];
  onUpdateQuestions: (qs: Question[]) => void;
  availableCourses: Course[];
  activeCourseId?: string;
  cloList: string[];
  mqfList: string[];
  onBack: () => void;
  onNext: () => void;
  fullBank: Question[];
}

interface CISTSlot extends MatrixRow {
  id: string;
  marks: number;
  questionId?: string;
}

const DOMAIN_OPTIONS = ['Cognitive', 'Psychomotor', 'Affective'] as const;

export const CISTManager: React.FC<CISTManagerProps> = ({
  currentQuestions,
  onUpdateQuestions,
  availableCourses,
  activeCourseId,
  cloList,
  mqfList,
  onBack,
  onNext,
  fullBank
}) => {
  const [slots, setSlots] = useState<CISTSlot[]>([]);
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const [activeSlotId, setActiveSlotId] = useState<string | null>(null);

  const activeCourse = availableCourses.find(c => c.id === activeCourseId);
  const hasPredefinedTopics = activeCourse?.topics && activeCourse.topics.length > 0;

  useEffect(() => {
    if (currentQuestions.length > 0 && slots.length === 0) {
      const initialSlots = currentQuestions.map(q => ({
        id: `slot-${q.id}`,
        mqfCluster: q.mqfKeys?.[0] || q.mqfCluster || (mqfList[0] || 'DK1'),
        clo: q.cloKeys?.[0] || q.cloRef || (cloList[0] || 'CLO 1'),
        topic: q.topic || 'General',
        construct: q.construct || '',
        domain: q.domain || 'Cognitive',
        itemType: q.type === 'mcq' ? 'Objective' : 'Subjective',
        taxonomy: q.taxonomy || 'C1',
        marks: q.marks,
        questionId: q.id
      }));
      setSlots(initialSlots);
    } else if (slots.length === 0) {
      addSlot();
    }
  }, []);

  const addSlot = () => {
    const newSlot: CISTSlot = {
      id: `slot-${Date.now()}`,
      mqfCluster: mqfList[0] || 'DK1',
      clo: cloList[0] || 'CLO 1',
      topic: hasPredefinedTopics ? activeCourse?.topics?.[0] : '',
      domain: 'Cognitive',
      construct: '',
      itemType: 'Subjective',
      taxonomy: 'C1',
      marks: 5
    };
    setSlots([...slots, newSlot]);
  };

  const updateSlot = (id: string, field: keyof CISTSlot, value: any) => {
    setSlots(slots.map(s => s.id === id ? { ...s, [field]: value } : s));
  };

  const removeSlot = (id: string) => {
    const slot = slots.find(s => s.id === id);
    if (slot?.questionId) {
      const updatedQs = currentQuestions.filter(q => q.id !== slot.questionId);
      onUpdateQuestions(updatedQs);
    }
    setSlots(slots.filter(s => s.id !== id));
  };

  const handleOpenPicker = (slotId: string) => {
    setActiveSlotId(slotId);
    setIsPickerOpen(true);
  };

  const handleSelectQuestion = (q: Question) => {
    if (!activeSlotId) return;

    setSlots(prev => prev.map(s => s.id === activeSlotId ? { 
      ...s, 
      questionId: q.id,
      topic: q.topic || s.topic,
      marks: q.marks,
      taxonomy: q.taxonomy || s.taxonomy,
      mqfCluster: q.mqfKeys?.[0] || s.mqfCluster,
      domain: q.domain || s.domain,
      construct: q.construct || s.construct,
      itemType: q.type === 'mcq' ? 'Objective' : 'Subjective'
    } : s));

    const otherQs = currentQuestions.filter(curr => {
      const slotForQ = slots.find(slot => slot.questionId === curr.id);
      return slotForQ && slotForQ.id !== activeSlotId;
    });
    onUpdateQuestions([...otherQs, q]);

    setIsPickerOpen(false);
    setActiveSlotId(null);
  };

  const totalMarks = slots.reduce((sum, s) => sum + s.marks, 0);

  return (
    <div className="min-h-screen p-8 animate-in fade-in duration-500">
      <div className="max-w-[1600px] mx-auto">
        <header className="mb-10 flex justify-between items-end">
          <div>
            <h2 className="text-4xl font-black text-slate-900 tracking-tight">Phase 2: Blueprint Architecture</h2>
            <p className="text-slate-500 font-bold uppercase text-[11px] tracking-widest mt-1">Configure Course Item Specification Table (CIST)</p>
          </div>
          <div className="flex gap-4">
             <div className="bg-white px-8 py-4 rounded-[28px] shadow-sm border border-slate-200 text-center">
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">Target Weightage</p>
                <p className="text-2xl font-black text-blue-600">{totalMarks}%</p>
             </div>
             <button 
               onClick={onNext} 
               disabled={slots.some(s => !s.questionId)}
               className="bg-slate-900 text-white px-10 rounded-[28px] font-black shadow-xl hover:bg-slate-800 transition transform active:scale-95 disabled:opacity-30 flex items-center gap-3 uppercase text-xs tracking-widest"
             >
               Finalize Paper &rarr;
             </button>
          </div>
        </header>

        <div className="bg-white rounded-[40px] shadow-2xl border border-slate-200 overflow-hidden">
           <table className="w-full text-left border-collapse table-fixed">
             <thead>
               <tr className="bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest">
                 <th className="p-6 w-16 text-center">#</th>
                 <th className="p-6 w-[15%]">MQF Attributes</th>
                 <th className="p-6 w-[12%]">CLO</th>
                 <th className="p-6 w-[20%]">Topic / Unit</th>
                 <th className="p-6 w-32">Domain</th>
                 <th className="p-6 w-32">Type</th>
                 <th className="p-6 w-24">Taxonomy</th>
                 <th className="p-6 w-20 text-center">Marks</th>
                 <th className="p-6 w-[18%]">Linked Content</th>
                 <th className="p-6 w-16"></th>
               </tr>
             </thead>
             <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
               {slots.map((slot, idx) => {
                 const question = fullBank.find(q => q.id === slot.questionId);
                 return (
                   <tr key={slot.id} className="hover:bg-slate-50/50 transition-colors group">
                     <td className="p-6 text-center font-black text-slate-300">{idx + 1}</td>
                     <td className="p-4">
                        <select className="w-full bg-slate-50 border border-slate-100 rounded-xl p-2.5 text-[10px] font-bold outline-none focus:border-blue-400" value={slot.mqfCluster} onChange={e => updateSlot(slot.id, 'mqfCluster', e.target.value)}>
                          {mqfList.map(m => <option key={m} value={m}>{m}</option>)}
                        </select>
                     </td>
                     <td className="p-4">
                        <select className="w-full bg-slate-50 border border-slate-100 rounded-xl p-2.5 text-[10px] font-bold outline-none focus:border-blue-400" value={slot.clo} onChange={e => updateSlot(slot.id, 'clo', e.target.value)}>
                          {cloList.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                     </td>
                     <td className="p-4">
                       {hasPredefinedTopics ? (
                         <select 
                           className="w-full bg-slate-50 border border-slate-100 rounded-xl p-2.5 text-[10px] font-bold outline-none focus:border-blue-400"
                           value={slot.topic}
                           onChange={e => updateSlot(slot.id, 'topic', e.target.value)}
                         >
                           <option value="">-- SELECT TOPIC --</option>
                           {activeCourse?.topics?.map(t => (
                             <option key={t} value={t}>{t}</option>
                           ))}
                         </select>
                       ) : (
                         <input className="w-full bg-slate-50 border border-slate-100 rounded-xl p-2.5 text-[10px] font-bold outline-none focus:border-blue-400" placeholder="Topic code..." value={slot.topic} onChange={e => updateSlot(slot.id, 'topic', e.target.value)} />
                       )}
                     </td>
                     <td className="p-4">
                        <select className="w-full bg-slate-50 border border-slate-100 rounded-xl p-2.5 text-[10px] font-bold outline-none focus:border-blue-400" value={slot.domain} onChange={e => updateSlot(slot.id, 'domain', e.target.value)}>
                          {DOMAIN_OPTIONS.map(d => <option key={d} value={d}>{d}</option>)}
                        </select>
                     </td>
                     <td className="p-4">
                        <select className="w-full bg-slate-50 border border-slate-100 rounded-xl p-2.5 text-[10px] font-bold outline-none focus:border-blue-400" value={slot.itemType} onChange={e => updateSlot(slot.id, 'itemType', e.target.value)}>
                          <option value="Objective">Objective</option>
                          <option value="Subjective">Subjective</option>
                        </select>
                     </td>
                     <td className="p-4">
                        <input className="w-full bg-slate-50 border border-slate-100 rounded-xl p-2.5 text-[10px] font-black text-center outline-none focus:border-blue-400" value={slot.taxonomy} onChange={e => updateSlot(slot.id, 'taxonomy', e.target.value)} />
                     </td>
                     <td className="p-4">
                        <input type="number" className="w-full bg-slate-50 border border-slate-100 rounded-xl p-2.5 text-[10px] font-black text-center outline-none focus:border-blue-400" value={slot.marks} onChange={e => updateSlot(slot.id, 'marks', parseInt(e.target.value) || 0)} />
                     </td>
                     <td className="p-4">
                        {question ? (
                          <div onClick={() => handleOpenPicker(slot.id)} className="bg-emerald-50 border border-emerald-200 p-2.5 rounded-xl cursor-pointer hover:bg-emerald-100 transition group/item">
                             <div className="text-[10px] font-bold text-emerald-900 truncate uppercase tracking-tight">{question.text}</div>
                             <div className="text-[8px] font-black text-emerald-600 uppercase tracking-widest mt-1">ID: {question.id}</div>
                          </div>
                        ) : (
                          <button onClick={() => handleOpenPicker(slot.id)} className="w-full py-3 border-2 border-dashed border-slate-200 rounded-xl text-slate-400 text-[9px] font-black uppercase tracking-widest hover:border-blue-400 hover:text-blue-600 transition">+ Select Item</button>
                        )}
                     </td>
                     <td className="p-6 text-center">
                        <button onClick={() => removeSlot(slot.id)} className="text-slate-300 hover:text-red-500 transition-colors text-xl font-bold">&times;</button>
                     </td>
                   </tr>
                 );
               })}
             </tbody>
           </table>
           <button onClick={addSlot} className="w-full py-6 bg-slate-50 text-slate-500 font-black uppercase text-[10px] tracking-[0.3em] hover:bg-slate-100 transition-colors border-t border-slate-100">+ Add Specification Slot</button>
        </div>
      </div>

      <QuestionPickerModal 
        isOpen={isPickerOpen} onClose={() => setIsPickerOpen(false)} onSelect={handleSelectQuestion} availableQuestions={fullBank} courseCode={activeCourseId || ''}
        criteria={{
          topic: slots.find(s => s.id === activeSlotId)?.topic || '',
          clo: slots.find(s => s.id === activeSlotId)?.clo || '',
          taxonomy: slots.find(s => s.id === activeSlotId)?.taxonomy || '',
          marks: slots.find(s => s.id === activeSlotId)?.marks || 0
        }}
      />
    </div>
  );
};
