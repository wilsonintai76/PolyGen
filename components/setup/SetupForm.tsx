
import React, { useMemo } from 'react';
import { HeaderData, StudentSectionData, FooterData, Question, Course, User, Department } from '../../types';
import { CourseSelectorCard } from './CourseSelectorCard';
import { AssessmentParamsCard } from './AssessmentParamsCard';
import { BlueprintSummaryCard } from './BlueprintSummaryCard';
import { ComplianceCard } from './ComplianceCard';

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
  currentUser?: User;
  departments?: Department[];
}

export const SetupForm: React.FC<SetupFormProps> = (props) => {
  const { 
    header, student, instructions, 
    onUpdateHeader, onUpdateStudent, onUpdateInstructions,
    onNext, availableCourses, onCourseSelect, currentUser, departments
  } = props;

  const selectedCourse = useMemo(() => 
    availableCourses.find(c => c.code === header.courseCode), 
    [availableCourses, header.courseCode]
  );

  const activeDepartment = useMemo(() => 
    departments?.find(d => d.id === selectedCourse?.deptId),
    [departments, selectedCourse]
  );

  const handleInstructionChange = (index: number, value: string) => {
    const newIns = [...instructions];
    newIns[index] = value;
    onUpdateInstructions(newIns);
  };

  const isBlueprintReady = useMemo(() => {
    if (!selectedCourse?.jsuTemplate) return false;
    // Check if the selected assessment task exists in the blueprint
    return selectedCourse.jsuTemplate.some(r => r.task === header.assessmentType);
  }, [selectedCourse, header.assessmentType]);

  const headingClass = "font-black text-slate-400 uppercase tracking-widest text-[10px] mb-2 flex items-center gap-2";
  const inputClass = "w-full border border-slate-200 rounded-xl p-3 text-xs font-bold text-slate-700 bg-white outline-none focus:border-blue-500 shadow-sm transition-all";

  return (
    <div className="bg-slate-50 min-h-screen flex flex-col items-center py-10 px-4">
      {/* SOP Header Banner */}
      <div className="max-w-[1500px] w-full bg-white rounded-[40px] shadow-xl border border-slate-200 p-1 mb-8">
         <div className="bg-slate-900 rounded-[36px] px-8 py-4 flex justify-between items-center text-white">
            <div className="flex items-center gap-4">
               <div className="bg-blue-600 px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest shadow-lg animate-pulse">
                  Active
               </div>
               <h1 className="text-lg font-black uppercase tracking-tight">SOP Phase 2: Assessment Drafting & Initialization</h1>
            </div>
            <div className="hidden md:flex items-center gap-6 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
               <span>1. Specification <span className="text-emerald-500">✔</span></span>
               <span className="text-white">2. Drafting & Mapping ✎</span>
               <span>3. Verification ⏳</span>
               <span>4. Endorsement 🔒</span>
            </div>
         </div>
      </div>

      <div className="max-w-[1500px] w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Configuration */}
        <div className="lg:col-span-8 space-y-6">
           {/* Section 1: Target Definition */}
           <div className="bg-white p-8 rounded-[32px] shadow-sm border border-slate-200 space-y-6">
              <div className="flex items-center gap-3 border-b border-slate-100 pb-4 mb-2">
                 <span className="text-2xl">🎯</span>
                 <h2 className="text-lg font-black text-slate-800 uppercase tracking-tight">Target Specification</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                 <CourseSelectorCard availableCourses={availableCourses} header={header} onCourseSelect={onCourseSelect} />
                 <AssessmentParamsCard header={header} student={student} onUpdateHeader={onUpdateHeader} onUpdateStudent={onUpdateStudent} availableCourses={availableCourses} />
              </div>
           </div>

           {/* Section 2: Instructions */}
           <div className="bg-white p-8 rounded-[32px] shadow-sm border border-slate-200 flex flex-col h-[400px]">
              <div className="flex justify-between items-center border-b border-slate-100 pb-4 mb-4">
                 <div className="flex items-center gap-3">
                    <span className="text-2xl">📝</span>
                    <h2 className="text-lg font-black text-slate-800 uppercase tracking-tight">Student Instructions</h2>
                 </div>
                 <button onClick={() => onUpdateInstructions([...instructions, ''])} className="bg-slate-100 text-slate-600 font-black text-[10px] px-4 py-2 rounded-xl hover:bg-slate-200 transition uppercase tracking-widest">+ Add Line</button>
              </div>
              <div className="space-y-3 flex-grow overflow-y-auto pr-2 custom-scrollbar">
                {instructions.map((ins, i) => (
                  <div key={i} className="flex gap-3 items-center group">
                    <span className="text-[10px] font-black text-slate-300 w-4 shrink-0">{i+1}.</span>
                    <input className={inputClass} value={ins} onChange={e => handleInstructionChange(i, e.target.value)} />
                    <button onClick={() => onUpdateInstructions(instructions.filter((_, idx) => idx !== i))} className="text-slate-200 group-hover:text-rose-500 transition-colors font-bold text-lg px-2">&times;</button>
                  </div>
                ))}
              </div>
           </div>
        </div>

        {/* Right Column: Validation & Stats */}
        <div className="lg:col-span-4 space-y-6">
           {/* CIST Blueprint Summary */}
           <div className="h-64">
              <BlueprintSummaryCard course={selectedCourse} assessmentType={header.assessmentType} />
           </div>

           {/* Compliance / Signatories */}
           <div className="h-80">
              <ComplianceCard 
                 currentUser={currentUser} 
                 coordinatorName="TBA (Auto-Assigned)" 
                 approverName={activeDepartment?.headOfDept || "Head of Department"} 
              />
           </div>

           {/* Action Area */}
           <div className="bg-white p-6 rounded-[32px] shadow-xl border border-blue-100 sticky bottom-4">
              {!isBlueprintReady && header.assessmentType && (
                 <div className="mb-4 p-3 bg-rose-50 border border-rose-100 rounded-xl flex gap-3 items-start">
                    <span className="text-lg">🚫</span>
                    <div>
                       <div className="text-[10px] font-black text-rose-600 uppercase tracking-widest">Blueprint Missing</div>
                       <p className="text-[10px] text-rose-800 leading-tight mt-1">
                          The Coordinator has not defined the CIST specification for <strong>{header.assessmentType}</strong> yet. You cannot proceed.
                       </p>
                    </div>
                 </div>
              )}
              
              <button 
                onClick={onNext} 
                disabled={!isBlueprintReady}
                className="w-full bg-blue-600 text-white font-black py-5 rounded-[24px] shadow-2xl hover:bg-blue-700 transition transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex flex-col items-center justify-center gap-1"
              >
                <span className="uppercase tracking-[0.2em] text-xs">Initialize Question Terminal</span>
                {isBlueprintReady && <span className="text-[9px] opacity-80 font-bold">Matches CIST Specification</span>}
              </button>
           </div>
        </div>
      </div>
    </div>
  );
};
