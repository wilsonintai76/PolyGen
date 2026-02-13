
import React, { useState, useMemo } from 'react';
import { Course, MatrixRow, CISTCognitiveLevel, AssessmentDomain } from '../../types';
import { CISTTableHeader } from './CISTTableHeader';
import { CISTTableRow } from './CISTTableRow';

interface CISTTemplateManagerProps {
  course: Course;
  onSave: (updatedCourse: Course) => void;
  onCancel: () => void;
}

const DOMAIN_LEVELS: Record<AssessmentDomain, string[]> = {
  'Cognitive': ['C1', 'C2', 'C3', 'C4', 'C5', 'C6'],
  'Psychomotor': ['P1', 'P2', 'P3', 'P4', 'P5', 'P6', 'P7'],
  'Affective': ['A1', 'A2', 'A3', 'A4', 'A5']
};

const LEVEL_DESCRIPTIONS: Record<string, string> = {
  'C1': 'Remember', 'C2': 'Understand', 'C3': 'Apply', 'C4': 'Analyze', 'C5': 'Evaluate', 'C6': 'Create',
  'P1': 'Perception', 'P2': 'Set', 'P3': 'Guided Response', 'P4': 'Mechanism', 'P5': 'Complex Overt Response', 'P6': 'Adaptation', 'P7': 'Origination',
  'A1': 'Receiving', 'A2': 'Responding', 'A3': 'Valuing', 'A4': 'Organization', 'A5': 'Characterization'
};

const ITEM_TYPES = ['P', 'R', 'A', 'O', 'S'];
const CLO_KEYS = ['CLO1', 'CLO2', 'CLO3'];

export const CISTTemplateManager: React.FC<CISTTemplateManagerProps> = ({ course, onSave, onCancel }) => {
  const [activeDomain, setActiveDomain] = useState<AssessmentDomain>('Cognitive');

  // Initialize all rows from course registry
  const [template, setTemplate] = useState<MatrixRow[]>(() => {
    return (course.jsuTemplate || []).map(row => ({
      ...row,
      levels: row.levels || row.cognitiveLevels || {},
      domain: row.domain || 'Cognitive'
    }));
  });

  // Rows for the currently visible tab
  const domainRows = useMemo(() => template.filter(r => r.domain === activeDomain), [template, activeDomain]);
  const levels = DOMAIN_LEVELS[activeDomain];

  // Validation: Check for duplicate question numbers (#) within the same Assessment Task
  const duplicateMap = useMemo(() => {
    const map: Record<string, Set<string>> = {}; // Task -> Set of numbers
    const duplicates: Record<number, Record<string, boolean>> = {}; // RowIdx -> LevelKey -> IsDuplicate

    domainRows.forEach((row, rowIdx) => {
      const task = (row.task || '').trim().toUpperCase();
      if (!task) return;
      if (!map[task]) map[task] = new Set();
      
      if (!duplicates[rowIdx]) duplicates[rowIdx] = {};

      Object.entries(row.levels || {}).forEach(([levelKey, levelData]) => {
        const num = (levelData.count || '').trim();
        if (num) {
          const uniqueKey = `${task}_${num}`;
          // Since we are iterating once, we need a better check.
          // Let's do a two-pass check for robustness.
        }
      });
    });

    // Better two-pass duplicate detection
    const globalTaskNumbers: Record<string, Record<string, number>> = {}; // Task -> Number -> Frequency
    domainRows.forEach(row => {
      const task = (row.task || '').trim().toUpperCase();
      if (!task) return;
      if (!globalTaskNumbers[task]) globalTaskNumbers[task] = {};
      Object.values(row.levels || {}).forEach(ld => {
        const n = (ld.count || '').trim();
        if (n) globalTaskNumbers[task][n] = (globalTaskNumbers[task][n] || 0) + 1;
      });
    });

    domainRows.forEach((row, rowIdx) => {
      const task = (row.task || '').trim().toUpperCase();
      duplicates[rowIdx] = {};
      Object.entries(row.levels || {}).forEach(([lk, ld]) => {
        const n = (ld.count || '').trim();
        if (n && task && globalTaskNumbers[task][n] > 1) {
          duplicates[rowIdx][lk] = true;
        }
      });
    });

    return duplicates;
  }, [domainRows]);

  // Logic to calculate row spans for merging identical consecutive cells
  const rowSpans = useMemo(() => {
    const spans: Record<string, number[]> = {
      task: new Array(domainRows.length).fill(1),
      topicCode: new Array(domainRows.length).fill(1),
      clos: new Array(domainRows.length).fill(1),
      construct: new Array(domainRows.length).fill(1),
      itemTypes: new Array(domainRows.length).fill(1)
    };

    const keys: (keyof typeof spans)[] = ['task', 'topicCode', 'clos', 'construct', 'itemTypes'];

    keys.forEach(key => {
      for (let i = 0; i < domainRows.length; i++) {
        let span = 1;
        const currentVal = JSON.stringify(domainRows[i][key as keyof MatrixRow]);
        
        if (!currentVal || currentVal === '""' || currentVal === '[]' || currentVal === 'null') {
          continue;
        }

        for (let j = i + 1; j < domainRows.length; j++) {
          if (JSON.stringify(domainRows[j][key as keyof MatrixRow]) === currentVal) {
            span++;
            spans[key][j] = 0;
          } else {
            break;
          }
        }
        spans[key][i] = span;
        i += span - 1;
      }
    });

    return spans;
  }, [domainRows]);

  const addRow = () => {
    const newRow: MatrixRow = {
      task: '',
      clos: [],
      topicCode: `T${template.length + 1}`,
      domain: activeDomain,
      levels: levels.reduce((acc, l) => {
        acc[l] = { count: '', marks: 0 };
        return acc;
      }, {} as Record<string, CISTCognitiveLevel>),
      totalMark: 0,
      construct: '',
      itemTypes: []
    };
    setTemplate([...template, newRow]);
  };

  const updateRowInGlobal = (rowToUpdate: MatrixRow, updates: Partial<MatrixRow>) => {
    setTemplate(prev => {
      const idx = prev.findIndex(r => r === rowToUpdate);
      if (idx === -1) return prev;
      const next = [...prev];
      next[idx] = { ...next[idx], ...updates };
      return next;
    });
  };

  const removeRowFromGlobal = (rowToRemove: MatrixRow) => {
    setTemplate(prev => prev.filter(r => r !== rowToRemove));
  };

  const toggleArrayItemInGlobal = (rowToUpdate: MatrixRow, field: 'clos' | 'itemTypes', value: string) => {
    const current = [...(rowToUpdate[field] || [])];
    const next = current.includes(value) 
      ? current.filter(item => item !== value)
      : [...current, value];
    updateRowInGlobal(rowToUpdate, { [field]: next });
  };

  const totals = useMemo(() => {
    const levelTotals = levels.reduce((acc, level) => {
      acc[level] = domainRows.reduce((sum, row) => sum + (row.levels?.[level]?.marks || 0), 0);
      return acc;
    }, {} as Record<string, number>);
    const grandTotal = Object.values(levelTotals).reduce((a, b) => a + b, 0);
    return { levelTotals, grandTotal };
  }, [domainRows, levels]);

  return (
    <div className="p-8 max-w-[1800px] mx-auto bg-white min-h-screen animate-in fade-in duration-500 overflow-x-auto print-exact custom-scrollbar">
      {/* Institutional Branding Header */}
      <div className="border-2 border-black mb-6">
        <div className="bg-white p-6 flex flex-col items-center border-b-2 border-black text-center text-black">
          <div className="mb-2">
             <h1 className="text-3xl font-black uppercase tracking-tight leading-none">POLITEKNIK MALAYSIA KUCHING SARAWAK</h1>
             <p className="text-base font-black mt-2">JABATAN KEJURUTERAAN MEKANIKAL</p>
          </div>
          <h2 className="text-xl font-black uppercase border-t-2 border-black pt-3 mt-3 w-full tracking-widest bg-slate-50">COURSEWORK ITEM SPECIFICATION TABLE (CIST)</h2>
        </div>
        <div className="grid grid-cols-2 text-xs font-black uppercase bg-white">
           <div className="p-3.5 border-r-2 border-black text-black">DEPARTMENT : JABATAN KEJURUTERAAN MEKANIKAL</div>
           <div className="p-3.5 text-black">COURSE NAME : {course.name || 'N/A'}</div>
           <div className="p-3.5 border-t-2 border-r-2 border-black text-black">COURSE CODE : {course.code || 'N/A'}</div>
           <div className="p-3.5 border-t-2 border-black text-black">SESSION : II 2024/2025</div>
        </div>
      </div>

      {/* CLO Section */}
      <div className="border-2 border-black mb-6 p-6 text-xs bg-slate-50">
        <h3 className="font-black underline mb-4 uppercase text-sm text-black">Course Learning Outcome (CLO)</h3>
        <p className="mb-4 italic font-bold text-black">Upon completion of this course, students should be able to:-</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-2">
          {Object.entries(course.clos || {}).map(([key, val]) => (
            <div key={key} className="flex gap-4 items-start font-bold">
              <span className="shrink-0 bg-blue-600 text-white px-2 py-0.5 rounded text-[10px]">{key}</span>
              <span className="text-black">{val || 'Pending description...'}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="flex gap-1 mb-4 no-print">
        {(['Cognitive', 'Psychomotor', 'Affective'] as AssessmentDomain[]).map(d => (
          <button 
            key={d}
            onClick={() => setActiveDomain(d)}
            className={`px-8 py-3 rounded-t-2xl font-black uppercase tracking-widest text-[10px] transition-all border-x-2 border-t-2 ${
              activeDomain === d 
                ? 'bg-blue-600 text-white border-blue-600 shadow-lg translate-y-[-2px]' 
                : 'bg-slate-100 text-slate-400 border-slate-200 hover:bg-slate-200'
            }`}
          >
            {d} DOMAIN
          </button>
        ))}
      </div>

      <div className="overflow-x-auto mb-10 shadow-xl border-2 border-black bg-white">
        <table className="w-full border-collapse text-[10px] uppercase font-bold text-center">
          <CISTTableHeader levels={levels} cloKeys={CLO_KEYS} itemTypes={ITEM_TYPES} domainLabel={activeDomain} />
          <tbody className="bg-white divide-y divide-black/20">
            {domainRows.map((row, idx) => (
              <CISTTableRow 
                key={idx}
                row={row}
                index={idx}
                levels={levels}
                cloKeys={CLO_KEYS}
                itemTypes={ITEM_TYPES}
                onUpdate={(updates) => updateRowInGlobal(row, updates)}
                onToggleArray={(f, v) => toggleArrayItemInGlobal(row, f, v)}
                onRemove={() => removeRowFromGlobal(row)}
                course={course}
                duplicateLevels={duplicateMap[idx]}
                spans={{
                  task: rowSpans.task[idx],
                  topicCode: rowSpans.topicCode[idx],
                  clos: rowSpans.clos[idx],
                  construct: rowSpans.construct[idx],
                  itemTypes: rowSpans.itemTypes[idx]
                }}
              />
            ))}
            {domainRows.length === 0 && (
              <tr>
                <td colSpan={30} className="py-20 text-center text-slate-300 italic font-black uppercase tracking-[0.3em]">
                  No entries for {activeDomain} domain. Click button below to add.
                </td>
              </tr>
            )}
          </tbody>
          <tfoot className="border-t-2 border-black">
             <tr className="bg-[#F4F9FF] h-12">
               <td colSpan={CLO_KEYS.length + 2} className="border-r-2 border-black font-black uppercase text-xs text-right pr-6 text-black">TOTALS</td>
               {levels.map(level => (
                 <React.Fragment key={level}>
                   <td className="border-r border-black bg-slate-100"></td>
                   <td className="border-r-2 border-black bg-white font-black text-blue-700 text-sm">{totals.levelTotals[level]}</td>
                 </React.Fragment>
               ))}
               <td className="border-r-2 border-black bg-blue-50 font-black text-base text-black">{totals.grandTotal}</td>
               <td colSpan={ITEM_TYPES.length + 1} className="bg-slate-50"></td>
               <td className="no-print"></td>
             </tr>
             <tr className="bg-[#D9EAF7] h-12">
               <td colSpan={CLO_KEYS.length + 2} className="border-r-2 border-black font-black uppercase text-xs text-right pr-6 text-black">PERCENTAGE (%)</td>
               {levels.map(level => (
                 <React.Fragment key={level}>
                   <td colSpan={2} className="border-r-2 border-black font-black text-indigo-700 text-sm">
                     {totals.grandTotal > 0 ? ((totals.levelTotals[level] / totals.grandTotal) * 100).toFixed(0) : 0}%
                   </td>
                 </React.Fragment>
               ))}
               <td className="border-r-2 border-black font-black bg-emerald-100 text-base text-black">100%</td>
               <td colSpan={ITEM_TYPES.length + 1} className="bg-[#EBF5FB]"></td>
               <td className="no-print"></td>
             </tr>
          </tfoot>
        </table>
      </div>

      <button 
        onClick={addRow} 
        className="no-print w-full py-6 bg-slate-900 text-white rounded-3xl hover:bg-slate-800 transition-all uppercase font-black tracking-[0.3em] text-xs shadow-2xl mb-12"
      >
        + Add New {activeDomain} entry
      </button>

      {/* Aligned Legend & Signatories Section */}
      <div className="mt-16 grid grid-cols-1 lg:grid-cols-2 gap-16 text-xs font-black text-black">
         <div className="space-y-16">
            <div className="flex justify-between items-start gap-12">
               <div className="flex flex-col flex-1">
                  <p className="mb-20 font-black">Disediakan Oleh :</p>
                  <div className="w-full border-t-2 border-black mb-1"></div>
                  <div className="uppercase leading-tight font-black">TANDATANGAN & COP PENYELARAS KURSUS</div>
               </div>
               <div className="flex flex-col flex-1">
                  <p className="mb-20 font-black">Disahkan Oleh :</p>
                  <div className="w-full border-t-2 border-black mb-1"></div>
                  <div className="uppercase leading-tight font-black">TANDATANGAN & COP KJ / KP</div>
               </div>
            </div>
         </div>

         <div className="border-2 border-black p-6 bg-slate-50">
            <h4 className="text-sm font-black underline mb-5 tracking-widest text-center bg-black text-white py-1">LEGEND / REFERENCE TABLE</h4>
            <div className="grid grid-cols-2 gap-x-10 gap-y-4 text-black">
               <div className="flex justify-between border-b border-black/10 pb-1"><span>P :</span><span className="font-bold">PRACTICAL</span></div>
               <div className="flex justify-between border-b border-black/10 pb-1"><span>O :</span><span className="font-bold">OBJECTIVE (MCQ)</span></div>
               <div className="flex justify-between border-b border-black/10 pb-1"><span>R :</span><span className="font-bold">REPORT</span></div>
               <div className="flex justify-between border-b border-black/10 pb-1"><span>S :</span><span className="font-bold">STRUCTURED</span></div>
               <div className="flex justify-between border-b border-black/10 pb-1"><span>A :</span><span className="font-bold">ASSIGNMENT</span></div>
               <div className="flex justify-between border-b border-black/10 pb-1"><span>E :</span><span className="font-bold">ESSAY</span></div>
               
               <div className="col-span-2 mt-6 p-4 bg-white border border-black/10">
                  <span className="block mb-2 font-black border-b border-black w-fit uppercase text-black">{activeDomain} LEVELS:</span>
                  <p className="text-[10px] leading-relaxed font-bold text-slate-800">
                    {levels.map(l => `${l} | ${LEVEL_DESCRIPTIONS[l] || ''}`).join('   •   ')}
                  </p>
               </div>
            </div>
         </div>
      </div>

      <div className="mt-20 pt-10 border-t-8 border-slate-900 flex justify-end gap-8 no-print pb-20">
         <button onClick={onCancel} className="px-12 py-5 text-slate-400 font-black uppercase text-sm tracking-widest hover:text-rose-500">Discard Blueprint</button>
         <button 
           onClick={() => onSave({...course, jsuTemplate: template})} 
           className="bg-blue-600 text-white px-20 py-6 rounded-full font-black shadow-2xl hover:bg-blue-700 transition transform active:scale-95 uppercase text-sm tracking-[0.3em]"
         >
           Save All Domains to Registry
         </button>
      </div>
    </div>
  );
};
