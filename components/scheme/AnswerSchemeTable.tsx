
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
    
    // Sum from main answer text
    if (q.answer) {
      const lines = q.answer.split('\n');
      lines.forEach(line => {
        total += getMarksForLine(line);
      });
    }

    // Sum from sub-questions
    if (q.subQuestions && q.subQuestions.length > 0) {
      q.subQuestions.forEach(sub => {
        if (sub.answer) {
          const lines = sub.answer.split('\n');
          lines.forEach(line => {
            total += getMarksForLine(line);
          });
        }
      });
    }

    // Fallback: If no marks are explicitly defined in the text, use the assigned question marks.
    // This handles cases where the scheme hasn't been written yet.
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
    if (type === 'mcq') {
      return (
        <div className="flex flex-col h-full items-center justify-center">
           <div className="font-bold text-gray-700">1</div>
        </div>
      );
    }

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

  return (
    <div className="w-full">
      <div className="border border-black bg-gray-100 text-center py-2 font-bold text-sm border-b-0 uppercase tracking-widest">
        Answer Scheme / Marking Criteria
      </div>
      <table className="w-full border-collapse border border-black text-xs">
        <thead>
          <tr className="bg-white font-bold uppercase text-[10px]">
            <th className="border border-black p-2 w-12 text-center">No</th>
            <th className="border border-black p-2 text-left">Detailed Answer / Solution Steps</th>
            <th className="border border-black p-2 w-20 text-center">Marks</th>
          </tr>
        </thead>
        <tbody>
          {paper.questions.map((q) => (
            <React.Fragment key={q.id}>
              {/* Question Level Row */}
              <tr className="align-top">
                <td className="border border-black p-2 text-center font-bold">{q.number.replace('.', '')}</td>
                <td className="border border-black p-2">
                   {editMode ? (
                     <div className="space-y-4">
                        <div className="space-y-2">
                            <div className="flex justify-between items-center mb-1">
                               <div className="text-[9px] text-blue-500 font-bold uppercase italic flex items-center gap-1">
                                 <span className="w-1.5 h-1.5 rounded-full bg-blue-400"></span>
                                 Main Answer
                               </div>
                               <MarkInputControl 
                                 onAddMark={(m) => onUpdateQuestion?.({...q, answer: (q.answer || '') + ` (${m} mark${m > 1 ? 's' : ''})`})} 
                               />
                            </div>
                            <textarea 
                              className="w-full bg-blue-50 border border-blue-200 p-2 font-mono text-[11px] min-h-[120px] focus:ring-1 focus:ring-blue-400 outline-none rounded-lg resize-y" 
                              value={q.answer || ''}
                              onChange={(e) => onUpdateQuestion?.({...q, answer: e.target.value})}
                              placeholder={q.type === 'mcq' ? "Option C" : "Criteria steps..."}
                            />
                        </div>
                        
                        {/* Sub-questions Editor */}
                        {q.subQuestions && q.subQuestions.length > 0 && (
                            <div className="border-t border-dashed border-gray-300 pt-4 space-y-4">
                                {q.subQuestions.map((sub, idx) => (
                                    <div key={idx} className="space-y-2">
                                        <div className="flex justify-between items-center mb-1">
                                           <div className="text-[9px] text-purple-500 font-bold uppercase italic flex items-center gap-1">
                                             <span className="font-bold text-gray-700 mr-1">{sub.label}</span>
                                             Part Criteria
                                           </div>
                                           <MarkInputControl 
                                             onAddMark={(m) => {
                                                 const newSubs = [...(q.subQuestions || [])];
                                                 const currentAns = newSubs[idx].answer || '';
                                                 newSubs[idx] = { ...newSubs[idx], answer: currentAns + ` (${m} mark${m > 1 ? 's' : ''})` };
                                                 onUpdateQuestion?.({...q, subQuestions: newSubs});
                                             }} 
                                             className="scale-90 origin-right"
                                           />
                                        </div>
                                        <textarea 
                                          className="w-full bg-purple-50 border border-purple-200 p-2 font-mono text-[11px] min-h-[80px] focus:ring-1 focus:ring-purple-400 outline-none rounded-lg resize-y"
                                          value={sub.answer || ''}
                                          onChange={(e) => {
                                                 const newSubs = [...(q.subQuestions || [])];
                                                 newSubs[idx] = { ...newSubs[idx], answer: e.target.value };
                                                 onUpdateQuestion?.({...q, subQuestions: newSubs});
                                          }}
                                          placeholder={`Marking criteria for part ${sub.label}...`}
                                        />
                                    </div>
                                ))}
                            </div>
                        )}
                     </div>
                   ) : (
                     <div className="space-y-4">
                        {/* Main Question Answer */}
                        {q.answer && renderAnswerLines(q.answer, q.type)}
                        
                        {/* Render Sub-questions if they exist */}
                        {q.subQuestions && q.subQuestions.length > 0 && (
                          <div className="space-y-4 pt-2">
                            {q.subQuestions.map((sub, idx) => (
                              <div key={idx} className="border-t border-dotted border-gray-300 pt-2">
                                <div className="flex gap-2 items-start mb-2">
                                  <span className="font-bold text-gray-700">{sub.label}</span>
                                  <div className="flex-grow">
                                    <div className="font-bold text-gray-400 text-[9px] uppercase tracking-tighter mb-1">Answer Criteria for Part {sub.label}:</div>
                                    {renderAnswerLines(sub.answer)}
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                     </div>
                   )}
                </td>
                <td className="border border-black p-0 text-center bg-gray-50/20">
                   <div className="flex flex-col h-full">
                     {/* Marks for Main Answer */}
                     {renderMarkLines(q.answer, q.type)}
                     
                     {/* Marks for Sub-questions (View Mode) */}
                     {q.subQuestions && q.subQuestions.length > 0 && !editMode && (
                       <div className="flex flex-col h-full mt-2">
                         {q.subQuestions.map((sub, idx) => (
                           <div key={idx} className="mt-4 pt-4 border-t border-dotted border-gray-300">
                             {renderMarkLines(sub.answer)}
                           </div>
                         ))}
                       </div>
                     )}
                     
                     {/* Marks for Sub-questions (Edit Mode - Preview) */}
                     {q.subQuestions && q.subQuestions.length > 0 && editMode && (
                        <div className="flex flex-col h-full mt-36 opacity-30">
                           {/* Simplified placeholder to maintain column alignment somewhat, though heights vary */}
                           {q.subQuestions.map((sub, idx) => (
                               <div key={idx} className="flex-grow flex items-center justify-center py-4">
                                  -
                               </div>
                           ))}
                        </div>
                     )}
                   </div>
                </td>
              </tr>
              {/* Question Subtotal Row */}
              <tr>
                <td className="border-x border-black bg-white"></td>
                <td className="border border-black p-2 text-right font-bold bg-slate-50" colSpan={2}>
                  <div className="flex justify-between items-center text-[10px]">
                    <span className="text-slate-400 font-black uppercase tracking-widest px-2">{q.type}</span>
                    <div className="uppercase">
                      <span className="text-slate-400 mr-2 tracking-tighter">Subtotal Question {q.number}</span>
                      <span className="bg-slate-200 px-3 py-0.5 rounded-full">{calculateDisplayedTotal(q)} MARKS</span>
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
