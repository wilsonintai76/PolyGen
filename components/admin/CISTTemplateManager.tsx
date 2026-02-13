
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

const ITEM_TYPES = ['P', 'R', 'A', 'O', 'S'];

export const CISTTemplateManager: React.FC<CISTTemplateManagerProps> = ({ course, onSave, onCancel }) => {
  const [activeDomain, setActiveDomain] = useState<AssessmentDomain>('Cognitive');

  // Source CLO keys from the Course Definition
  const CLO_KEYS = useMemo(() => Object.keys(course.clos || {}), [course.clos]);

  // Determine the taxonomy ceiling for the active domain based on syllabus policies
  const levels = useMemo(() => {
    const fullList = DOMAIN_LEVELS[activeDomain];
    const policies = course.assessmentPolicies || [];
    
    // Find the absolute highest level required by any assessment task in this domain
    let maxFoundIdx = -1;
    policies.forEach(p => {
      const maxTax = p.maxTaxonomy || '';
      const idx = fullList.indexOf(maxTax);
      if (idx > maxFoundIdx) maxFoundIdx = idx;
    });

    // Default to the full list if no policies are defined, 
    // otherwise slice up to the max taxonomy defined in the syllabus.
    return maxFoundIdx === -1 ? fullList : fullList.slice(0, maxFoundIdx + 1);
  }, [activeDomain, course.assessmentPolicies]);

  const [template, setTemplate] = useState<MatrixRow[]>(() => {
    return (course.jsuTemplate || []).map(row => ({
      ...row,
      levels: row.levels || {},
      domain: row.domain || 'Cognitive'
    }));
  });

  const domainRows = useMemo(() => template.filter(r => r.domain === activeDomain), [template, activeDomain]);

  const duplicateMap = useMemo(() => {
    const globalTaskNumbers: Record<string, Record<string, number>> = {};
    domainRows.forEach(row => {
      const task = (row.task || '').trim().toUpperCase();
      if (!task) return;
      if (!globalTaskNumbers[task]) globalTaskNumbers[task] = {};
      Object.values(row.levels || {}).forEach(ld => {
        const n = (ld.count || '').trim();
        if (n) globalTaskNumbers[task][n] = (globalTaskNumbers[task][n] || 0) + 1;
      });
    });

    const duplicates: Record<number, Record<string, boolean>> = {};
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
        if (!currentVal || currentVal === '""' || currentVal === '[]' || currentVal === 'null') continue;
        for (let j = i + 1; j < domainRows.length; j++) {
          if (JSON.stringify(domainRows[j][key as keyof MatrixRow]) === currentVal) {
            span++; spans[key][j] = 0;
          } else break;
        }
        spans[key][i] = span; i += span - 1;
      }
    });
    return spans;
  }, [domainRows]);

  const addRow = () => {
    const newRow: MatrixRow = {
      task: '',
      clos: [],
      topicCode: '',
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
    const next = current.includes(value) ? current.filter(item => item !== value) : [...current, value];
    updateRowInGlobal(rowToUpdate, { [field]: next });
  };

  const totals = useMemo(() => {
    const levelTotals = levels.reduce((acc, level) => {
      acc[level] = domainRows.reduce((sum, row) => sum + (row.levels?.[level]?.marks || 0), 0);
      return acc;
    }, {} as Record<string, number>);
    return { levelTotals, grandTotal: Object.values(levelTotals).reduce((a, b) => a + b, 0) };
  }, [domainRows, levels]);

  return (
    <div className="p-8 max-w-[1800px] mx-auto bg-white min-h-screen animate-in fade-in duration-500 overflow-x-auto print-exact custom-scrollbar">
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

      <div className="border-2 border-black mb-6 p-6 text-xs bg-slate-50">
        <h3 className="font-black underline mb-4 uppercase text-sm text-black">Course Learning Outcome (CLO)</h3>
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
          <button key={d} onClick={() => setActiveDomain(d)} className={`px-8 py-3 rounded-t-2xl font-black uppercase tracking-widest text-[10px] transition-all border-x-2 border-t-2 ${activeDomain === d ? 'bg-blue-600 text-white border-blue-600 shadow-lg' : 'bg-slate-100 text-slate-400 border-slate-200 hover:bg-slate-200'}`}>
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
                key={idx} row={row} index={idx} levels={levels} cloKeys={CLO_KEYS} itemTypes={ITEM_TYPES}
                onUpdate={(updates) => updateRowInGlobal(row, updates)}
                onToggleArray={(f, v) => toggleArrayItemInGlobal(row, f, v)}
                onRemove={() => removeRowFromGlobal(row)} course={course} duplicateLevels={duplicateMap[idx]}
                spans={{ task: rowSpans.task[idx], topicCode: rowSpans.topicCode[idx], clos: rowSpans.clos[idx], construct: rowSpans.construct[idx], itemTypes: rowSpans.itemTypes[idx] }}
              />
            ))}
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
          </tfoot>
        </table>
      </div>

      <button onClick={addRow} className="no-print w-full py-6 bg-slate-900 text-white rounded-3xl hover:bg-slate-800 transition-all uppercase font-black tracking-[0.3em] text-xs shadow-2xl mb-12">+ Add New {activeDomain} entry</button>
      <div className="mt-20 pt-10 border-t-8 border-slate-900 flex justify-end gap-8 no-print pb-20">
         <button onClick={onCancel} className="px-12 py-5 text-slate-400 font-black uppercase text-sm tracking-widest hover:text-rose-500">Discard Blueprint</button>
         <button onClick={() => onSave({...course, jsuTemplate: template})} className="bg-blue-600 text-white px-20 py-6 rounded-full font-black shadow-2xl hover:bg-blue-700 transition transform active:scale-95 uppercase text-sm tracking-[0.3em]">Save All Domains to Registry</button>
      </div>
    </div>
  );
};
