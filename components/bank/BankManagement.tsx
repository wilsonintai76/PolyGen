import React, { useState, useRef } from 'react';
import { Question, Course } from '../../types';
import { LatexRenderer } from '../common/LatexRenderer';
import { MarkInputControl } from '../common/MarkInputControl';

interface BankManagementProps {
  onBack: () => void;
  onSave: (q: Question) => void;
  onBatchAdd: (qs: Question[]) => void;
  currentBank: Question[];
  availableClos: string[];
  availableMqf: string[];
  onAddCLO: (key: string) => void;
  onAddMQF: (val: string) => void;
  availableCourses: Course[];
}

const MediaLabelInput: React.FC<{
  value: string;
  onChange: (val: string) => void;
  type: 'figure' | 'table-figure' | 'table';
}> = ({ value, onChange, type }) => {
  const isFigure = type === 'figure';
  const labelText = isFigure ? 'Figure Label (e.g. Figure 1)' : 'Table Label (e.g. Table 1)';
  const positionText = isFigure ? 'Rendered at bottom of asset' : 'Rendered at top of asset';

  return (
    <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100 mb-4 animate-in fade-in slide-in-from-top-4">
      <div className="flex justify-between items-end mb-2">
        <label className="text-[10px] font-black text-blue-600 uppercase tracking-widest ml-1 flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-blue-400"></span>
          {labelText}
        </label>
        <span className="text-[8px] font-bold text-slate-400 uppercase italic tracking-tighter">{positionText}</span>
      </div>
      <div className="relative group">
        <input 
          className="w-full border-2 border-white bg-white p-4 rounded-2xl outline-none focus:border-blue-400 font-black text-slate-700 shadow-sm transition-all group-hover:shadow-md" 
          value={value} 
          onChange={e => onChange(e.target.value)} 
          placeholder={isFigure ? "Figure 1: Title of diagram" : "Table 1: Data overview"} 
        />
        <div className="absolute right-4 top-1/2 -translate-y-1/2 opacity-20 pointer-events-none text-xl">
          {isFigure ? '📐' : '📊'}
        </div>
      </div>
    </div>
  );
};

const RealTableEditor: React.FC<{
  tableData?: Question['tableData'];
  onChange: (data: Question['tableData']) => void;
}> = ({ tableData, onChange }) => {
  if (!tableData) return null;

  const updateHeader = (ci: number, val: string) => {
    const headers = [...tableData.headers];
    headers[ci] = val;
    onChange({ ...tableData, headers });
  };

  const updateCell = (ri: number, ci: number, val: string) => {
    const rows = [...tableData.rows];
    rows[ri] = [...rows[ri]];
    rows[ri][ci] = val;
    onChange({ ...tableData, rows });
  };

  const addRow = () => {
    const newRow = tableData.headers.map(() => '');
    onChange({ ...tableData, rows: [...tableData.rows, newRow] });
  };

  const addCol = () => {
    const headers = [...tableData.headers, `Col ${tableData.headers.length + 1}`];
    const rows = tableData.rows.map(row => [...row, '']);
    onChange({ ...tableData, headers, rows });
  };

  const removeRow = (ri: number) => {
    const rows = [...tableData.rows];
    rows.splice(ri, 1);
    onChange({ ...tableData, rows });
  };

  const removeCol = (ci: number) => {
    const headers = [...tableData.headers];
    headers.splice(ci, 1);
    const rows = tableData.rows.map(row => {
      const newRow = [...row];
      newRow.splice(ci, 1);
      return newRow;
    });
    onChange({ ...tableData, headers, rows });
  };

  return (
    <div className="space-y-4">
      <MediaLabelInput 
        type="table"
        value={tableData.label || ''}
        onChange={(val) => onChange({ ...tableData, label: val })}
      />
      
      <div className="overflow-x-auto border-2 border-slate-100 rounded-2xl p-4 bg-white shadow-inner">
        <table className="w-full text-xs border-collapse">
          <thead>
            <tr>
              {tableData.headers.map((h, i) => (
                <th key={i} className="p-1 min-w-[100px]">
                  <div className="flex flex-col gap-1">
                    <button 
                      type="button" 
                      onClick={() => removeCol(i)}
                      className="text-[8px] text-red-400 hover:text-red-600 font-black uppercase tracking-tighter self-end px-1"
                      title="Delete Column"
                    >
                      Remove
                    </button>
                    <input 
                      className="w-full border-2 border-blue-50 p-2 rounded-lg bg-blue-50/50 text-center font-black focus:border-blue-300 outline-none" 
                      value={h} 
                      onChange={e => updateHeader(i, e.target.value)} 
                    />
                  </div>
                </th>
              ))}
              <th className="w-12">
                <button 
                  type="button" 
                  onClick={addCol} 
                  className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 font-black hover:bg-blue-100 transition shadow-sm"
                  title="Add Column"
                >
                  +
                </button>
              </th>
            </tr>
          </thead>
          <tbody>
            {tableData.rows.map((row, ri) => (
              <tr key={ri} className="group/row">
                {row.map((cell, ci) => (
                  <td key={ci} className="p-1">
                    <input 
                      className="w-full border border-slate-100 p-2 rounded-lg text-center focus:border-blue-200 outline-none transition" 
                      value={cell} 
                      onChange={e => updateCell(ri, ci, e.target.value)} 
                    />
                  </td>
                ))}
                <td className="text-center p-1">
                  <button 
                    type="button" 
                    onClick={() => removeRow(ri)}
                    className="w-8 h-8 rounded-lg bg-red-50 text-red-500 font-black opacity-0 group-hover/row:opacity-100 transition shadow-sm hover:bg-red-100"
                    title="Delete Row"
                  >
                    ×
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <button 
          type="button" 
          onClick={addRow} 
          className="w-full mt-4 py-3 border-2 border-dashed border-slate-200 text-slate-400 rounded-xl hover:bg-slate-50 transition text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2"
        >
          <span className="text-lg">+</span> Add New Row
        </button>
      </div>
    </div>
  );
};

const ImageAssetPreview: React.FC<{ url: string; onClear: () => void }> = ({ url, onClear }) => (
  <div className="flex items-center gap-4 p-4 bg-blue-50/50 border border-blue-100 rounded-2xl animate-in fade-in slide-in-from-top-2">
    <div className="w-20 h-20 rounded-xl overflow-hidden border-2 border-white shadow-sm bg-white shrink-0 group relative">
      <img src={url} className="w-full h-full object-cover" alt="Preview" />
      <div className="absolute inset-0 bg-blue-600/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
    </div>
    <div className="flex-grow min-w-0">
      <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest">Image Asset Ready</p>
      <p className="text-[9px] text-slate-400 font-bold uppercase truncate">Stored in Local Session State</p>
    </div>
    <button 
      type="button"
      onClick={onClear}
      className="bg-white text-red-500 font-black text-[9px] px-4 py-2 rounded-xl border border-red-100 hover:bg-red-50 transition shadow-sm uppercase tracking-widest active:scale-95"
    >
      Clear Image
    </button>
  </div>
);

const BankSidebarItem: React.FC<{
  question: Question;
  isSelected: boolean;
  onToggle: () => void;
  courseCode: string;
}> = ({ question, isSelected, onToggle, courseCode }) => (
  <div 
    onClick={onToggle}
    className={`text-xs p-5 border-2 rounded-2xl bg-white hover:border-blue-200 transition-all shadow-sm cursor-pointer relative group ${
      isSelected ? 'border-blue-600 bg-blue-50/30' : 'border-slate-50'
    }`}
  >
    <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${isSelected ? 'bg-blue-600 border-blue-600 text-white' : 'border-slate-300'}`}>
        {isSelected && '✓'}
      </div>
    </div>
    <div className="flex flex-wrap gap-1.5 mb-2">
      <span className="bg-indigo-600 text-white px-2 py-0.5 rounded-md font-black text-[8px] uppercase tracking-tighter">
        {courseCode}
      </span>
      <span className="bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-md font-black text-[8px] uppercase">
        {question.type}
      </span>
      <span className="bg-slate-100 text-slate-500 px-2 py-0.5 rounded-md font-black text-[8px] uppercase">
        {question.marks}M
      </span>
      <span className="bg-blue-100 text-blue-600 px-2 py-0.5 rounded-md font-black text-[8px] uppercase">
        {question.taxonomy} / {question.construct}
      </span>
    </div>
    <div className="text-[9px] font-black text-slate-400 uppercase mb-1 tracking-tight truncate">Topic: {question.topic}</div>
    <div className="text-slate-700 font-medium italic mb-2 line-clamp-2 leading-relaxed">
      <LatexRenderer text={question.text} />
    </div>
  </div>
);

export const BankManagement: React.FC<BankManagementProps> = ({ 
  onBack, onSave, onBatchAdd, currentBank, availableClos, availableMqf, availableCourses
}) => {
  const [activeTab, setActiveTab] = useState<'details' | 'subquestions' | 'options' | 'media'>('details');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [newQ, setNewQ] = useState<Partial<Question>>({
    courseId: '',
    type: 'mcq',
    marks: 1,
    topic: '',
    cloKeys: [],
    mqfKeys: [],
    text: '',
    answer: '',
    taxonomy: 'C1',
    construct: 'SS',
    subQuestions: [],
    options: ['', '', '', ''],
    tableData: { headers: ['Header 1', 'Header 2'], rows: [['Value 1', 'Value 2']], label: 'Table 1' },
    figureLabel: 'Figure 1',
    mediaType: 'figure'
  });

  const toggleSelection = (id: string) => {
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedIds(next);
  };

  const handleBatchAddClick = () => {
    const questionsToAdd = currentBank.filter(q => selectedIds.has(q.id));
    onBatchAdd(questionsToAdd);
    setSelectedIds(new Set());
    alert(`${questionsToAdd.length} questions added to the current assessment paper.`);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewQ({ ...newQ, imageUrl: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const toggleCLO = (clo: string) => {
    const current = newQ.cloKeys || [];
    if (current.includes(clo)) {
      setNewQ({ ...newQ, cloKeys: current.filter(c => c !== clo) });
    } else {
      setNewQ({ ...newQ, cloKeys: [...current, clo] });
    }
  };

  const toggleMQF = (mqf: string) => {
    const current = newQ.mqfKeys || [];
    if (current.includes(mqf)) {
      setNewQ({ ...newQ, mqfKeys: current.filter(m => m !== mqf) });
    } else {
      setNewQ({ ...newQ, mqfKeys: [...current, mqf] });
    }
  };

  const handleSetCorrectMCQ = (label: string) => {
     setNewQ({ ...newQ, answer: `Option ${label}` });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newQ.text || !newQ.topic || !newQ.courseId) {
      alert("Please fill in the Course, Topic, and Question text.");
      return;
    }
    
    const cleanedQ = { ...newQ };
    if (cleanedQ.mediaType === 'figure' || cleanedQ.mediaType === 'table-figure') {
      delete cleanedQ.tableData;
    } else if (cleanedQ.mediaType === 'table') {
      delete cleanedQ.imageUrl;
      delete cleanedQ.figureLabel;
    }

    const q: Question = {
      ...cleanedQ as Question,
      id: 'custom-' + Date.now(),
      number: ''
    };
    onSave(q);
    alert('Question added to bank!');
    setNewQ({
      ...newQ,
      text: '',
      answer: '',
      subQuestions: [],
      imageUrl: undefined,
      figureLabel: 'Figure 1'
    });
    setActiveTab('details');
  };

  const getCourseCode = (id?: string) => availableCourses.find(c => c.id === id)?.code || "N/A";

  const isStructure = newQ.type === 'structure';

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-4xl font-black text-slate-800 tracking-tight">Bank Management</h2>
            <p className="text-slate-500 font-bold uppercase text-[11px] tracking-widest mt-1">Repository for shared institutional assessment items</p>
          </div>
          <button onClick={onBack} className="bg-white border-2 border-slate-200 px-6 py-2 rounded-2xl text-slate-600 font-black hover:bg-slate-50 transition active:scale-95 text-xs uppercase tracking-widest shadow-sm">← Back to Hub</button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <form onSubmit={handleSubmit} className="lg:col-span-8 bg-white rounded-[40px] shadow-2xl overflow-hidden flex flex-col border border-slate-100 ring-1 ring-black/5 animate-in slide-in-from-left duration-500">
            <div className="flex border-b bg-slate-50/50 p-1">
              <button type="button" onClick={() => setActiveTab('details')} className={`flex-1 py-4 text-[10px] font-black uppercase tracking-widest transition rounded-2xl ${activeTab === 'details' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}>1. Identity & Links</button>
              {(newQ.type === 'calculation' || newQ.type === 'short-answer' || newQ.type === 'diagram-label' || newQ.type === 'structure') && (
                <button type="button" onClick={() => setActiveTab('subquestions')} className={`flex-1 py-4 text-[10px] font-black uppercase tracking-widest transition rounded-2xl ${activeTab === 'subquestions' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}>2. Sub-Parts</button>
              )}
              {newQ.type === 'mcq' && (
                <button type="button" onClick={() => setActiveTab('options')} className={`flex-1 py-4 text-[10px] font-black uppercase tracking-widest transition rounded-2xl ${activeTab === 'options' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}>2. MCQ Options</button>
              )}
              <button type="button" onClick={() => setActiveTab('media')} className={`flex-1 py-4 text-[10px] font-black uppercase tracking-widest transition rounded-2xl ${activeTab === 'media' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}>3. Media</button>
            </div>

            <div className="p-10 space-y-8 flex-grow min-h-[550px] overflow-y-auto custom-scrollbar bg-gradient-to-b from-white to-slate-50/20">
              {activeTab === 'details' && (
                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-1.5">
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Target Course</label>
                      <select 
                        required
                        className="w-full border-2 border-slate-100 p-4 rounded-2xl outline-none focus:border-blue-400 bg-white font-bold shadow-sm transition" 
                        value={newQ.courseId} 
                        onChange={e => setNewQ({...newQ, courseId: e.target.value})}
                      >
                        <option value="">-- Select Course --</option>
                        {availableCourses.map(c => <option key={c.id} value={c.id}>{c.code} - {c.name}</option>)}
                      </select>
                    </div>
                    <div className="space-y-1.5">
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Topic / Chapter</label>
                      <input required className="w-full border-2 border-slate-100 p-4 rounded-2xl outline-none focus:border-blue-400 bg-white font-bold shadow-sm transition" value={newQ.topic} onChange={e => setNewQ({...newQ, topic: e.target.value})} placeholder="e.g. 1.0 Hand Tools" />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="space-y-1.5">
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Question Type</label>
                      <select 
                        className="w-full border-2 border-slate-100 p-4 rounded-2xl outline-none focus:border-blue-400 bg-white font-bold shadow-sm transition" 
                        value={newQ.type} 
                        onChange={e => setNewQ({...newQ, type: e.target.value as any, marks: e.target.value === 'mcq' ? 1 : 5})}
                      >
                        <option value="mcq">MCQ (Objective)</option>
                        <option value="short-answer">Short Answer</option>
                        <option value="structure">Structure</option>
                        <option value="essay">Essay</option>
                        <option value="calculation">Calculation</option>
                        <option value="measurement">Measurement</option>
                        <option value="diagram-label">Diagram Labeling</option>
                      </select>
                    </div>
                    <div className="space-y-1.5">
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Construct (SS/GS)</label>
                        <select className="w-full border-2 border-slate-100 p-4 rounded-2xl outline-none focus:border-blue-400 bg-white font-bold shadow-sm transition" value={newQ.construct} onChange={e => setNewQ({...newQ, construct: e.target.value})}>
                           <option value="SS">Specific Skills (SS)</option>
                           <option value="GS">Generic Skills (GS)</option>
                        </select>
                        <p className="text-[9px] text-slate-400 font-medium ml-1">SS: Discipline-based skills &middot; GS: Soft skills/Humanities</p>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                       <div className="space-y-1.5">
                          <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Taxonomy</label>
                          <input className="w-full border-2 border-slate-100 p-4 rounded-2xl outline-none focus:border-blue-400 bg-white font-bold text-center shadow-sm" value={newQ.taxonomy} onChange={e => setNewQ({...newQ, taxonomy: e.target.value})} placeholder="C1" />
                       </div>
                       <div className="space-y-1.5">
                          <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Marks</label>
                          <input type="number" className="w-full border-2 border-slate-100 p-4 rounded-2xl outline-none focus:border-blue-400 bg-white font-bold text-center shadow-sm" value={newQ.marks} onChange={e => setNewQ({...newQ, marks: parseInt(e.target.value) || 0})} />
                       </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-1.5">
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Linked CLOs</label>
                      <div className="grid grid-cols-2 gap-2 bg-slate-50/50 p-4 rounded-2xl border-2 border-slate-100 h-28 overflow-y-auto custom-scrollbar">
                        {availableClos.map(clo => (
                          <label key={clo} className="flex items-center gap-2 cursor-pointer group">
                            <input type="checkbox" className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500" checked={newQ.cloKeys?.includes(clo)} onChange={() => toggleCLO(clo)} />
                            <span className="text-[10px] font-bold text-slate-600 group-hover:text-blue-600 transition-colors">{clo}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">MQF/DA Attributes</label>
                      <div className="grid grid-cols-2 gap-2 bg-slate-50/50 p-4 rounded-2xl border-2 border-slate-100 h-28 overflow-y-auto custom-scrollbar">
                        {availableMqf.map(mqf => (
                          <label key={mqf} className="flex items-center gap-2 cursor-pointer group">
                            <input type="checkbox" className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500" checked={newQ.mqfKeys?.includes(mqf)} onChange={() => toggleMQF(mqf)} />
                            <span className="text-[10px] font-bold text-slate-600 group-hover:text-blue-600 transition-colors">{mqf}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex justify-between items-end">
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Question Stem (LaTeX Supported)</label>
                    </div>
                    <textarea 
                      required 
                      className="w-full border-2 border-slate-100 p-5 rounded-3xl h-32 outline-none focus:border-blue-400 bg-white italic text-sm shadow-sm transition" 
                      value={newQ.text} 
                      onChange={e => setNewQ({...newQ, text: e.target.value})} 
                      placeholder="Question text... Use $...$ for inline math." 
                    />
                  </div>

                  {/* Marking Scheme Area: Hidden if MCQ because MCQ is auto-populated via Ticks in Options Tab */}
                  {newQ.type !== 'mcq' && (
                    <div className="space-y-2 pt-4 border-t border-slate-100">
                      <div className="flex justify-between items-end">
                        <label className={`block text-[10px] font-black uppercase tracking-widest ml-1 ${isStructure ? 'text-slate-300' : 'text-slate-400'}`}>
                          {isStructure ? 'Marking Scheme (Disabled for Structure Type)' : 'Marking Scheme / Answer Key'}
                        </label>
                        {!isStructure && (
                          <MarkInputControl 
                            onAddMark={(m) => setNewQ({...newQ, answer: (newQ.answer || '') + ` (${m} mark${m > 1 ? 's' : ''})`})}
                          />
                        )}
                      </div>
                      <textarea 
                        className={`w-full border-2 border-slate-100 p-5 rounded-3xl h-32 outline-none font-mono text-xs shadow-sm transition leading-relaxed ${isStructure ? 'bg-slate-50 text-slate-400 cursor-not-allowed' : 'bg-purple-50/10 focus:border-purple-400'}`}
                        value={isStructure ? 'Marking scheme defined in sub-questions.' : (newQ.answer || '')} 
                        onChange={e => !isStructure && setNewQ({...newQ, answer: e.target.value})} 
                        disabled={isStructure}
                        placeholder={isStructure ? "Disabled" : 'Example:\nDefinition of force... (1 mark)\nSI Unit is Newton... (1 mark)'} 
                      />
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'media' && (
                <div className="space-y-8 animate-in fade-in slide-in-from-right-4">
                   <div className="flex gap-2 p-1.5 bg-slate-100 rounded-2xl w-fit">
                      <button type="button" onClick={() => setNewQ({...newQ, mediaType: 'figure'})} className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition ${newQ.mediaType === 'figure' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-500 hover:text-slate-700'}`}>Figure/Diagram</button>
                      <button type="button" onClick={() => setNewQ({...newQ, mediaType: 'table'})} className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition ${newQ.mediaType === 'table' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-500 hover:text-slate-700'}`}>Real Table</button>
                      <button type="button" onClick={() => setNewQ({...newQ, mediaType: 'table-figure'})} className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition ${newQ.mediaType === 'table-figure' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-500 hover:text-slate-700'}`}>Table Figure</button>
                   </div>

                   {newQ.imageUrl && (newQ.mediaType === 'figure' || newQ.mediaType === 'table-figure') && (
                     <ImageAssetPreview 
                        url={newQ.imageUrl} 
                        onClear={() => setNewQ({ ...newQ, imageUrl: undefined })} 
                     />
                   )}

                   {(newQ.mediaType === 'figure' || newQ.mediaType === 'table-figure') ? (
                     <div className="space-y-4">
                       <MediaLabelInput 
                         type={newQ.mediaType}
                         value={newQ.figureLabel || ''}
                         onChange={(val) => setNewQ({ ...newQ, figureLabel: val })}
                       />

                       <div 
                         onClick={() => fileInputRef.current?.click()} 
                         className={`cursor-pointer group relative max-w-lg aspect-video border-4 border-dashed rounded-[32px] flex items-center justify-center transition-all shadow-sm ${
                           newQ.imageUrl ? 'border-blue-200 bg-blue-50/10 hover:bg-blue-50/20' : 'border-slate-100 bg-white hover:bg-blue-50'
                         }`}
                       >
                          {newQ.imageUrl ? (
                            <div className="relative h-full w-full flex flex-col items-center justify-center gap-2 p-6 text-center">
                              <span className="text-4xl">🔄</span>
                              <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest">Replace Media Asset</p>
                              <div className="mt-2 opacity-50 max-h-32 overflow-hidden rounded-xl border border-blue-100 bg-white">
                                <img src={newQ.imageUrl} className="h-full w-full object-contain" alt="Asset" />
                              </div>
                            </div>
                          ) : (
                            <div className="text-blue-200 flex flex-col items-center">
                              <span className="text-7xl block mb-4">🖼️</span>
                              <p className="text-[11px] font-black uppercase tracking-widest">Upload Media Asset</p>
                            </div>
                          )}
                        </div>
                        <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleImageUpload} />
                     </div>
                   ) : (
                     <RealTableEditor 
                        tableData={newQ.tableData} 
                        onChange={(data) => setNewQ({ ...newQ, tableData: data })} 
                     />
                   )}
                </div>
              )}

              {activeTab === 'subquestions' && (
                <div className="space-y-4 animate-in slide-in-from-right-4">
                  {newQ.subQuestions?.map((sub, idx) => (
                    <div key={idx} className="bg-white p-5 rounded-3xl border-2 border-slate-100 shadow-sm flex flex-col gap-4">
                      <div className="flex gap-4 items-center">
                        <div className="flex flex-col gap-1 shrink-0">
                          <label className="text-[8px] font-black text-slate-400 uppercase">Part</label>
                          <input className="w-12 border-2 border-slate-50 bg-slate-50/50 rounded-xl p-2 text-center font-black focus:border-blue-200 outline-none" value={sub.label} onChange={e => {
                             const subs = [...(newQ.subQuestions || [])];
                             subs[idx] = { ...subs[idx], label: e.target.value };
                             setNewQ({...newQ, subQuestions: subs});
                          }} />
                        </div>
                        <div className="flex flex-col gap-1 flex-grow">
                          <label className="text-[8px] font-black text-slate-400 uppercase ml-1">Sub-Question Stem</label>
                          <input className="w-full border-2 border-slate-50 bg-slate-50/50 rounded-xl p-2 italic text-sm focus:border-blue-200 outline-none" value={sub.text} onChange={e => {
                             const subs = [...(newQ.subQuestions || [])];
                             subs[idx] = { ...subs[idx], text: e.target.value };
                             setNewQ({...newQ, subQuestions: subs});
                          }} />
                        </div>
                        <div className="flex flex-col gap-1 shrink-0">
                          <label className="text-[8px] font-black text-slate-400 uppercase text-center">Marks</label>
                          <input type="number" className="w-14 border-2 border-slate-50 bg-slate-50/50 rounded-xl p-2 text-center font-black focus:border-blue-200 outline-none" value={sub.marks} onChange={e => {
                             const subs = [...(newQ.subQuestions || [])];
                             subs[idx] = { ...subs[idx], marks: parseInt(e.target.value) || 0 };
                             setNewQ({...newQ, subQuestions: subs, marks: subs.reduce((a, b) => a + (b.marks || 0), 0)});
                          }} />
                        </div>
                        <button 
                          type="button" 
                          onClick={() => {
                            const subs = [...(newQ.subQuestions || [])];
                            subs.splice(idx, 1);
                            setNewQ({ ...newQ, subQuestions: subs, marks: subs.reduce((a, b) => a + (b.marks || 0), 0) });
                          }}
                          className="text-red-300 hover:text-red-500 font-bold self-end mb-2 ml-2"
                        >
                          ×
                        </button>
                      </div>
                      <div className="flex flex-col gap-1">
                          <div className="flex justify-between items-center">
                            <label className="text-[8px] font-black text-slate-400 uppercase ml-1">Sub-Question Answer / Criteria</label>
                            <MarkInputControl 
                              onAddMark={(m) => {
                                const subs = [...(newQ.subQuestions || [])];
                                const current = subs[idx].answer || '';
                                const markStr = ` (${m} mark${m > 1 ? 's' : ''})`;
                                subs[idx] = { ...subs[idx], answer: current + markStr };
                                setNewQ({...newQ, subQuestions: subs});
                              }}
                              className="scale-90 origin-right"
                            />
                          </div>
                          <textarea 
                            className="w-full border-2 border-slate-50 bg-slate-50/50 rounded-xl p-3 text-xs font-mono focus:border-purple-200 outline-none resize-none h-20" 
                            value={sub.answer || ''} 
                            onChange={e => {
                                const subs = [...(newQ.subQuestions || [])];
                                subs[idx] = { ...subs[idx], answer: e.target.value };
                                setNewQ({...newQ, subQuestions: subs});
                            }} 
                            placeholder="Answer key and marking criteria for this part..."
                          />
                      </div>
                    </div>
                  ))}
                  <button 
                    type="button" 
                    onClick={() => setNewQ({...newQ, subQuestions: [...(newQ.subQuestions || []), {label: String.fromCharCode(97 + (newQ.subQuestions?.length || 0)) + ')', text: '', marks: 1}]})} 
                    className="w-full py-4 border-2 border-dashed border-slate-200 text-slate-400 rounded-3xl font-black uppercase text-[10px] tracking-widest hover:bg-slate-50 transition"
                  >
                    + Add New Part Description
                  </button>
                </div>
              )}
              
              {activeTab === 'options' && (
                <div className="space-y-6 animate-in slide-in-from-right-4">
                  {['A', 'B', 'C', 'D'].map((label, idx) => {
                    const isCorrect = newQ.answer?.trim().startsWith(`Option ${label}`);
                    return (
                      <div key={label} className="flex items-center gap-6 group">
                        <div className="flex items-center gap-2">
                           <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-lg shadow-sm border transition-all ${isCorrect ? 'bg-emerald-500 text-white border-emerald-500' : 'bg-blue-50 text-blue-600 border-blue-100'}`}>
                             {label}
                           </div>
                           <button 
                             type="button" 
                             onClick={() => handleSetCorrectMCQ(label)}
                             className={`w-10 h-10 rounded-xl flex items-center justify-center border-2 transition-all ${isCorrect ? 'bg-emerald-50 border-emerald-200 text-emerald-600' : 'bg-white border-slate-100 text-slate-200 hover:border-emerald-200 hover:text-emerald-400'}`}
                             title="Mark as Correct Answer"
                           >
                             ✓
                           </button>
                        </div>
                        <input 
                          className={`flex-grow border-2 p-4 rounded-2xl outline-none transition shadow-sm font-bold ${isCorrect ? 'border-emerald-200 bg-emerald-50/20' : 'border-slate-100 bg-white focus:border-blue-400'}`} 
                          value={newQ.options?.[idx] || ''} 
                          onChange={e => {
                            const opts = [...(newQ.options || ['', '', '', ''])];
                            opts[idx] = e.target.value;
                            setNewQ({...newQ, options: opts});
                          }}
                          placeholder={`Provide text for option ${label}...`}
                        />
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="p-10 bg-slate-50 border-t flex gap-4">
               <button type="submit" className="w-full bg-blue-600 text-white font-black py-6 rounded-3xl shadow-2xl uppercase tracking-widest text-sm transition transform active:scale-95 hover:bg-blue-700">Save Item to Shared Bank</button>
            </div>
          </form>

          <div className="lg:col-span-4 bg-white p-8 rounded-[40px] shadow-xl border border-slate-100 flex flex-col h-[750px] sticky top-8">
            <div className="flex justify-between items-center mb-8 border-b border-slate-50 pb-4">
              <h3 className="font-black text-[11px] text-slate-400 uppercase tracking-widest">BANK REPOSITORY</h3>
              {selectedIds.size > 0 && (
                <span className="text-[10px] font-black bg-blue-600 text-white px-3 py-1 rounded-full shadow-lg animate-in zoom-in">{selectedIds.size} SELECTED</span>
              )}
            </div>
            
            <div className="space-y-4 overflow-y-auto flex-grow pr-2 custom-scrollbar pb-4">
              {currentBank.length > 0 ? (
                currentBank.slice().reverse().map(q => (
                  <BankSidebarItem 
                    key={q.id}
                    question={q}
                    isSelected={selectedIds.has(q.id)}
                    onToggle={() => toggleSelection(q.id)}
                    courseCode={getCourseCode(q.courseId)}
                  />
                ))
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-slate-300 italic text-center py-20 opacity-40">
                   <span className="text-5xl mb-4">📥</span>
                   <p className="text-[11px] font-black uppercase tracking-widest">No items found</p>
                </div>
              )}
            </div>

            {selectedIds.size > 0 && (
              <div className="mt-6 pt-6 border-t border-slate-100 animate-in slide-in-from-bottom-6">
                <div className="flex flex-col gap-3">
                  <div className="flex gap-2">
                    <button 
                      onClick={() => setSelectedIds(new Set())}
                      className="flex-1 bg-slate-100 text-slate-500 font-black py-3 rounded-2xl uppercase tracking-widest text-[10px] hover:bg-slate-200 transition"
                    >
                      Clear
                    </button>
                    <button 
                      onClick={() => setSelectedIds(new Set(currentBank.map(q => q.id)))}
                      className="flex-1 bg-slate-100 text-slate-500 font-black py-3 rounded-2xl uppercase tracking-widest text-[10px] hover:bg-slate-200 transition"
                    >
                      All
                    </button>
                  </div>
                  <button 
                    onClick={handleBatchAddClick}
                    className="w-full bg-slate-900 text-white font-black py-5 rounded-2xl shadow-xl uppercase tracking-widest text-[11px] flex items-center justify-center gap-3 hover:bg-slate-800 transition transform active:scale-95"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5z" />
                    </svg>
                    Save Selected to Paper
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};