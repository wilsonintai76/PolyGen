
import React, { useEffect } from 'react';
import { HeaderData, StudentSectionData, FooterData, Question, Course } from '../../types';
import { CLOMappingSection } from './CLOMappingSection';
import { MQFMappingSection } from './MQFMappingSection';
import { CourseSelectorCard } from './CourseSelectorCard';
import { AssessmentParamsCard } from './AssessmentParamsCard';

interface SetupFormProps {
  header: HeaderData;
  student: StudentSectionData;
  footer: FooterData;
  instructions: string[];
  questions: Question[];
  cloDefinitions: Record<string, string>;
  mqfClusters: Record<string, string>;
  onUpdateHeader: (h: HeaderData) => void;
  onUpdateStudent: (s: StudentSectionData) => void;
  onUpdateFooter: (f: FooterData) => void;
  onUpdateInstructions: (ins: string[]) => void;
  onUpdateCLOs: (clos: Record<string, string>) => void;
  onUpdateMQF: (mqf: Record<string, string>) => void;
  onNext: () => void;
  availableCourses: Course[];
  onCourseSelect: (courseId: string) => void;
}

export const SetupForm: React.FC<SetupFormProps> = (props) => {
  const { 
    header, student, footer, instructions, questions, cloDefinitions, mqfClusters, 
    onUpdateHeader, onUpdateStudent, onUpdateFooter, onUpdateInstructions,
    onUpdateCLOs, onUpdateMQF, onNext, availableCourses, onCourseSelect
  } = props;

  useEffect(() => {
    if (questions.length > 0) {
      const detectedClos = new Set<string>();
      const detectedMqfs = new Set<string>();
      questions.forEach(q => {
        q.cloKeys?.forEach(k => detectedClos.add(k));
        q.mqfKeys?.forEach(k => detectedMqfs.add(k));
      });
      const updatedClos = { ...cloDefinitions };
      let changedC = false;
      detectedClos.forEach(k => { if (!updatedClos[k]) { updatedClos[k] = ''; changedC = true; } });
      if (changedC) onUpdateCLOs(updatedClos);
      const updatedMqfs = { ...mqfClusters };
      let changedM = false;
      detectedMqfs.forEach(k => { if (!updatedMqfs[k]) { updatedMqfs[k] = ''; changedM = true; } });
      if (changedM) onUpdateMQF(updatedMqfs);
    }
  }, [questions]);

  const handleInstructionChange = (index: number, value: string) => {
    const newIns = [...instructions];
    newIns[index] = value;
    onUpdateInstructions(newIns);
  };

  const inputClass = "w-full border border-[#e2e8f0] rounded-xl p-3 text-sm font-bold text-[#1e293b] bg-white outline-none focus:border-blue-500 shadow-sm transition-all";
  const boxClass = "bg-[#f8fafc] p-6 rounded-[24px] border border-[#f1f5f9] space-y-5 shadow-sm";
  const headingClass = "font-black text-[#3b82f6] uppercase tracking-widest text-[11px] mb-4 flex items-center gap-2";

  return (
    <div className="bg-white p-10 rounded-[40px] shadow-2xl max-w-[1500px] w-full mx-auto space-y-10 animate-in fade-in zoom-in duration-500">
      <div className="flex items-center gap-4">
        <div className="w-14 h-14 bg-[#2563eb] rounded-2xl flex items-center justify-center text-white shadow-lg">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
        <div>
          <h2 className="text-4xl font-black text-[#0f172a] tracking-tight">Paper Configuration</h2>
          <p className="text-[#94a3b8] font-bold uppercase text-[11px] tracking-widest mt-1">Enterprise Mode: Django & PostgreSQL persistence active</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
        <div className="space-y-6">
          <CourseSelectorCard availableCourses={availableCourses} header={header} onCourseSelect={onCourseSelect} />
          <AssessmentParamsCard header={header} student={student} onUpdateHeader={onUpdateHeader} onUpdateStudent={onUpdateStudent} />
        </div>

        <div className="space-y-6">
          <section className={boxClass}>
            <h3 className={headingClass}>3. SIGNATORIES</h3>
            <input className={inputClass} placeholder="Prepared By" value={footer.preparedBy} onChange={e => onUpdateFooter({...footer, preparedBy: e.target.value})} />
            <input className={inputClass} placeholder="Reviewed By" value={footer.reviewedBy} onChange={e => onUpdateFooter({...footer, reviewedBy: e.target.value})} />
            <input className={inputClass} placeholder="Endorsed By" value={footer.endorsedBy} onChange={e => onUpdateFooter({...footer, endorsedBy: e.target.value})} />
          </section>
          <section className={boxClass}>
            <div className="flex justify-between items-center mb-2">
              <h3 className={headingClass}>4. INSTRUCTIONS</h3>
              <button onClick={() => onUpdateInstructions([...instructions, ''])} className="text-blue-500 font-black text-[10px]">+ ADD</button>
            </div>
            <div className="space-y-2 max-h-[150px] overflow-y-auto pr-2 custom-scrollbar">
              {instructions.map((ins, i) => (
                <div key={i} className="flex gap-2 items-center">
                  <span className="text-[10px] font-black text-slate-300 w-3">{i+1}.</span>
                  <input className={inputClass} value={ins} onChange={e => handleInstructionChange(i, e.target.value)} />
                </div>
              ))}
            </div>
          </section>
        </div>

        <CLOMappingSection cloDefinitions={cloDefinitions} onUpdate={onUpdateCLOs} />
        <MQFMappingSection mqfClusters={mqfClusters} onUpdate={onUpdateMQF} />
      </div>

      <div className="flex justify-end pt-10 border-t">
        <button onClick={onNext} disabled={!header.courseCode} className="bg-[#2563eb] text-white font-black py-4 px-12 rounded-2xl shadow-xl transform active:scale-95 disabled:opacity-30 flex items-center gap-3">
          SELECT QUESTIONS FROM BANK
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
        </button>
      </div>
    </div>
  );
};
