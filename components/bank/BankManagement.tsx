
import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Question, Course, QuestionPart, MatrixRow, AssessmentDomain } from '../../types';
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

const JSU_TYPE_MAP: Record<string, Question['type']> = {
  'O': 'mcq', 'S': 'structure', 'P': 'measurement', 'R': 'essay', 'A': 'short-answer'
};

const TYPE_LABEL_MAP: Record<Question['type'], string> = {
  'mcq': 'MCQ (Objective)', 'structure': 'Structure (Subjective)', 'measurement': 'Measurement (Subjective)',
  'essay': 'Essay (Subjective)', 'short-answer': 'Short Answer (Subjective)', 'calculation': 'Calculation (Subjective)',
  'diagram-label': 'Diagram Labeling (Subjective)'
};

const DOMAIN_LEVELS: Record<AssessmentDomain, string[]> = {
  'Cognitive': ['C1', 'C2', 'C3', 'C4', 'C5', 'C6'],
  'Psychomotor': ['P1', 'P2', 'P3', 'P4', 'P5', 'P6', 'P7'],
  'Affective': ['A1', 'A2', 'A3', 'A4', 'A5']
};

const FormLabel: React.FC<{ children: React.ReactNode; className?: string; isSync?: boolean }> = ({ children, className = "", isSync }) => (
  <label className={`block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1 flex items-center justify-between ${className}`}>
    <span>{children}</span>
    {isSync && <span className="bg-emerald-50 text-emerald-500 px-1.5 py-0.5 rounded-[4px] border border-emerald-100 text-[7px] animate-pulse">CIST BLUEPRINT SYNC</span>}
  </label>
);

const SelectField: React.FC<{
  value: string; onChange: (val: string) => void; options: { value: string; label: string }[];
  placeholder: string; disabled?: boolean; className?: string;
}> = ({ value, onChange, options, placeholder, disabled, className = "" }) => (
  <div className={`relative group ${className}`}>
    <select disabled={disabled} value={value} onChange={e => onChange(e.target.value)}
      className="w-full appearance-none border border-slate-100 bg-white p-4 rounded-2xl outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-100 transition shadow-sm font-bold text-slate-700 text-sm cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed">
      <option value="">{placeholder}</option>
      {options.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
    </select>
    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-300 text-[10px]">▼</div>
  </div>
);

export const BankManagement: React.FC<BankManagementProps> = ({ onBack, onSave, currentBank, availableCourses }) => {
  const [activeTab, setActiveTab] = useState<'identity' | 'question' | 'marking'>('identity');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const answerSketchRef = useRef<HTMLInputElement>(null);
  
  const [newQ, setNewQ] = useState<Partial<Question>>({
    courseId: '', sectionTitle: '', topic: '', type: 'structure', marks: 1,
    cloKeys: [], mqfKeys: [], text: '', answer: '', taxonomy: '',
    construct: '', domain: 'Cognitive', subQuestions: [], options: ['', '', '', ''],
    mediaType: undefined, figureLabel: 'Figure 1', answerImageUrl: '', answerFigureLabel: 'Solution Sketch'
  });

  const selectedCourse = useMemo(() => availableCourses.find(c => c.id === newQ.courseId), [availableCourses, newQ.courseId]);
  
  const assessmentOptions = useMemo(() => {
    if (!selectedCourse?.jsuTemplate) return [];
    const tasks = Array.from(new Set(selectedCourse.jsuTemplate.map(s => s.task).filter(Boolean)));
    return tasks.map(t => ({ value: t!, label: t! }));
  }, [selectedCourse]);

  const selectedTaskPolicy = useMemo(() => {
    if (!selectedCourse || !newQ.sectionTitle) return null;
    return (selectedCourse.assessmentPolicies || []).find(p => p.name === newQ.sectionTitle);
  }, [selectedCourse, newQ.sectionTitle]);

  const topicOptions = useMemo(() => {
    if (!selectedCourse?.jsuTemplate || !newQ.sectionTitle) return [];
    const topics = Array.from(new Set(
      selectedCourse.jsuTemplate
        .filter(s => s.task === newQ.sectionTitle)
        .map(s => s.topicCode)
        .filter(Boolean)
    ));
    
    return topics.map(code => {
        const match = code!.match(/T(\d+)/i);
        const index = match ? parseInt(match[1], 10) - 1 : -1;
        const fullTitle = (index >= 0 && selectedCourse.topics?.[index]) ? selectedCourse.topics[index] : code!;
        return { 
            value: code!, 
            label: `${code} : ${fullTitle}` 
        };
    });
  }, [selectedCourse, newQ.sectionTitle]);

  const matchedSlot = useMemo(() => {
    if (!selectedCourse?.jsuTemplate || !newQ.sectionTitle || !newQ.topic) return null;
    return selectedCourse.jsuTemplate.find(s => s.task === newQ.sectionTitle && s.topicCode === newQ.topic);
  }, [selectedCourse, newQ.sectionTitle, newQ.topic]);

  const taxonomyOptions = useMemo(() => {
    const fullList = DOMAIN_LEVELS[newQ.domain as AssessmentDomain || 'Cognitive'];
    if (!selectedTaskPolicy) return fullList.map(l => ({ value: l, label: l }));
    
    const maxTax = selectedTaskPolicy.maxTaxonomy || '';
    const maxIdx = fullList.indexOf(maxTax);
    
    // If taxonomy is not set in policy, show all. Otherwise slice up to ceiling.
    const constrainedList = maxIdx === -1 ? fullList : fullList.slice(0, maxIdx + 1);
    return constrainedList.map(l => ({ value: l, label: l === maxTax ? `${l} (CEILING)` : l }));
  }, [newQ.domain, selectedTaskPolicy]);

  // Constrain MQF Attributes based on Taxonomy Mapping in Registry
  const constrainedMqfs = useMemo(() => {
    if (!selectedCourse || !newQ.taxonomy) return [];
    const mappings = selectedCourse.mqfMappings || {};
    return Object.keys(selectedCourse.mqfs).filter(mqfCode => {
        const validLevels = mappings[mqfCode] || [];
        return validLevels.includes(newQ.taxonomy!);
    });
  }, [selectedCourse, newQ.taxonomy]);

  const assessmentSpecificClos = useMemo(() => {
    if (!selectedCourse?.jsuTemplate || !newQ.sectionTitle) return [];
    const clos = new Set<string>();
    selectedCourse.jsuTemplate
      .filter(s => s.task === newQ.sectionTitle)
      .forEach(s => s.clos?.forEach(c => clos.add(c)));
    return Array.from(clos).sort();
  }, [selectedCourse, newQ.sectionTitle]);

  const availableTypes = useMemo(() => {
    if (matchedSlot && matchedSlot.itemTypes && matchedSlot.itemTypes.length > 0) {
      return matchedSlot.itemTypes
        .map(c => {
          const typeVal = JSU_TYPE_MAP[c.toUpperCase()];
          return typeVal ? { value: typeVal, label: TYPE_LABEL_MAP[typeVal] } : null;
        })
        .filter((opt): opt is { value: Question['type']; label: string } => opt !== null);
    }
    return Object.entries(TYPE_LABEL_MAP).map(([val, label]) => ({ value: val as Question['type'], label }));
  }, [matchedSlot]);

  useEffect(() => {
    if (matchedSlot) {
      const updates: Partial<Question> = {};
      if (matchedSlot.clos?.length) updates.cloKeys = [...matchedSlot.clos];
      if (matchedSlot.construct) updates.construct = matchedSlot.construct.includes('GS') ? 'GS' : 'SS';
      
      const itemTypes = matchedSlot.itemTypes?.map(c => JSU_TYPE_MAP[c.toUpperCase()]).filter(Boolean) as Question['type'][];
      
      if (itemTypes?.length === 1) {
        updates.type = itemTypes[0];
      } else if (itemTypes?.length > 1) {
        if (!newQ.type || !itemTypes.includes(newQ.type)) {
          updates.type = itemTypes[0];
        }
      }

      const taxLevels = Object.keys(matchedSlot.levels || {}).filter(l => (matchedSlot.levels?.[l]?.marks || 0) > 0);
      if (taxLevels.length === 1) {
        updates.taxonomy = taxLevels[0];
        updates.marks = matchedSlot.levels?.[taxLevels[0]]?.marks || 0;
      }
      setNewQ(prev => ({ ...prev, ...updates }));
    }
  }, [matchedSlot]);

  const handleTaxonomyChange = (l: string) => {
    const marks = matchedSlot?.levels?.[l]?.marks || 0;
    // Reset MQF keys if the new taxonomy doesn't support currently selected ones
    setNewQ(prev => ({ ...prev, taxonomy: l, marks, mqfKeys: [] }));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, field: 'imageUrl' | 'answerImageUrl') => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setNewQ({ ...newQ, [field]: reader.result as string });
      reader.readAsDataURL(file);
    }
  };

  const handleSubPartImage = (idx: number, e: React.ChangeEvent<HTMLInputElement>, field: 'answerImageUrl') => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
         const subs = [...(newQ.subQuestions || [])];
         subs[idx] = { ...subs[idx], [field]: reader.result as string };
         setNewQ({ ...newQ, subQuestions: subs });
      };
      reader.readAsDataURL(file);
    }
  };

  const toggleLink = (field: 'mqfKeys' | 'cloKeys', key: string) => {
    const current = (newQ[field] || []) as string[];
    const next = current.includes(key) ? current.filter(k => k !== key) : [...current, key];
    setNewQ({ ...newQ, [field]: next });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newQ.text || !newQ.courseId) return alert("Registry Error: Missing stem or course.");
    onSave({ ...newQ as Question, id: 'custom-' + Date.now(), number: '' });
    alert('Academic item successfully committed.');
    setNewQ({ courseId: '', text: '', answer: '', subQuestions: [], options: ['', '', '', ''], type: 'structure', mediaType: undefined, answerImageUrl: '' });
    setActiveTab('identity');
  };

  const getFullTopicDisplay = (q: Partial<Question>) => {
    if (!q.topic || !q.courseId) return q.topic || 'General';
    const course = availableCourses.find(c => c.id === q.courseId);
    if (!course) return q.topic;
    
    const match = q.topic.match(/T(\d+)/i);
    const index = match ? parseInt(match[1], 10) - 1 : -1;
    const fullTitle = (index >= 0 && course.topics?.[index]) ? course.topics[index] : q.topic;
    return `${q.topic} : ${fullTitle}`;
  };

  return (
    <div className="min-h-screen bg-slate-50 p-8 font-sans">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-10">
          <div>
            <h2 className="text-4xl font-black text-slate-900 tracking-tight uppercase">Registry Terminal</h2>
            <p className="text-slate-500 font-bold uppercase text-[10px] tracking-widest mt-1 border-l-4 border-blue-600 pl-4 italic">Topic Shorthand (T1, T2) Sync Active</p>
          </div>
          <button onClick={onBack} className="bg-white border border-slate-200 px-8 py-3 rounded-2xl text-slate-600 font-black hover:bg-slate-50 transition text-xs uppercase tracking-widest shadow-sm">← Exit Registry</button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          <form onSubmit={handleSubmit} className="lg:col-span-8 bg-white rounded-[40px] shadow-2xl overflow-hidden flex flex-col border border-slate-100 animate-in slide-in-from-left">
            <div className="flex border-b bg-slate-50/50 p-2 gap-1 shrink-0">
              {[
                { id: 'identity', label: '1. Identity', icon: '🆔' },
                { id: 'question', label: '2. Question', icon: '📝' },
                { id: 'marking', label: '3. Marking Scheme', icon: '✍️' }
              ].map(tab => (
                <button key={tab.id} type="button" onClick={() => setActiveTab(tab.id as any)} 
                  className={`flex-1 flex items-center justify-center gap-2 py-5 text-[10px] font-black uppercase tracking-widest transition-all rounded-2xl ${activeTab === tab.id ? 'bg-white text-blue-600 shadow-xl' : 'text-slate-400 hover:text-slate-600'}`}>
                  <span className="text-sm">{tab.icon}</span> {tab.label}
                </button>
              ))}
            </div>

            <div className="p-10 space-y-10 flex-grow min-h-[650px] overflow-y-auto custom-scrollbar">
              
              {activeTab === 'identity' && (
                <div className="space-y-10 animate-in fade-in slide-in-from-bottom-2">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div>
                      <FormLabel>Course Selector</FormLabel>
                      <SelectField placeholder="-- Choose Course --" value={newQ.courseId || ''} options={availableCourses.map(c => ({ value: c.id, label: `${c.code} - ${c.name}` }))} onChange={val => setNewQ({ ...newQ, courseId: val, sectionTitle: '', topic: '' })} />
                    </div>
                    <div>
                      <FormLabel>Assessment Task</FormLabel>
                      <SelectField placeholder="-- Select Task --" disabled={!newQ.courseId} value={newQ.sectionTitle || ''} options={assessmentOptions} onChange={val => setNewQ({ ...newQ, sectionTitle: val, topic: '' })} />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div>
                      <FormLabel>Module / Topic (CIST Code Mapped)</FormLabel>
                      <SelectField placeholder="-- Choose Topic --" disabled={!newQ.sectionTitle} value={newQ.topic || ''} options={topicOptions} onChange={val => setNewQ({ ...newQ, topic: val })} />
                    </div>
                    <div>
                      <FormLabel>Taxonomy Domain</FormLabel>
                      <div className="flex gap-1 p-1 bg-slate-50 border border-slate-100 rounded-xl">
                        {(['Cognitive', 'Psychomotor', 'Affective'] as AssessmentDomain[]).map(d => (
                          <button key={d} type="button" onClick={() => setNewQ({ ...newQ, domain: d, taxonomy: '' })} className={`flex-1 py-2 text-[8px] font-black rounded-lg transition-all ${newQ.domain === d ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:bg-white'}`}>
                            {d.toUpperCase()}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                      <FormLabel isSync>Item Type</FormLabel>
                      <SelectField placeholder="Type" value={newQ.type || ''} options={availableTypes} onChange={val => setNewQ({ ...newQ, type: val as Question['type'] })} />
                    </div>
                    <div><FormLabel isSync>Construct</FormLabel><div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 font-bold text-slate-500 text-xs text-center min-h-[50px] flex items-center justify-center">{newQ.construct || '-'}</div></div>
                    <div>
                      <FormLabel isSync>Taxonomy (Syllabus-Capped)</FormLabel>
                      <SelectField placeholder="Lvl" value={newQ.taxonomy || ''} options={taxonomyOptions} onChange={handleTaxonomyChange} disabled={!newQ.sectionTitle} />
                    </div>
                    <div><FormLabel isSync>Auto Marks</FormLabel><div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 font-black text-blue-600 text-sm text-center min-h-[50px] flex items-center justify-center">{newQ.marks || 0}</div></div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div>
                      <FormLabel isSync>Linked CLOs</FormLabel>
                      <div className="flex flex-wrap gap-2 p-5 bg-slate-50 border border-slate-100 rounded-[24px] min-h-[120px] content-start">
                        {assessmentSpecificClos.length ? assessmentSpecificClos.map(k => {
                            const isAuto = newQ.cloKeys?.includes(k);
                            return (
                                <button key={k} type="button" onClick={() => toggleLink('cloKeys', k)}
                                    className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase transition-all ${isAuto ? 'bg-blue-600 text-white shadow-lg' : 'bg-white text-slate-400 border border-slate-100'}`}>{k}</button>
                            );
                        }) : <span className="text-[10px] text-slate-300 font-black uppercase m-auto italic">Select task to load CLOs</span>}
                      </div>
                    </div>
                    <div>
                      <FormLabel>MQF/Dublin (Registry Mapped)</FormLabel>
                      <div className="flex flex-wrap gap-2 p-5 bg-slate-50 border border-slate-100 rounded-[24px] min-h-[120px] content-start">
                        {constrainedMqfs.length > 0 ? constrainedMqfs.map(k => (
                          <button key={k} type="button" onClick={() => toggleLink('mqfKeys', k)}
                            className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase transition-all ${newQ.mqfKeys?.includes(k) ? 'bg-indigo-600 text-white shadow-lg' : 'bg-white text-slate-400 border border-slate-100'}`}>{k}</button>
                        )) : (
                          <span className="text-[9px] text-slate-300 font-black uppercase m-auto leading-relaxed text-center italic">
                            {newQ.taxonomy ? 'No attributes mapped to this level in Registry' : 'Select Taxonomy to load Standards'}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'question' && (
                <div className="space-y-10 animate-in fade-in slide-in-from-right-4">
                  <div>
                    <FormLabel>Question Stem (LaTeX enabled)</FormLabel>
                    <textarea required className="w-full border-2 border-slate-100 p-6 rounded-[32px] h-40 outline-none focus:border-blue-400 text-sm font-medium italic text-slate-700 shadow-inner" 
                      value={newQ.text} onChange={e => setNewQ({ ...newQ, text: e.target.value })} placeholder="Type main question here..." />
                  </div>

                  <div className="space-y-6">
                    <div className="flex justify-between items-center"><FormLabel>Question Assets (Sketch/Table)</FormLabel><div className="flex gap-2 p-1.5 bg-slate-100 rounded-xl shadow-inner">
                      {['figure', 'table'].map(m => <button key={m} type="button" onClick={() => setNewQ({ ...newQ, mediaType: m as any })} className={`px-8 py-2 rounded-lg text-[9px] font-black uppercase transition-all ${newQ.mediaType === m ? 'bg-white text-blue-600 shadow-md' : 'text-slate-500'}`}>{m}</button>)}
                    </div></div>
                    {newQ.mediaType && (
                      <div className="space-y-4">
                        <div onClick={() => fileInputRef.current?.click()} className="cursor-pointer aspect-video border-4 border-dashed rounded-[40px] flex items-center justify-center bg-slate-50 hover:bg-white hover:border-blue-200 transition-all overflow-hidden relative shadow-inner">
                          {newQ.imageUrl ? <img src={newQ.imageUrl} className="h-full w-full object-contain p-12" /> : <div className="text-center"><span className="text-6xl block mb-2 opacity-20">{newQ.mediaType === 'table' ? '📊' : '📐'}</span><span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Upload Asset as {newQ.mediaType}</span></div>}
                          <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={(e) => handleImageUpload(e, 'imageUrl')} />
                        </div>
                        <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100">
                            <FormLabel>{newQ.mediaType === 'table' ? 'Table Label' : 'Figure Label'}</FormLabel>
                            <input className="w-full bg-white border border-slate-100 p-4 rounded-xl text-[11px] font-black text-slate-700 shadow-sm" value={newQ.figureLabel} onChange={e => setNewQ({ ...newQ, figureLabel: e.target.value })} placeholder="e.g. Table 1: Force distribution" />
                        </div>
                      </div>
                    )}
                  </div>

                  {newQ.type === 'mcq' && (
                    <div className="p-8 bg-emerald-50/40 rounded-[40px] border border-emerald-100">
                      <FormLabel className="text-emerald-600 mb-6">MCQ Responses</FormLabel>
                      {['A', 'B', 'C', 'D'].map((l, i) => (
                        <div key={l} className="flex items-center gap-4 mb-4 last:mb-0">
                          <button type="button" onClick={() => setNewQ({ ...newQ, answer: `Option ${l}` })} className={`w-12 h-12 rounded-xl font-black transition-all ${newQ.answer === `Option ${l}` ? 'bg-emerald-500 text-white shadow-lg scale-110' : 'bg-white text-slate-300 border border-slate-200'}`}>{l}</button>
                          <input className="flex-grow border border-slate-100 p-3.5 rounded-xl outline-none focus:border-emerald-300 bg-white shadow-sm font-bold text-sm" value={newQ.options?.[i] || ''} onChange={e => { const opts = [...(newQ.options || [])]; opts[i] = e.target.value; setNewQ({ ...newQ, options: opts }); }} placeholder={`Option ${l}`} />
                        </div>
                      ))}
                    </div>
                  )}

                  {['structure', 'calculation', 'essay'].includes(newQ.type || '') && (
                    <div className="space-y-6 pt-6 border-t border-slate-100">
                      <div className="flex justify-between items-center"><FormLabel>Sub-Parts (a, b, c...)</FormLabel><button type="button" onClick={() => setNewQ({ ...newQ, subQuestions: [...(newQ.subQuestions || []), { label: String.fromCharCode(97 + (newQ.subQuestions?.length || 0)) + ")", text: '', marks: 1 }] })} className="bg-slate-900 text-white px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg">+ Add Part</button></div>
                      <div className="space-y-4">
                        {(newQ.subQuestions || []).map((sub, i) => (
                          <div key={i} className="flex gap-4 p-6 bg-slate-50 border border-slate-100 rounded-[32px] items-start">
                            <div className="shrink-0"><FormLabel>Label</FormLabel><input className="w-12 border-2 border-white bg-white text-center font-black rounded-xl p-2.5 outline-none focus:border-blue-400" value={sub.label} onChange={e => { const s = [...(newQ.subQuestions || [])]; s[i].label = e.target.value; setNewQ({ ...newQ, subQuestions: s }); }} /></div>
                            <div className="flex-grow"><FormLabel>Part Stem</FormLabel><textarea className="w-full border-2 border-white bg-white rounded-2xl p-4 text-xs font-bold outline-none focus:border-blue-400 min-h-[60px]" value={sub.text} onChange={e => { const s = [...(newQ.subQuestions || [])]; s[i].text = e.target.value; setNewQ({ ...newQ, subQuestions: s }); }} placeholder="Enter sub-part content..." /></div>
                            <div className="shrink-0"><FormLabel>Marks</FormLabel><input type="number" className="w-14 border-2 border-white bg-white text-center font-black rounded-xl p-2.5" value={sub.marks} onChange={e => { const s = [...(newQ.subQuestions || [])]; s[i].marks = parseInt(e.target.value) || 0; setNewQ({ ...newQ, subQuestions: s }); }} /></div>
                            <button type="button" onClick={() => setNewQ({ ...newQ, subQuestions: (newQ.subQuestions || []).filter((_, idx) => idx !== i) })} className="text-slate-300 hover:text-rose-500 font-bold text-xl p-2 mt-7">&times;</button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'marking' && (
                <div className="space-y-12 animate-in fade-in slide-in-from-right-4">
                  <div className="bg-purple-50/50 p-8 rounded-[40px] border border-purple-100">
                    <div className="flex justify-between items-center mb-6"><FormLabel className="text-purple-600">Main Solution (LaTeX Enabled)</FormLabel><MarkInputControl onAddMark={m => setNewQ({ ...newQ, answer: (newQ.answer || '') + ` (${m} marks)` })} /></div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                      <textarea className="w-full border-2 border-white bg-white p-6 rounded-[32px] h-[300px] outline-none focus:border-purple-400 text-xs font-mono shadow-inner leading-relaxed" 
                        value={newQ.answer} onChange={e => setNewQ({ ...newQ, answer: e.target.value })} placeholder="Describe marking steps..." />
                      <div className="bg-white p-6 rounded-[32px] border-2 border-dashed border-slate-100 overflow-y-auto max-h-[300px] shadow-inner">
                        {newQ.answer ? <LatexRenderer text={newQ.answer} className="text-xs text-slate-700 leading-relaxed" /> : <div className="h-full flex items-center justify-center italic text-slate-300 font-bold uppercase text-[10px]">Preview Solution Text</div>}
                      </div>
                    </div>
                    
                    <div className="space-y-4 pt-6 border-t border-purple-100">
                       <FormLabel className="text-purple-400">Main Solution Sketch</FormLabel>
                       <div className="flex gap-6 items-start">
                          <div onClick={() => answerSketchRef.current?.click()} className="w-40 h-40 border-4 border-dashed border-purple-100 rounded-[28px] bg-white flex flex-col items-center justify-center cursor-pointer hover:border-purple-300 transition-all overflow-hidden shrink-0 shadow-sm">
                             {newQ.answerImageUrl ? (
                               <img src={newQ.answerImageUrl} className="h-full w-full object-contain p-2" />
                             ) : (
                               <div className="text-center"><span className="text-3xl block mb-2">🎨</span><span className="text-[8px] font-black text-purple-300 uppercase tracking-widest">Upload Solution<br/>Sketch</span></div>
                             )}
                             <input type="file" ref={answerSketchRef} className="hidden" accept="image/*" onChange={(e) => handleImageUpload(e, 'answerImageUrl')} />
                          </div>
                          <div className="flex-grow">
                             <input className="w-full border-2 border-white bg-white p-4 rounded-xl text-[10px] font-black text-purple-900 shadow-sm focus:border-purple-200 outline-none mb-4" placeholder="Solution Sketch Label" value={newQ.answerFigureLabel} onChange={e => setNewQ({...newQ, answerFigureLabel: e.target.value})} />
                             <p className="text-[9px] text-purple-400 italic leading-relaxed">This illustration will only appear on the Answer Scheme.</p>
                          </div>
                       </div>
                    </div>
                  </div>

                  {(newQ.subQuestions || []).length > 0 && (
                    <div className="space-y-8 pt-6">
                      <h4 className="text-sm font-black text-slate-800 uppercase tracking-widest pl-2 flex items-center gap-2"><span className="w-1 h-4 bg-indigo-500 rounded-full"></span>Sub-Part Solutions (LaTeX Enabled)</h4>
                      {(newQ.subQuestions || []).map((sub, i) => (
                        <div key={i} className="p-8 bg-slate-50 border border-slate-100 rounded-[40px] space-y-6">
                          <div className="flex justify-between items-center"><span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Part {sub.label} Grading Policy</span><MarkInputControl onAddMark={m => { const s = [...(newQ.subQuestions || [])]; s[i].answer = (s[i].answer || '') + ` (${m} marks)`; setNewQ({ ...newQ, subQuestions: s }); }} /></div>
                          
                          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <div>
                               <FormLabel className="text-[8px] text-indigo-400 mb-1">Editor</FormLabel>
                               <textarea className="w-full border-2 border-white bg-white rounded-[24px] p-4 text-xs font-mono outline-none focus:border-blue-400 h-40 shadow-sm" value={sub.answer || ''} onChange={e => { const s = [...(newQ.subQuestions || [])]; s[i].answer = e.target.value; setNewQ({ ...newQ, subQuestions: s }); }} placeholder={`Breakdown for ${sub.label}...`} />
                            </div>
                            <div>
                               <FormLabel className="text-[8px] text-emerald-400 mb-1">Live Preview</FormLabel>
                               <div className="w-full bg-white border-2 border-dashed border-slate-200 rounded-[24px] p-6 h-40 overflow-y-auto shadow-inner">
                                  {sub.answer ? <LatexRenderer text={sub.answer} className="text-xs text-slate-700 leading-relaxed" /> : <div className="h-full flex items-center justify-center italic text-slate-200 font-bold uppercase text-[9px]">Preview</div>}
                               </div>
                            </div>
                          </div>
                          
                          <div className="flex gap-6 items-center pt-4 border-t border-slate-100">
                             <div 
                                onClick={() => document.getElementById(`ans-sub-q-file-${i}`)?.click()}
                                className="w-24 h-24 border-2 border-dashed border-slate-200 bg-white rounded-2xl flex flex-col items-center justify-center cursor-pointer hover:border-blue-300 transition shrink-0 shadow-inner"
                             >
                                {sub.answerImageUrl ? <img src={sub.answerImageUrl} className="h-full w-full object-contain p-2" /> : <span className="text-[8px] font-black text-slate-300 uppercase">Part {sub.label}<br/>Sketch</span>}
                                <input id={`ans-sub-q-file-${i}`} type="file" className="hidden" accept="image/*" onChange={(e) => handleSubPartImage(i, e, 'answerImageUrl')} />
                             </div>
                             <div className="flex-grow">
                                <FormLabel>Part Solution Caption</FormLabel>
                                <input className="w-full bg-white border border-slate-100 p-3 rounded-xl text-[10px] font-black text-slate-600 shadow-sm" value={sub.answerFigureLabel || ''} onChange={e => { const s = [...(newQ.subQuestions || [])]; s[i].answerFigureLabel = e.target.value; setNewQ({ ...newQ, subQuestions: s }); }} placeholder="e.g. Completed Matrix Solution" />
                             </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="p-10 bg-slate-900 flex justify-center border-t border-slate-800 shrink-0">
              <button type="submit" className="w-full max-w-lg bg-blue-600 text-white font-black py-6 rounded-[32px] shadow-2xl uppercase tracking-[0.3em] text-sm hover:bg-blue-500 transition transform active:scale-95">Register Academic Item</button>
            </div>
          </form>

          <div className="lg:col-span-4 bg-white p-10 rounded-[48px] shadow-2xl border border-slate-100 flex flex-col h-[750px] sticky top-8">
            <h3 className="font-black text-[11px] text-slate-900 uppercase tracking-[0.2em] mb-8 border-b pb-6">Item Registry Feed</h3>
            <div className="space-y-5 overflow-y-auto flex-grow custom-scrollbar pr-2">
              {currentBank.slice().reverse().map(q => (
                <div key={q.id} className="p-5 border-2 border-slate-50 rounded-3xl hover:border-blue-200 transition bg-white shadow-sm group cursor-pointer">
                  <div className="flex gap-2 mb-3"><span className="bg-indigo-600 text-white px-2 py-0.5 rounded-md text-[8px] font-black uppercase">{availableCourses.find(c => c.id === q.courseId)?.code}</span><span className="text-[8px] font-black text-slate-400 uppercase truncate border-l pl-2">{getFullTopicDisplay(q)}</span></div>
                  <p className="text-[11px] text-slate-700 font-medium italic line-clamp-2 leading-relaxed opacity-80 group-hover:opacity-100">"{q.text}"</p>
                  <div className="mt-3 pt-3 border-t border-slate-50 flex justify-between items-center text-[9px] font-black text-slate-300 uppercase"><span>{q.taxonomy} / {q.marks}M</span><span className="group-hover:text-blue-500 transition-colors">Details →</span></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
