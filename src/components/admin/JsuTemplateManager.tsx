
import React, { useState } from 'react';
import { Course, MatrixRow } from '../../types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { X, Plus } from 'lucide-react';

interface JsuTemplateManagerProps {
  course: Course;
  onSave: (updatedCourse: Course) => void;
  onCancel: () => void;
}

/**
 * Extension of MatrixRow for managing JSU slots in the UI.
 * Includes flattened fields for specific question linkage.
 */
interface JsuSlot extends MatrixRow {
  clo?: string;
  topic?: string;
  itemType?: string;
  taxonomy?: string;
  marks?: number;
}

const DOMAIN_OPTIONS = ['Cognitive', 'Psychomotor', 'Affective'] as const;

export const JsuTemplateManager: React.FC<JsuTemplateManagerProps> = ({ course, onSave, onCancel }) => {
  const [template, setTemplate] = useState<JsuSlot[]>(course.jsuTemplate as JsuSlot[] || []);
  
  const cloList = Object.keys(course.clos);
  const daList = Object.keys(course.da || {});

  const addSlot = () => {
    // Fix: initialize with fields that satisfy JsuSlot extension
    const newSlot: JsuSlot = {
      daCluster: daList[0] || 'DK1',
      clo: cloList[0] || 'CLO 1',
      topic: '',
      domain: 'Cognitive',
      construct: '',
      itemType: 'Subjective',
      taxonomy: 'C1',
      marks: 5
    };
    setTemplate([...template, newSlot]);
  };

  const updateSlot = (idx: number, field: keyof JsuSlot, value: string | number | string[]) => {
    const next = [...template];
    next[idx] = { ...next[idx], [field]: value };
    setTemplate(next);
  };

  const removeSlot = (idx: number) => {
    setTemplate(template.filter((_, i) => i !== idx));
  };

  const handleFinalSave = () => {
    onSave({ ...course, jsuTemplate: template });
  };

  return (
    <div className="p-10 max-w-[1600px] mx-auto animate-in fade-in duration-500">
      <header className="mb-10 flex justify-between items-end">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <span className="bg-blue-600 text-white px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest">Blueprint Mode</span>
            <h2 className="text-4xl font-black text-slate-900 tracking-tight uppercase">JSU Specification for {course.code}</h2>
          </div>
          <p className="text-slate-500 font-bold uppercase text-[11px] tracking-widest">Define the mandatory distribution of marks and levels for all assessments of this course</p>
        </div>
        <div className="flex gap-4">
           <Button variant="outline" onClick={onCancel} className="bg-white text-slate-500 px-8 h-12 rounded-full font-black border border-slate-200 hover:bg-slate-50 transition uppercase text-[10px] tracking-widest">Cancel</Button>
           <Button 
             onClick={handleFinalSave}
             className="bg-blue-600 text-white px-10 h-12 rounded-full font-black shadow-xl hover:bg-blue-700 transition transform active:scale-95 uppercase text-xs tracking-widest"
           >
             Save Blueprint Template
           </Button>
        </div>
      </header>

      <div className="bg-white rounded-[40px] shadow-2xl border border-slate-200 overflow-hidden">
        <div className="p-10 border-b border-slate-100 flex justify-between items-center">
            <div>
              <h3 className="text-lg font-black text-slate-800 uppercase tracking-tight">CIST Construction Grid</h3>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Reviewers must define slots before Creators can generate papers</p>
            </div>
            <Button onClick={addSlot} className="bg-slate-900 text-white px-6 h-10 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg hover:bg-slate-800 transition">
              <Plus className="h-4 w-4 mr-2" /> Add Blueprint Slot
            </Button>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse table-fixed">
            <thead>
              <tr className="bg-slate-50 text-slate-400 text-[10px] font-black uppercase tracking-widest border-b border-slate-100">
                <th className="p-6 w-16 text-center">#</th>
                <th className="p-6 w-[15%]">Dublin Accord Attributes</th>
                <th className="p-6 w-[12%]">CLO</th>
                <th className="p-6 w-[20%]">Topic / Unit</th>
                <th className="p-6 w-28">Domain</th>
                <th className="p-6 w-32">Type</th>
                <th className="p-6 w-24">Taxonomy</th>
                <th className="p-6 w-24 text-center">Marks</th>
                <th className="p-6 w-16"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {template.map((slot, idx) => (
                <tr key={idx} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="p-6 text-center font-black text-slate-300">{idx + 1}</td>
                  <td className="p-4">
                     <select className="w-full bg-white border border-slate-100 rounded-xl h-10 px-3 text-[10px] font-bold outline-none focus:border-blue-400 shadow-sm" value={slot.daCluster} onChange={e => updateSlot(idx, 'daCluster', e.target.value)}>
                       {daList.length > 0 ? daList.map(m => <option key={m} value={m}>{m}</option>) : <option value="">No Attributes</option>}
                     </select>
                  </td>
                  <td className="p-4">
                     <select className="w-full bg-white border border-slate-100 rounded-xl h-10 px-3 text-[10px] font-bold outline-none focus:border-blue-400 shadow-sm" value={slot.clo} onChange={e => updateSlot(idx, 'clo', e.target.value)}>
                       {cloList.length > 0 ? cloList.map(c => <option key={c} value={c}>{c}</option>) : <option value="">No CLO</option>}
                     </select>
                  </td>
                  <td className="p-4">
                    <Input className="w-full bg-white border border-slate-100 rounded-xl h-10 text-[10px] font-bold outline-none focus-visible:ring-blue-400 shadow-sm" placeholder="Unit..." value={slot.topic || ''} onChange={e => updateSlot(idx, 'topic', e.target.value)} />
                  </td>
                  <td className="p-4">
                     <select className="w-full bg-white border border-slate-100 rounded-xl h-10 px-3 text-[10px] font-bold outline-none focus:border-blue-400 shadow-sm" value={slot.domain} onChange={e => updateSlot(idx, 'domain', e.target.value)}>
                       {DOMAIN_OPTIONS.map(d => <option key={d} value={d}>{d}</option>)}
                     </select>
                  </td>
                  <td className="p-4">
                     <select className="w-full bg-white border border-slate-100 rounded-xl h-10 px-3 text-[10px] font-bold outline-none focus:border-blue-400 shadow-sm" value={slot.itemType || 'Subjective'} onChange={e => updateSlot(idx, 'itemType', e.target.value)}>
                       <option value="Objective">Objective</option>
                       <option value="Subjective">Subjective</option>
                     </select>
                  </td>
                  <td className="p-4">
                     <Input className="w-full bg-white border border-slate-100 rounded-xl h-10 text-[10px] font-black text-center outline-none focus-visible:ring-blue-400 shadow-sm uppercase" value={slot.taxonomy || ''} onChange={e => updateSlot(idx, 'taxonomy', e.target.value.toUpperCase())} />
                  </td>
                  <td className="p-4">
                     <Input type="number" className="w-full bg-white border border-slate-100 rounded-xl h-10 text-[10px] font-black text-center outline-none focus-visible:ring-blue-400 shadow-sm" value={slot.marks || 0} onChange={e => updateSlot(idx, 'marks', parseInt(e.target.value) || 0)} />
                  </td>
                  <td className="p-6 text-center">
                     <Button variant="ghost" size="icon" onClick={() => removeSlot(idx)} className="text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors h-8 w-8">
                       <X className="h-4 w-4" />
                     </Button>
                  </td>
                </tr>
              ))}
              {template.length === 0 && (
                <tr>
                  <td colSpan={9} className="p-20 text-center">
                     <div className="flex flex-col items-center opacity-20">
                        <span className="text-6xl mb-4">📐</span>
                        <p className="text-[11px] font-black uppercase tracking-widest">Add slots to build the specification blueprint</p>
                     </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
