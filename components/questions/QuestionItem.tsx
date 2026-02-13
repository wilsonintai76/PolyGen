
import React, { useEffect, useMemo } from 'react';
import { Question, QuestionPart } from '../../types';
import { MCQOptions } from './MCQOptions';
import { CalculationParts } from './CalculationParts';
import { QuestionFooter } from './QuestionFooter';
import { LatexRenderer } from '../common/LatexRenderer';
import { MarkInputControl } from '../common/MarkInputControl';

interface QuestionItemProps {
  question: Question;
  index: number;
  editMode?: boolean;
  onUpdate?: (q: Question) => void;
  onRemove?: (id: string) => void;
}

export const QuestionItem: React.FC<QuestionItemProps> = ({ question, index, editMode, onUpdate, onRemove }) => {
  // Ensure we have a stable ID for internal use and to pass back to the parent if missing.
  // We enforce a 'q-' prefix for all question IDs to clearly identify them.
  const safeId = useMemo(() => {
    const rawId = question.id || `${Math.random().toString(36).substring(2, 11)}-${Date.now()}`;
    return rawId.startsWith('q-') ? rawId : `q-${rawId}`;
  }, [question.id]);

  // Synchronize the safe generated ID back to the parent state if the original was missing or lacked prefix.
  useEffect(() => {
    if (question.id !== safeId && onUpdate) {
      onUpdate({ ...question, id: safeId });
    }
  }, [question.id, safeId, onUpdate]);

  const displayNum = question.number;

  // Auto-populate answer template for descriptive questions (short-answer or essay)
  useEffect(() => {
    if (editMode && !question.answer && (question.type === 'short-answer' || question.type === 'essay')) {
      const markLabel = question.marks === 1 ? 'mark' : 'marks';
      const template = `Define the marking criteria for this ${question.type} item here...\n(${question.marks} ${markLabel})`;
      
      // Delay slightly to ensure state stability during multi-field updates
      const timer = setTimeout(() => {
        if (!question.answer) {
          handleChange('answer', template);
        }
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [editMode, question.type, question.marks]);

  // Specific robustness check for q-102 sub-questions (User Request)
  useEffect(() => {
    if (editMode && question.id === 'q-102' && question.subQuestions && onUpdate) {
      const sanitized = question.subQuestions.map((sq, idx) => ({
        ...sq,
        label: sq.label || String.fromCharCode(97 + idx) + ')',
        text: sq.text || 'Default sub-question text',
        marks: sq.marks !== undefined ? sq.marks : 0
      }));

      // Check if changes are needed to avoid infinite loop
      const isChanged = JSON.stringify(sanitized) !== JSON.stringify(question.subQuestions);
      if (isChanged) {
        onUpdate({ ...question, subQuestions: sanitized });
      }
    }
  }, [editMode, question.id, question.subQuestions]);

  const handleChange = (field: keyof Question, value: any) => {
    if (onUpdate) onUpdate({ ...question, [field]: value });
  };

  const handleSubQuestionsChange = (subs: QuestionPart[]) => {
    if (onUpdate) {
      // Calculate total marks from sub-questions
      const totalMarks = subs.reduce((sum, s) => sum + (s.marks || 0), 0);
      onUpdate({ 
        ...question, 
        subQuestions: subs,
        // Automatically update total marks if sub-questions have marks, otherwise keep existing
        marks: totalMarks > 0 ? totalMarks : question.marks
      });
    }
  };

  // Force sync marks if sub-questions exist but marks don't match
  // This handles cases where data might be stale or loaded incorrectly
  useEffect(() => {
    if (question.subQuestions && question.subQuestions.length > 0) {
      const total = question.subQuestions.reduce((acc, sq) => acc + (sq.marks || 0), 0);
      if (total !== question.marks && onUpdate) {
        // We need to be careful not to create an infinite loop here.
        // onUpdate should be stable.
        onUpdate({ ...question, marks: total });
      }
    }
  }, [question.subQuestions, question.marks]); 

  const insertMark = (markCount: number) => {
    const text = question.answer || '';
    const markStr = ` (${markCount} mark${markCount > 1 ? 's' : ''})`;
    handleChange('answer', text + markStr);
  };

  const handleCorrectMCQ = (label: string) => {
    // Simple format for MCQ answers
    handleChange('answer', `Option ${label}`);
  };

  const handleCLOChange = (val: string) => {
    const keys = val.split(',').map(k => k.trim()).filter(k => !!k);
    handleChange('cloKeys', keys);
  };

  const displayCLO = () => {
    if (question.cloKeys && question.cloKeys.length > 0) {
      return `(${question.cloKeys.join(', ')})`;
    }
    return question.cloRef || '';
  };

  // Determine if sub-question editor should be visible
  const showSubQuestions = question.type !== 'mcq' && (
    (question.subQuestions && question.subQuestions.length > 0) || 
    (editMode && ['calculation', 'short-answer', 'essay', 'diagram-label', 'structure'].includes(question.type))
  );

  const hasSubQuestions = !!(question.subQuestions && question.subQuestions.length > 0);
  const isStructure = question.type === 'structure';

  // Helper to render media for a sub-question (Logic reused from main media renderer)
  const renderSubMedia = (sub: QuestionPart) => {
    if (!sub.mediaType) return null;

    return (
      <div className="mt-2 mb-4">
         {/* Table Rendering */}
         {sub.mediaType === 'table' && sub.tableData && (
            <div className="flex flex-col items-center">
              {sub.tableData.label && (
                <div className="text-center text-[10px] font-bold mb-2 uppercase text-gray-700">{sub.tableData.label}</div>
              )}
              <table className="border-collapse border border-black text-[11px] w-full max-w-lg mb-2">
                <thead>
                  <tr>
                    {sub.tableData.headers.map((h, i) => (
                      <th key={i} className="border border-black p-1 bg-gray-50 text-center">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {sub.tableData.rows.map((row, ri) => (
                    <tr key={ri}>
                      {row.map((cell, ci) => (
                        <td key={ci} className="border border-black p-1 text-center whitespace-pre-wrap">{cell}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
         )}

         {/* Figure Rendering */}
         {sub.mediaType === 'figure' && sub.imageUrl && (
            <div className="flex flex-col items-center">
              <div className="relative max-w-sm border border-gray-300 p-1 bg-white shadow-sm rounded-sm mb-1">
                <img src={sub.imageUrl} alt="Sub Figure" className="w-full object-contain max-h-48" />
              </div>
              {sub.figureLabel && (
                <div className="text-center text-[10px] font-bold uppercase italic text-gray-500">{sub.figureLabel}</div>
              )}
            </div>
         )}
      </div>
    );
  };

  return (
    <div 
      className={`mb-8 break-inside-avoid relative group transition-all ${editMode ? 'bg-blue-50/20 p-4 rounded-3xl border border-dashed border-blue-100' : ''}`}
      id={`question-node-${safeId}`}
    >
      {editMode && onRemove && (
        <button 
          onClick={() => onRemove(safeId)}
          className="absolute -top-3 -right-3 w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center shadow-lg hover:bg-red-600 transition-all z-20 opacity-0 group-hover:opacity-100"
          title="Remove Question"
        >
          ×
        </button>
      )}

      {(question.sectionTitle || editMode) && (
        <div className="font-bold mb-4 uppercase text-[11px] flex gap-2 text-gray-800 border-b border-gray-100 pb-2">
          {editMode ? (
            <>
              <div className="flex-grow flex flex-col gap-1">
                <label className="text-[8px] text-blue-400 font-black uppercase tracking-widest">Section / Category Title</label>
                <input 
                  className="w-full bg-white border border-blue-100 px-3 py-1.5 outline-none rounded-xl text-xs font-bold shadow-sm focus:border-blue-400 transition" 
                  value={question.sectionTitle || ''} 
                  onChange={(e) => handleChange('sectionTitle', e.target.value)}
                  placeholder="e.g. PART A: OBJECTIVE"
                />
              </div>
              <div className="w-48 flex flex-col gap-1">
                <label className="text-[8px] text-blue-400 font-black uppercase tracking-widest">CLO Tags (Comma Separated)</label>
                <input 
                  className="w-full bg-white border border-blue-100 px-3 py-1.5 outline-none rounded-xl text-xs font-bold shadow-sm focus:border-blue-400 transition text-center" 
                  value={(question.cloKeys || []).join(', ')} 
                  onChange={(e) => handleCLOChange(e.target.value)}
                  placeholder="CLO 1, CLO 2"
                />
              </div>
            </>
          ) : (
            <div className="flex justify-between w-full">
              <span>{question.sectionTitle}</span>
              <span className="text-gray-400">{displayCLO()}</span>
            </div>
          )}
        </div>
      )}

      <div className="flex">
        <div className="font-bold mr-3 w-10 text-right shrink-0">
          {editMode ? (
            <div className="flex flex-col items-center">
              <label className="text-[8px] text-blue-500 font-black uppercase mb-1">No.</label>
              <input 
                className="w-full bg-white border-2 border-blue-100 text-center rounded-xl font-black text-sm py-2 shadow-sm focus:border-blue-400 transition outline-none" 
                value={displayNum} 
                onChange={(e) => handleChange('number', e.target.value)}
                title="Question Number"
              />
            </div>
          ) : (
            <span className="text-sm block pt-0.5">{displayNum}</span>
          )}
        </div>

        <div className="flex-grow">
          {editMode ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              {/* Input Area */}
              <div className="relative group/editor">
                <div className="flex justify-between items-end mb-1">
                  <div className="text-[8px] text-blue-500 font-black uppercase tracking-widest">Question Text</div>
                  <div className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-blue-600 text-white text-[7px] font-black uppercase tracking-tighter shadow-sm">
                    <span className="text-[9px]">∑</span> LaTeX Enabled
                  </div>
                </div>
                <textarea 
                  className="w-full bg-white border-2 border-blue-100 p-4 italic text-sm outline-none rounded-2xl focus:border-blue-300 transition-all min-h-[140px] shadow-sm" 
                  rows={4}
                  value={question.text} 
                  onChange={(e) => handleChange('text', e.target.value)}
                  placeholder="Enter question text... Use $...$ for inline math and $$...$$ for block math."
                />
              </div>

              {/* Real-time Preview Pane */}
              <div className="flex flex-col">
                <div className="text-[8px] text-blue-600 font-black uppercase tracking-widest mb-1 ml-1 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-400"></span>
                  LaTeX Preview
                </div>
                <div className="flex-grow bg-white rounded-2xl p-4 border-2 border-blue-50 shadow-inner min-h-[140px] overflow-y-auto">
                  {question.text ? (
                    <LatexRenderer text={question.text} className="text-sm leading-relaxed text-slate-700" />
                  ) : (
                    <div className="h-full flex items-center justify-center text-slate-300 text-[10px] font-bold uppercase tracking-widest italic">
                      Live rendering preview area
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <LatexRenderer text={question.text} className="mb-3 text-sm leading-relaxed" />
          )}

          {/* Real Data Table (Label TOP) */}
          {question.mediaType === 'table' && question.tableData && (
            <div className="my-6 flex flex-col items-center">
              <div className="text-center text-[10px] font-bold mb-2 uppercase text-gray-700">
                {editMode ? (
                  <input 
                    className="bg-blue-50 border border-blue-100 text-center rounded px-2"
                    value={question.tableData.label || ''}
                    onChange={(e) => handleChange('tableData', { ...question.tableData, label: e.target.value })}
                    placeholder="Table Label (e.g. Table 1)"
                  />
                ) : (
                  question.tableData.label || 'Table 1'
                )}
              </div>
              <table className="border-collapse border border-black text-[11px] w-full max-w-lg">
                <thead>
                  <tr>
                    {question.tableData.headers.map((h, i) => (
                      <th key={i} className="border border-black p-1 bg-gray-50">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {question.tableData.rows.map((row, ri) => (
                    <tr key={ri}>
                      {row.map((cell, ci) => (
                        <td key={ci} className="border border-black p-1 text-center whitespace-pre-wrap">{cell}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Table Image / Table Figure (Label TOP) */}
          {question.mediaType === 'table-figure' && question.imageUrl && (
            <div className="my-6 flex flex-col items-center">
              <div className="text-center text-[10px] font-bold mb-2 uppercase text-gray-700">
                {editMode ? (
                  <input 
                    className="bg-blue-50 border border-blue-100 text-center rounded px-2"
                    value={question.figureLabel || ''}
                    onChange={(e) => handleChange('figureLabel', e.target.value)}
                    placeholder="Table Label (e.g. Table 1)"
                  />
                ) : (
                  question.figureLabel || 'Table 1'
                )}
              </div>
              <div className="relative max-w-md border border-gray-300 p-1 bg-white shadow-sm rounded-sm">
                <img src={question.imageUrl} alt="Table Figure" className="w-full object-contain" />
              </div>
            </div>
          )}

          {/* Diagram / Figure (Label BOTTOM) */}
          {question.mediaType === 'figure' && question.imageUrl && (
            <div className="my-6 flex flex-col items-center">
              <div className="relative max-w-md border border-gray-300 p-1 bg-white shadow-sm rounded-sm">
                <img src={question.imageUrl} alt="Figure" className="w-full object-contain" />
              </div>
              <div className="text-center text-[10px] font-bold mt-2 uppercase italic text-gray-500">
                {editMode ? (
                  <div className="flex flex-col items-center gap-1 mt-2">
                    <label className="text-[8px] text-blue-400 font-black not-italic">Figure Label</label>
                    <input 
                      className="bg-white border border-blue-100 text-center text-[10px] px-3 py-1 rounded-lg shadow-sm outline-none focus:border-blue-400"
                      value={question.figureLabel || ''}
                      onChange={(e) => handleChange('figureLabel', e.target.value)}
                      placeholder="Figure Label (e.g. Figure 1)"
                    />
                  </div>
                ) : (
                  question.figureLabel || 'Figure 1'
                )}
              </div>
            </div>
          )}

          {question.type === 'mcq' && (
            <MCQOptions 
              options={question.options || ['', '', '', '']} 
              correctAnswer={question.answer}
              editMode={editMode} 
              onChange={(opts) => handleChange('options', opts)} 
              onCorrectChange={handleCorrectMCQ}
            />
          )}

          {/* Render Sub-questions (Preview Mode) */}
          {(!editMode && showSubQuestions && question.subQuestions) && (
            <div className="ml-4 mb-2 space-y-4">
              {question.subQuestions.map((sub, idx) => (
                 <div key={idx} className="flex w-full justify-between items-start">
                   <div className="flex flex-col w-full">
                     <div className="flex">
                       {sub.label && <div className="mr-2 font-bold text-sm">{sub.label}</div>}
                       <LatexRenderer text={sub.text} className="text-sm" />
                     </div>
                     {/* Sub-question Media */}
                     {renderSubMedia(sub)}
                   </div>
                   {sub.marks !== undefined && (
                     <div className="text-[11px] font-bold italic text-gray-400">({sub.marks} m)</div>
                   )}
                 </div>
              ))}
            </div>
          )}

          {/* Render Sub-question Editor (Edit Mode) */}
          {editMode && showSubQuestions && (
            <CalculationParts 
              subQuestions={question.subQuestions || []} 
              editMode={editMode} 
              onChange={handleSubQuestionsChange} 
            />
          )}

          {editMode && question.type !== 'mcq' && (
            <div className={`mt-6 p-5 rounded-[24px] border space-y-4 ${isStructure ? 'bg-gray-50 border-gray-200' : 'bg-purple-50/40 border-purple-100'}`}>
              <div className="flex justify-between items-center">
                <label className={`text-[10px] font-black uppercase tracking-widest flex items-center gap-2 ${isStructure ? 'text-gray-400' : 'text-purple-600'}`}>
                  <span className={`w-2 h-2 rounded-full ${isStructure ? 'bg-gray-400' : 'bg-purple-400'}`}></span>
                  {isStructure ? 'Marking Scheme (Defined in Sub-Parts)' : 'Marking Scheme / Suggested Answer'}
                </label>
                {!isStructure && <MarkInputControl onAddMark={insertMark} />}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <textarea 
                    className={`w-full bg-white border p-3 rounded-xl text-xs font-mono min-h-[140px] outline-none shadow-sm transition-all resize-y ${isStructure ? 'border-gray-200 text-gray-400 bg-gray-50 cursor-not-allowed' : 'border-purple-100 focus:border-purple-300'}`}
                    value={isStructure ? 'Marking scheme is defined in sub-questions.' : (question.answer || '')}
                    onChange={(e) => !isStructure && handleChange('answer', e.target.value)}
                    disabled={isStructure}
                    placeholder={isStructure ? "Disabled" : "Line 1 answer text... (1 mark)\nLine 2 answer text... (2 marks)"}
                  />
                  {!isStructure ? (
                    <div className="bg-white border border-purple-100 p-3 rounded-xl text-xs min-h-[140px] shadow-sm overflow-y-auto">
                        {question.answer ? (
                            <LatexRenderer text={question.answer} className="text-slate-700 leading-relaxed" />
                        ) : (
                            <div className="h-full flex items-center justify-center text-purple-200 font-bold uppercase tracking-widest text-[10px]">Preview Area</div>
                        )}
                    </div>
                  ) : (
                    <div className="bg-gray-50 border border-gray-200 p-3 rounded-xl text-xs min-h-[140px] shadow-sm flex items-center justify-center text-gray-300 font-bold uppercase tracking-widest text-[10px]">
                      Main Answer Disabled
                    </div>
                  )}
              </div>
            </div>
          )}

          {!editMode && (question.type === 'essay' || question.type === 'short-answer') && (
             <div className="mt-4 space-y-4 pr-12">
                <div className={`${question.type === 'essay' ? 'h-32' : 'h-16'} border-b border-gray-200 border-dashed w-full opacity-40`}></div>
             </div>
          )}
        </div>
      </div>

      <QuestionFooter 
        mqfKeys={question.mqfKeys}
        mqfCluster={question.mqfCluster}
        taxonomy={question.taxonomy} 
        construct={question.construct}
        marks={question.marks} 
        editMode={editMode} 
        hasSubQuestions={hasSubQuestions}
        onUpdate={(data) => {
          handleChange('mqfKeys', data.mqfKeys);
          handleChange('mqfCluster', data.mqfCluster);
          handleChange('taxonomy', data.taxonomy);
          handleChange('construct', data.construct);
          handleChange('marks', data.marks);
        }}
      />
    </div>
  );
};
