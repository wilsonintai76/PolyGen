
import React, { useRef } from 'react';
import { QuestionPart } from '../../types';
import { LatexRenderer } from '../common/LatexRenderer';
import { MarkInputControl } from '../common/MarkInputControl';

interface CalculationPartsProps {
  subQuestions: QuestionPart[];
  editMode?: boolean;
  onChange: (subs: QuestionPart[]) => void;
}

export const CalculationParts: React.FC<CalculationPartsProps> = ({ subQuestions, editMode, onChange }) => {
  // We use a ref to trigger file input clicks, but since we map over subquestions, 
  // we'll handle the click by ID or index within the render loop directly using unique IDs.
  
  const handleSubUpdate = (idx: number, field: keyof QuestionPart, value: any) => {
    const subs = [...subQuestions];
    subs[idx] = { ...subs[idx], [field]: value };
    onChange(subs);
  };

  const addSubQuestion = () => {
    const nextLabel = String.fromCharCode(97 + subQuestions.length) + ")";
    onChange([...subQuestions, { label: nextLabel, text: '', answer: '', marks: 1 }]);
  };

  const removeSubQuestion = (idx: number) => {
    const subs = [...subQuestions];
    subs.splice(idx, 1);
    onChange(subs);
  };

  const handleImageUpload = (idx: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        handleSubUpdate(idx, 'imageUrl', reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="ml-4 mb-2 space-y-4">
      {subQuestions.map((sub, idx) => (
        <div key={idx} className="flex gap-2 items-start group/sub">
          {editMode ? (
            <div className="flex flex-col gap-4 w-full border-l-4 border-blue-400 pl-4 py-6 bg-white shadow-md rounded-r-3xl border border-blue-50">
              <div className="flex gap-4">
                <div className="flex flex-col">
                  <label className="text-[8px] text-blue-500 font-black uppercase mb-1">Part Label</label>
                  <input 
                    className="w-12 border-2 border-slate-100 text-center font-black text-sm rounded-xl p-2 outline-none focus:border-blue-300" 
                    value={sub.label || ''} 
                    onChange={(e) => handleSubUpdate(idx, 'label', e.target.value)}
                  />
                </div>
                
                {/* Side-by-Side Editor for Sub-Question Text */}
                <div className="flex-grow grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <div className="flex flex-col h-full">
                    <label className="text-[8px] text-blue-500 font-black uppercase mb-1 ml-1">Part Stem (LaTeX Supported)</label>
                    <textarea 
                      className="w-full flex-grow min-h-[80px] border-2 border-slate-100 p-3 text-xs italic outline-none focus:border-blue-300 rounded-xl transition-all shadow-sm resize-y font-medium text-slate-700"
                      value={sub.text}
                      onChange={(e) => handleSubUpdate(idx, 'text', e.target.value)}
                      placeholder="e.g. Find the value of $x$."
                    />
                  </div>
                  <div className="flex flex-col h-full">
                    <label className="text-[8px] text-emerald-500 font-black uppercase mb-1 ml-1 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                      LaTeX Preview
                    </label>
                    <div className="flex-grow bg-slate-50 border border-slate-100 p-3 rounded-xl text-xs min-h-[80px] flex items-center shadow-inner overflow-x-auto whitespace-pre-wrap">
                      {sub.text ? (
                        <LatexRenderer text={sub.text} className="leading-normal text-slate-700 w-full" />
                      ) : (
                        <span className="text-[9px] text-slate-300 uppercase font-black tracking-widest italic w-full text-center">Live Preview</span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex flex-col items-center">
                  <label className="text-[8px] text-blue-500 font-black uppercase mb-1">Marks</label>
                  <input 
                    type="number"
                    className="w-12 border-2 border-slate-100 text-center rounded-xl p-2 text-xs font-bold" 
                    value={sub.marks || 0}
                    onChange={(e) => handleSubUpdate(idx, 'marks', parseInt(e.target.value) || 0)}
                  />
                </div>
                <button 
                  onClick={() => removeSubQuestion(idx)}
                  className="text-red-300 hover:text-red-500 font-bold px-2 self-start pt-6"
                >×</button>
              </div>

              {/* MEDIA CONTROLS FOR SUB-QUESTION */}
              <div className="bg-slate-50/50 p-4 rounded-2xl border border-slate-100">
                <div className="flex justify-between items-center mb-2">
                   <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Attached Media (Optional)</label>
                   <div className="flex gap-2">
                      <button 
                        onClick={() => handleSubUpdate(idx, 'mediaType', undefined)}
                        className={`text-[8px] font-bold px-2 py-1 rounded ${!sub.mediaType ? 'bg-slate-200 text-slate-600' : 'text-slate-400 hover:bg-slate-100'}`}
                      >NONE</button>
                      <button 
                        onClick={() => handleSubUpdate(idx, 'mediaType', 'figure')}
                        className={`text-[8px] font-bold px-2 py-1 rounded ${sub.mediaType === 'figure' ? 'bg-blue-600 text-white' : 'text-blue-500 bg-blue-50 hover:bg-blue-100'}`}
                      >FIGURE</button>
                      <button 
                        onClick={() => {
                           handleSubUpdate(idx, 'mediaType', 'table');
                           if (!sub.tableData) handleSubUpdate(idx, 'tableData', { headers: ['Col 1', 'Col 2'], rows: [['', '']], label: 'Table 1' });
                        }}
                        className={`text-[8px] font-bold px-2 py-1 rounded ${sub.mediaType === 'table' ? 'bg-blue-600 text-white' : 'text-blue-500 bg-blue-50 hover:bg-blue-100'}`}
                      >TABLE</button>
                   </div>
                </div>

                {sub.mediaType === 'figure' && (
                   <div className="flex gap-4 items-center">
                      <div 
                         onClick={() => document.getElementById(`sub-q-file-${idx}`)?.click()} 
                         className="w-24 h-24 border-2 border-dashed border-slate-200 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:border-blue-300 hover:bg-blue-50 transition bg-white"
                      >
                         {sub.imageUrl ? (
                           <img src={sub.imageUrl} className="w-full h-full object-contain p-1" alt="Sub Asset" />
                         ) : (
                           <span className="text-[9px] text-slate-400 font-bold uppercase text-center">Upload<br/>Image</span>
                         )}
                      </div>
                      <input 
                        id={`sub-q-file-${idx}`} 
                        type="file" 
                        className="hidden" 
                        accept="image/*" 
                        onChange={(e) => handleImageUpload(idx, e)} 
                      />
                      <div className="flex-grow">
                         <input 
                           className="w-full border border-slate-200 rounded-lg p-2 text-xs outline-none focus:border-blue-300" 
                           placeholder="Figure Label (e.g. Figure 1(a))" 
                           value={sub.figureLabel || ''}
                           onChange={(e) => handleSubUpdate(idx, 'figureLabel', e.target.value)}
                         />
                      </div>
                   </div>
                )}

                {sub.mediaType === 'table' && sub.tableData && (
                   <div className="space-y-2">
                      <input 
                           className="w-full border border-slate-200 rounded-lg p-2 text-xs outline-none focus:border-blue-300 mb-2" 
                           placeholder="Table Label (e.g. Table 1(a))" 
                           value={sub.tableData.label || ''}
                           onChange={(e) => handleSubUpdate(idx, 'tableData', { ...sub.tableData!, label: e.target.value })}
                      />
                      <div className="overflow-x-auto bg-white border border-slate-200 rounded-lg p-2">
                        <table className="w-full text-[10px] border-collapse">
                          <thead>
                            <tr>
                              {sub.tableData.headers.map((h, hi) => (
                                <th key={hi} className="border p-1 bg-slate-50">
                                   <input className="bg-transparent text-center w-full outline-none font-bold" value={h} onChange={e => {
                                      const newHeaders = [...sub.tableData!.headers];
                                      newHeaders[hi] = e.target.value;
                                      handleSubUpdate(idx, 'tableData', { ...sub.tableData!, headers: newHeaders });
                                   }} />
                                </th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {sub.tableData.rows.map((row, ri) => (
                              <tr key={ri}>
                                {row.map((cell, ci) => (
                                  <td key={ci} className="border p-1">
                                    <input className="w-full outline-none text-center" value={cell} onChange={e => {
                                        const newRows = [...sub.tableData!.rows];
                                        newRows[ri] = [...newRows[ri]];
                                        newRows[ri][ci] = e.target.value;
                                        handleSubUpdate(idx, 'tableData', { ...sub.tableData!, rows: newRows });
                                    }} />
                                  </td>
                                ))}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                        <div className="flex gap-2 mt-2">
                           <button className="text-[8px] bg-slate-100 px-2 py-1 rounded hover:bg-slate-200 font-bold" onClick={() => {
                              const newRows = [...sub.tableData!.rows, sub.tableData!.headers.map(() => '')];
                              handleSubUpdate(idx, 'tableData', { ...sub.tableData!, rows: newRows });
                           }}>+ ROW</button>
                           <button className="text-[8px] bg-slate-100 px-2 py-1 rounded hover:bg-slate-200 font-bold" onClick={() => {
                              const newHeaders = [...sub.tableData!.headers, 'Col'];
                              const newRows = sub.tableData!.rows.map(r => [...r, '']);
                              handleSubUpdate(idx, 'tableData', { ...sub.tableData!, headers: newHeaders, rows: newRows });
                           }}>+ COL</button>
                        </div>
                      </div>
                   </div>
                )}
              </div>

              {/* Sub-Answer Scheme Editor */}
              <div className="space-y-2 pt-2 border-t border-slate-50">
                <div className="flex justify-between items-center">
                    <label className="text-[8px] text-purple-600 font-black uppercase tracking-widest flex items-center gap-1 ml-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-purple-400"></span>
                      Part {sub.label} Answer Scheme
                    </label>
                    <MarkInputControl 
                        onAddMark={(m) => {
                            const current = sub.answer || '';
                            const markStr = ` (${m} mark${m > 1 ? 's' : ''})`;
                            handleSubUpdate(idx, 'answer', current + markStr);
                        }} 
                        className="scale-90 origin-right"
                    />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <textarea 
                      className="w-full border-2 border-purple-50 p-3 rounded-xl bg-purple-50/20 text-[11px] font-mono h-24 outline-none focus:border-purple-200 transition-all resize-y"
                      value={sub.answer || ''}
                      onChange={(e) => handleSubUpdate(idx, 'answer', e.target.value)}
                      placeholder="Solution steps and marks (e.g. Formula (1 mark)...)"
                    />
                    <div className="bg-purple-50/10 border-2 border-purple-50 p-3 rounded-xl text-[11px] h-24 overflow-y-auto">
                        {sub.answer ? (
                            <LatexRenderer text={sub.answer} className="text-slate-700 leading-relaxed" />
                        ) : (
                            <div className="h-full flex items-center justify-center">
                                <span className="text-purple-300 italic font-bold text-[9px] uppercase tracking-widest">Answer Preview</span>
                            </div>
                        )}
                    </div>
                </div>
              </div>
            </div>
          ) : (
             // PREVIEW MODE IN EDITOR (Not the main print preview, but the collapsed view in QuestionItem)
             // However, QuestionItem handles the main display. CalculationParts is mostly for Edit Mode.
             // We keep basic display here just in case.
            <div className="flex w-full justify-between items-start">
              <div className="flex flex-col w-full">
                <div className="flex">
                   {sub.label && <div className="mr-2 font-bold text-sm">{sub.label}</div>}
                   <LatexRenderer text={sub.text} className="text-sm" />
                </div>
                {/* Minimal preview of media in collapsed editor state */}
                {sub.imageUrl && <div className="text-[9px] text-blue-500 font-bold ml-6 mt-1">[Has Figure: {sub.figureLabel}]</div>}
                {sub.tableData && <div className="text-[9px] text-blue-500 font-bold ml-6 mt-1">[Has Table: {sub.tableData.label}]</div>}
              </div>
              {sub.marks !== undefined && (
                <div className="text-[11px] font-bold italic text-gray-400">({sub.marks} m)</div>
              )}
            </div>
          )}
        </div>
      ))}
      {editMode && (
        <button 
          onClick={addSubQuestion}
          className="text-[10px] bg-slate-800 text-white font-black px-6 py-2 rounded-xl hover:bg-slate-700 transition shadow-lg uppercase tracking-widest"
        >+ ADD SUB-PART</button>
      )}
    </div>
  );
};
