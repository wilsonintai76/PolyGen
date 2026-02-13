
import React from 'react';
import { AssessmentPaper, Question, QuestionPart } from '../../types';
import { LatexRenderer } from '../common/LatexRenderer';
import { MarkInputControl } from '../common/MarkInputControl';

interface AnswerSchemeTableProps {
  paper: AssessmentPaper;
  editMode?: boolean;
  onUpdateQuestion?: (q: Question) => void;
}

export const AnswerSchemeTable: React.FC<AnswerSchemeTableProps> = ({ paper, editMode, onUpdateQuestion }) => {
  const getMarksForLine = (line: string): number => {
    const match = line.match(/\((\d+)\s*marks?\)/i);
    return match ? parseInt(match[1], 10) : 0;
  };

  const calculateDisplayedTotal = (q: Question): number => {
    if (q.type === 'mcq') return 1;
    let total = 0;
    if (q.answer) {
      const lines = q.answer.split('\n');
      lines.forEach(line => { total += getMarksForLine(line); });
    }
    if (q.subQuestions && q.subQuestions.length > 0) {
      q.subQuestions.forEach(sub => {
        if (sub.answer) {
          const lines = sub.answer.split('\n');
          lines.forEach(line => { total += getMarksForLine(line); });
        }
      });
    }
    return total > 0 ? total : q.marks;
  };

  const renderAnswerLines = (answerText: string | undefined, type?: string) => {
    if (!answerText) return <span className="italic text-gray-400">Criteria pending.</span>;
    return (
      <div className="leading-relaxed py-1">
        {type === 'mcq' && <div className="font-bold text-blue-600 mb-2 uppercase text-[9px] tracking-widest">Correct Response:</div>}
        {answerText.split('\n').map((line, i) => (
          <div key={i} className="mb-1 min-h-[1.2rem] flex items-start">
            <LatexRenderer text={line.trim() || '\u00A0'} className="flex-grow" />
          </div>
        ))}
      </div>
    );
  };

  const renderMarkLines = (answerText: string | undefined, type?: string) => {
    if (type === 'mcq') return <div className="flex items-center justify-center font-bold text-gray-700 h-full">1</div>;
    if (!answerText) return null;
    return (
      <div className="flex flex-col h-full">
        {answerText.split('\n').map((line, i) => {
          const m = getMarksForLine(line);
          return (
            <div key={i} className="mb-1 py-1 min-h-[1.25rem] flex items-center justify-center font-bold text-gray-700">
              {m > 0 ? m : ''}
            </div>
          );
        })}
      </div>
    );
  };

  const renderSolutionSketch = (imageUrl?: string, label?: string) => {
    if (!imageUrl) return null;
    return (
      <div className="my-4 flex flex-col items-center">
        <div className="relative max-w-md border-2 border-indigo-100 p-1 bg-white shadow-sm rounded-lg overflow-hidden">
           <img src={imageUrl} alt="Solution Sketch" className="w-full object-contain max-h-[300px]" />
        </div>
        {label && <div className="text-[9px] font-black text-indigo-400 uppercase mt-2 italic">Solution Figure: {label}</div>}
      </div>
    );
  };

  const handleSketchUpload = (q: Question, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => onUpdateQuestion?.({ ...q, answerImageUrl: reader.result as string });
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="w-full print-exact">
      <div className="border border-black bg-gray-100 text-center py-2 font-black text-sm border-b-0 uppercase tracking-[0.2em] text-slate-800">
        ANSWER SCHEME & MARKING CRITERIA
      </div>
      <table className="w-full border-collapse border border-black text-[11px]">
        <thead>
          <tr className="bg-white font-black uppercase text-[10px] h-10">
            <th className="border border-black p-2 w-12 text-center">NO</th>
            <th className="border border-black p-2 text-left">DETAILED SOLUTION STEPS / GRADING RUBRIC</th>
            <th className="border border-black p-2 w-20 text-center">MARKS</th>
          </tr>
        </thead>
        <tbody>
          {paper.questions.map((q) => (
            <React.Fragment key={q.id}>
              <tr className="align-top group">
                <td className="border border-black p-4 text-center font-black text-slate-800 bg-slate-50/30">{q.number.replace('.', '')}</td>
                <td className="border border-black p-6 bg-white">
                   {editMode ? (
                     <div className="space-y-6">
                        <div className="bg-blue-50/30 p-4 rounded-2xl border border-blue-100">
                           <div className="flex justify-between items-center mb-3">
                              <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest flex items-center gap-2">
                                 <span className="w-2 h-2 rounded-full bg-blue-400"></span> Main Solution
                              </span>
                              <MarkInputControl onAddMark={(m) => onUpdateQuestion?.({...q, answer: (q.answer || '') + ` (${m} marks)`})} />
                           </div>
                           <textarea className="w-full bg-white border border-blue-100 p-4 font-mono text-[11px] min-h-[140px] focus:ring-4 focus:ring-blue-50 outline-none rounded-xl resize-y" 
                             value={q.answer || ''} onChange={(e) => onUpdateQuestion?.({...q, answer: e.target.value})} placeholder="Steps..." />
                           
                           {/* Editor Sketch Control */}
                           <div className="mt-6 flex items-center gap-6">
                              <div 
                                onClick={() => document.getElementById(`scheme-file-${q.id}`)?.click()}
                                className="w-24 h-24 border-2 border-dashed border-blue-200 rounded-2xl flex flex-col items-center justify-center cursor-pointer hover:bg-blue-50 transition bg-white shrink-0"
                              >
                                 {q.answerImageUrl ? <img src={q.answerImageUrl} className="h-full w-full object-contain p-2" /> : <span className="text-[8px] font-black text-blue-300 uppercase text-center">+ Solution<br/>Sketch</span>}
                                 <input id={`scheme-file-${q.id}`} type="file" className="hidden" accept="image/*" onChange={(e) => handleSketchUpload(q, e)} />
                              </div>
                              <div className="flex-grow">
                                 <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1 block">Sketch Title</label>
                                 <input className="w-full border border-blue-100 p-2.5 rounded-xl text-[10px] font-bold outline-none focus:border-blue-400 bg-white" placeholder="Label for solution sketch..." value={q.answerFigureLabel || ''} onChange={e => onUpdateQuestion?.({...q, answerFigureLabel: e.target.value})} />
                              </div>
                           </div>
                        </div>

                        {q.subQuestions && q.subQuestions.length > 0 && (
                          <div className="space-y-4">
                            {q.subQuestions.map((sub, idx) => (
                              <div key={idx} className="bg-purple-50/30 p-4 rounded-2xl border border-purple-100">
                                 <div className="flex justify-between items-center mb-3">
                                    <span className="text-[10px] font-black text-purple-600 uppercase tracking-widest">Part {sub.label} Criteria</span>
                                    <MarkInputControl onAddMark={(m) => {
                                       const newSubs = [...(q.subQuestions || [])];
                                       newSubs[idx] = { ...newSubs[idx], answer: (newSubs[idx].answer || '') + ` (${m} marks)` };
                                       onUpdateQuestion?.({...q, subQuestions: newSubs});
                                    }} />
                                 </div>
                                 <textarea className="w-full bg-white border border-purple-100 p-4 font-mono text-[11px] min-h-[100px] outline-none rounded-xl" 
                                   value={sub.answer || ''} onChange={(e) => {
                                     const newSubs = [...(q.subQuestions || [])];
                                     newSubs[idx] = { ...newSubs[idx], answer: e.target.value };
                                     onUpdateQuestion?.({...q, subQuestions: newSubs});
                                   }} placeholder={`Criteria for part ${sub.label}...`} />
                                 
                                 <div className="mt-4 flex items-center gap-4">
                                    <div 
                                      onClick={() => document.getElementById(`scheme-sub-${q.id}-${idx}`)?.click()}
                                      className="w-16 h-16 border-2 border-dashed border-purple-200 rounded-xl flex items-center justify-center cursor-pointer hover:bg-purple-50 transition bg-white shrink-0"
                                    >
                                       {sub.answerImageUrl ? <img src={sub.answerImageUrl} className="h-full w-full object-contain p-1" /> : <span className="text-[7px] font-black text-purple-300 uppercase">Part {sub.label} Sketch</span>}
                                       <input id={`scheme-sub-${q.id}-${idx}`} type="file" className="hidden" accept="image/*" onChange={(e) => {
                                          const file = e.target.files?.[0];
                                          if (file) {
                                            const reader = new FileReader();
                                            reader.onloadend = () => {
                                              const newSubs = [...(q.subQuestions || [])];
                                              newSubs[idx] = { ...newSubs[idx], answerImageUrl: reader.result as string };
                                              onUpdateQuestion?.({...q, subQuestions: newSubs});
                                            };
                                            reader.readAsDataURL(file);
                                          }
                                       }} />
                                    </div>
                                 </div>
                              </div>
                            ))}
                          </div>
                        )}
                     </div>
                   ) : (
                     <div className="space-y-6">
                        <div className="solution-block">
                           {q.answer && renderAnswerLines(q.answer, q.type)}
                           {renderSolutionSketch(q.answerImageUrl, q.answerFigureLabel)}
                        </div>
                        
                        {q.subQuestions && q.subQuestions.length > 0 && (
                          <div className="space-y-8 pt-4">
                            {q.subQuestions.map((sub, idx) => (
                              <div key={idx} className="border-t border-dotted border-slate-200 pt-6">
                                <div className="flex gap-4 items-start">
                                  <span className="font-black text-slate-800 text-xs w-8">{sub.label}</span>
                                  <div className="flex-grow">
                                    <div className="font-black text-slate-400 text-[9px] uppercase tracking-widest mb-2">Grading Breakdown ({sub.marks}m):</div>
                                    {renderAnswerLines(sub.answer)}
                                    {renderSolutionSketch(sub.answerImageUrl, sub.answerFigureLabel)}
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                     </div>
                   )}
                </td>
                <td className="border border-black p-0 text-center bg-slate-50/10">
                   <div className="flex flex-col h-full py-2">
                     {renderMarkLines(q.answer, q.type)}
                     {q.subQuestions && q.subQuestions.length > 0 && !editMode && (
                       <div className="flex flex-col h-full mt-4">
                         {q.subQuestions.map((sub, idx) => (
                           <div key={idx} className="mt-8 pt-8 border-t border-dotted border-slate-200">
                             {renderMarkLines(sub.answer)}
                           </div>
                         ))}
                       </div>
                     )}
                   </div>
                </td>
              </tr>
              <tr>
                <td className="border-x border-black bg-white"></td>
                <td className="border border-black p-3 text-right bg-slate-900/5" colSpan={2}>
                  <div className="flex justify-between items-center text-[10px]">
                    <span className="text-slate-400 font-black uppercase tracking-[0.2em]">{q.type} • {q.taxonomy}</span>
                    <div className="uppercase">
                      <span className="text-slate-500 mr-3 font-bold">TOTAL ITEM {q.number.replace('.','')} MARKS</span>
                      <span className="bg-slate-800 text-white px-4 py-1 rounded-full font-black">{calculateDisplayedTotal(q)} MARKS</span>
                    </div>
                  </div>
                </td>
              </tr>
            </React.Fragment>
          ))}
        </tbody>
      </table>
    </div>
  );
};
