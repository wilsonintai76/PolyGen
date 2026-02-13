
import React, { useMemo, useState } from 'react';
import { Course, Department, Programme, GlobalMqf, AssessmentTaskPolicy, AssessmentDomain } from '../types';

interface CourseEditorModalProps {
  course: Course;
  onSave: (course: Course) => void;
  onCancel: () => void;
  onUpdate: (course: Course) => void;
  departments: Department[];
  programmes: Programme[];
  globalMqfs: GlobalMqf[];
}

type Tab = 'identity' | 'clos' | 'topics' | 'policies' | 'mqfs';

const TAXONOMY_OPTIONS: Record<AssessmentDomain, string[]> = {
  'Cognitive': ['C1', 'C2', 'C3', 'C4', 'C5', 'C6'],
  'Psychomotor': ['P1', 'P2', 'P3', 'P4', 'P5', 'P6', 'P7'],
  'Affective': ['A1', 'A2', 'A3', 'A4', 'A5']
};

export const CourseEditorModal: React.FC<CourseEditorModalProps> = ({ 
  course, onSave, onCancel, onUpdate, departments, programmes, globalMqfs 
}) => {
  const [activeTab, setActiveTab] = useState<Tab>('identity');

  const filteredProgrammes = useMemo(() => {
    return programmes.filter(p => p.deptId === course.deptId);
  }, [programmes, course.deptId]);

  // Determine the taxonomy caps across all policies defined in the syllabus
  // Updated: Only include the specific levels defined as caps in policies
  const cappedLevels = useMemo(() => {
    const policies = course.assessmentPolicies || [];
    const caps: Record<AssessmentDomain, string[]> = {
      'Cognitive': [],
      'Psychomotor': [],
      'Affective': []
    };

    (['Cognitive', 'Psychomotor', 'Affective'] as AssessmentDomain[]).forEach(domain => {
      const fullList = TAXONOMY_OPTIONS[domain];
      
      // Collect only the specific unique max levels defined in policies for this domain
      const uniqueCaps = Array.from(new Set(
        policies
          .map(p => p.maxTaxonomy)
          .filter(tax => fullList.includes(tax))
      )).sort((a, b) => fullList.indexOf(a) - fullList.indexOf(b));

      caps[domain] = uniqueCaps;
    });

    return caps;
  }, [course.assessmentPolicies]);

  const updateMapKey = (mapType: 'clos' | 'mqfs', oldKey: string, newKey: string) => {
    const currentMap = { ...course[mapType] };
    const value = currentMap[oldKey];
    const newMap: Record<string, string> = {};
    
    Object.keys(currentMap).forEach(k => {
      if (k === oldKey) newMap[newKey] = value;
      else newMap[k] = currentMap[k];
    });

    onUpdate({ ...course, [mapType]: newMap });
  };

  const updateMapValue = (mapType: 'clos' | 'mqfs', key: string, newValue: string) => {
    onUpdate({
      ...course,
      [mapType]: { ...course[mapType], [key]: newValue }
    });
  };

  const toggleMqfTaxonomyMapping = (mqfKey: string, taxLevel: string) => {
    const currentMappings = { ...(course.mqfMappings || {}) };
    const levels = currentMappings[mqfKey] || [];
    const nextLevels = levels.includes(taxLevel) 
      ? levels.filter(l => l !== taxLevel)
      : [...levels, taxLevel];
    
    onUpdate({
      ...course,
      mqfMappings: { ...currentMappings, [mqfKey]: nextLevels }
    });
  };

  const removeItem = (mapType: 'clos' | 'mqfs', key: string) => {
    const newMap = { ...course[mapType] };
    delete newMap[key];
    
    const newMappings = { ...(course.mqfMappings || {}) };
    delete newMappings[key];

    onUpdate({ ...course, [mapType]: newMap, mqfMappings: newMappings });
  };

  const addClo = () => {
    const tempKey = `NEW_CLO_${Date.now()}`;
    onUpdate({ ...course, clos: { ...course.clos, [tempKey]: '' } });
  };

  const addMqf = () => {
    const tempKey = `NEW_MQF_${Date.now()}`;
    onUpdate({ 
        ...course, 
        mqfs: { ...course.mqfs, [tempKey]: '' },
        mqfMappings: { ...(course.mqfMappings || {}), [tempKey]: [] }
    });
  };

  const addTopic = () => {
    const currentTopics = course.topics || [];
    onUpdate({ ...course, topics: [...currentTopics, ''] });
  };

  const updateTopic = (idx: number, val: string) => {
    const currentTopics = [...(course.topics || [])];
    currentTopics[idx] = val;
    onUpdate({ ...course, topics: currentTopics });
  };

  const removeTopic = (idx: number) => {
    const currentTopics = [...(course.topics || [])];
    currentTopics.splice(idx, 1);
    onUpdate({ ...course, topics: currentTopics });
  };

  const addPolicy = () => {
    const current = course.assessmentPolicies || [];
    const newPolicy: AssessmentTaskPolicy = {
      id: Date.now().toString(),
      name: '',
      weightage: 0,
      duration: '45 MINUTES',
      maxTaxonomy: 'C3',
      linkedTopics: [],
      linkedClos: []
    };
    onUpdate({ ...course, assessmentPolicies: [...current, newPolicy] });
  };

  const updatePolicy = (id: string, updates: Partial<AssessmentTaskPolicy>) => {
    const next = (course.assessmentPolicies || []).map(p => p.id === id ? { ...p, ...updates } : p);
    onUpdate({ ...course, assessmentPolicies: next });
  };

  const togglePolicyItem = (id: string, field: 'linkedTopics' | 'linkedClos', value: string) => {
    const p = (course.assessmentPolicies || []).find(x => x.id === id);
    if (!p) return;
    const current = [...p[field]];
    const next = current.includes(value) ? current.filter(v => v !== value) : [...current, value];
    updatePolicy(id, { [field]: next });
  };

  const handleFinalSave = () => {
    if (!course.deptId || !course.programmeId || !course.code || !course.name) {
      alert("Please ensure Department, Programme, Course Code, and Course Name are filled.");
      return;
    }
    onSave(course);
  };

  const tabClass = (t: Tab) => `flex-1 py-4 text-[11px] font-black uppercase tracking-widest transition-all border-b-4 ${
    activeTab === t ? 'text-blue-600 border-blue-600 bg-blue-50/30' : 'text-slate-400 border-transparent hover:text-slate-600 hover:bg-slate-50'
  }`;

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-300">
      <div className="bg-white rounded-[40px] shadow-2xl w-full max-w-6xl max-h-[95vh] overflow-hidden flex flex-col border border-slate-200">
        <div className="px-10 py-6 border-b flex justify-between items-center bg-slate-50 shrink-0">
          <div>
            <h3 className="text-2xl font-black text-slate-800 uppercase tracking-tight">Course Registry Editor</h3>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Registry: {course.code || 'Drafting...'}</p>
          </div>
          <button onClick={onCancel} className="w-10 h-10 rounded-full bg-slate-200 text-slate-500 hover:bg-slate-300 transition flex items-center justify-center font-bold text-2xl">&times;</button>
        </div>

        <div className="flex bg-white shrink-0 border-b">
           <button onClick={() => setActiveTab('identity')} className={tabClass('identity')}>1. Core Metadata</button>
           <button onClick={() => setActiveTab('clos')} className={tabClass('clos')}>2. Learning Outcomes</button>
           <button onClick={() => setActiveTab('topics')} className={tabClass('topics')}>3. Course Topics</button>
           <button onClick={() => setActiveTab('policies')} className={tabClass('policies')}>4. Assessment Policies</button>
           <button onClick={() => setActiveTab('mqfs')} className={tabClass('mqfs')}>5. Standards Mapping</button>
        </div>
        
        <div className="p-10 overflow-y-auto custom-scrollbar bg-white flex-grow">
           {activeTab === 'identity' && (
             <div className="space-y-10 animate-in fade-in duration-300">
               <div className="grid grid-cols-1 md:grid-cols-2 gap-8 bg-blue-50/30 p-8 rounded-[32px] border border-blue-100/50 shadow-inner">
                  <div className="space-y-2">
                    <label className="block text-[10px] font-black text-blue-500 uppercase tracking-widest ml-1">Parent Department</label>
                    <select 
                      className="w-full border-2 border-white bg-white rounded-2xl p-4 outline-none focus:border-blue-400 transition font-bold text-slate-700 shadow-sm"
                      value={course.deptId}
                      onChange={e => onUpdate({...course, deptId: e.target.value, programmeId: ''})}
                    >
                      <option value="">-- Select Department --</option>
                      {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="block text-[10px] font-black text-blue-500 uppercase tracking-widest ml-1">Target Programme</label>
                    <select 
                      className="w-full border-2 border-white bg-white rounded-2xl p-4 outline-none focus:border-blue-400 transition font-bold text-slate-700 shadow-sm disabled:opacity-50"
                      value={course.programmeId}
                      disabled={!course.deptId}
                      onChange={e => onUpdate({...course, programmeId: e.target.value})}
                    >
                      <option value="">-- Select Programme --</option>
                      {programmes.filter(p => p.deptId === course.deptId).map(p => <option key={p.id} value={p.id}>[{p.code}] {p.name}</option>)}
                    </select>
                  </div>
               </div>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-2">
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Course Code</label>
                    <input className="w-full border-2 border-slate-50 rounded-2xl p-4 outline-none focus:border-blue-400 transition font-black text-slate-700 bg-slate-50 shadow-inner" value={course.code} onChange={e => onUpdate({...course, code: e.target.value.toUpperCase()})} placeholder="e.g. DJJ10243" />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Course Name</label>
                    <input className="w-full border-2 border-slate-50 rounded-2xl p-4 outline-none focus:border-blue-400 transition font-black text-slate-700 bg-slate-50 shadow-inner" value={course.name} onChange={e => onUpdate({...course, name: e.target.value.toUpperCase()})} placeholder="e.g. WORKSHOP TECHNOLOGY" />
                  </div>
               </div>
             </div>
           )}

           {activeTab === 'clos' && (
              <div className="space-y-6 animate-in fade-in duration-300">
                <div className="flex justify-between items-center mb-4">
                   <h4 className="text-[11px] font-black text-purple-600 uppercase tracking-widest flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-purple-400"></span>
                      Course Learning Outcomes (CLOS)
                   </h4>
                   <button onClick={addClo} className="bg-purple-600 text-white font-black text-[10px] uppercase px-4 py-2 rounded-xl hover:bg-purple-700 transition shadow-lg">+ Add CLO</button>
                </div>
                <div className="space-y-4">
                  {Object.entries(course.clos).map(([key, val]) => (
                    <div key={key} className="flex gap-4 group relative items-start bg-slate-50/50 p-5 rounded-3xl border border-slate-100 transition hover:bg-white hover:shadow-lg">
                      <div className="w-32 shrink-0">
                        <input className="w-full border-2 border-white rounded-xl p-3 text-xs font-black text-slate-800 outline-none focus:border-purple-400 bg-white transition text-center uppercase shadow-sm" value={key.startsWith('NEW_CLO_') ? '' : key} placeholder="CODE" onChange={e => updateMapKey('clos', key, e.target.value)} />
                      </div>
                      <div className="flex-grow">
                        <textarea className="w-full border-2 border-white rounded-xl p-3 text-xs outline-none focus:border-purple-400 bg-white transition min-h-[80px] resize-none shadow-sm font-medium italic" value={val} onChange={e => updateMapValue('clos', key, e.target.value)} placeholder="Outcome description..." />
                      </div>
                      <button onClick={() => removeItem('clos', key)} className="w-10 h-10 bg-white text-red-400 rounded-full flex items-center justify-center shadow-md border border-red-50 hover:bg-red-500 hover:text-white transition-all transform hover:scale-110 active:scale-95">&times;</button>
                    </div>
                  ))}
                </div>
              </div>
           )}

           {activeTab === 'topics' && (
              <div className="space-y-6 animate-in fade-in duration-300">
                <div className="flex justify-between items-center mb-4">
                   <h4 className="text-[11px] font-black text-emerald-600 uppercase tracking-widest flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                      Course Syllabus Topics
                   </h4>
                   <button onClick={addTopic} className="bg-emerald-600 text-white font-black text-[10px] uppercase px-4 py-2 rounded-xl hover:bg-emerald-700 transition shadow-lg">+ Add Topic</button>
                </div>
                <div className="space-y-4">
                  {(course.topics || []).map((topic, idx) => (
                    <div key={idx} className="flex gap-4 group relative items-center bg-slate-50/50 p-4 rounded-2xl border border-slate-100 transition hover:bg-white hover:shadow-md">
                      <div className="w-16 shrink-0 flex items-center justify-center font-black text-slate-300 text-lg">T{idx + 1}.</div>
                      <div className="flex-grow">
                        <input className="w-full border-2 border-white rounded-xl p-4 text-sm font-bold text-slate-700 outline-none focus:border-emerald-400 bg-white transition shadow-sm" value={topic} onChange={e => updateTopic(idx, e.target.value)} placeholder={`Topic ${idx + 1} title`} />
                      </div>
                      <button onClick={() => removeTopic(idx)} className="w-10 h-10 bg-white text-red-400 rounded-xl flex items-center justify-center shadow-sm border border-red-50 hover:bg-red-500 hover:text-white transition-all active:scale-95">&times;</button>
                    </div>
                  ))}
                </div>
              </div>
           )}

           {activeTab === 'policies' && (
              <div className="space-y-10 animate-in fade-in duration-300">
                <div className="flex justify-between items-center">
                   <div>
                     <h4 className="text-[11px] font-black text-indigo-600 uppercase tracking-widest flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-indigo-400"></span>
                        Institutional Assessment Policies
                     </h4>
                     <p className="text-[9px] text-slate-400 font-bold uppercase mt-1">Pre-define tasks, weightages, and taxonomy ceilings</p>
                   </div>
                   <button onClick={addPolicy} className="bg-indigo-600 text-white font-black text-[10px] uppercase px-4 py-2 rounded-xl hover:bg-indigo-700 transition shadow-lg">+ Add Task Policy</button>
                </div>

                <div className="space-y-8">
                   {(course.assessmentPolicies || []).map(p => (
                     <div key={p.id} className="bg-slate-50 p-8 rounded-[32px] border border-slate-200 space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
                           <div className="space-y-1">
                              <label className="text-[9px] font-black text-slate-400 uppercase">Task Name</label>
                              <input className="w-full border-2 border-white bg-white p-3 rounded-xl font-black text-xs outline-none focus:border-indigo-400" value={p.name} onChange={e => updatePolicy(p.id, { name: e.target.value.toUpperCase() })} placeholder="e.g. QUIZ 1" />
                           </div>
                           <div className="space-y-1">
                              <label className="text-[9px] font-black text-slate-400 uppercase">Weight (%)</label>
                              <input type="number" className="w-full border-2 border-white bg-white p-3 rounded-xl font-black text-xs outline-none focus:border-indigo-400 text-center" value={p.weightage} onChange={e => updatePolicy(p.id, { weightage: parseInt(e.target.value) || 0 })} />
                           </div>
                           <div className="space-y-1">
                              <label className="text-[9px] font-black text-slate-400 uppercase">Duration</label>
                              <input className="w-full border-2 border-white bg-white p-3 rounded-xl font-black text-xs outline-none focus:border-indigo-400" value={p.duration} onChange={e => updatePolicy(p.id, { duration: e.target.value.toUpperCase() })} placeholder="e.g. 1 HOUR" />
                           </div>
                           <div className="space-y-1">
                              <label className="text-[9px] font-black text-rose-500 uppercase">Max Taxonomy</label>
                              <select className="w-full border-2 border-white bg-white p-3 rounded-xl font-black text-xs outline-none focus:border-rose-400" value={p.maxTaxonomy} onChange={e => updatePolicy(p.id, { maxTaxonomy: e.target.value })}>
                                 {Object.values(TAXONOMY_OPTIONS).flat().map(opt => <option key={opt} value={opt}>{opt}</option>)}
                              </select>
                           </div>
                           <div className="flex items-end justify-end">
                              <button onClick={() => onUpdate({ ...course, assessmentPolicies: (course.assessmentPolicies || []).filter(x => x.id !== p.id) })} className="text-[10px] font-black text-rose-500 uppercase hover:underline">Remove</button>
                           </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                           <div className="space-y-3">
                              <label className="text-[9px] font-black text-indigo-400 uppercase tracking-widest">Enforced Topics</label>
                              <div className="flex flex-wrap gap-2">
                                 {(course.topics || []).map((t, idx) => {
                                   const code = `T${idx + 1}`;
                                   const active = p.linkedTopics.includes(code);
                                   return (
                                     <button key={code} onClick={() => togglePolicyItem(p.id, 'linkedTopics', code)} className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase transition-all ${active ? 'bg-indigo-600 text-white shadow-md' : 'bg-white text-slate-400 border border-white'}`}>{code}</button>
                                   );
                                 })}
                              </div>
                           </div>
                           <div className="space-y-3">
                              <label className="text-[9px] font-black text-purple-400 uppercase tracking-widest">Enforced CLOs</label>
                              <div className="flex flex-wrap gap-2">
                                 {Object.keys(course.clos).map(clo => {
                                   const active = p.linkedClos.includes(clo);
                                   return (
                                     <button key={clo} onClick={() => togglePolicyItem(p.id, 'linkedClos', clo)} className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase transition-all ${active ? 'bg-purple-600 text-white shadow-md' : 'bg-white text-slate-400 border border-white'}`}>{clo}</button>
                                   );
                                 })}
                              </div>
                           </div>
                        </div>
                     </div>
                   ))}
                </div>
              </div>
           )}

           {activeTab === 'mqfs' && (
              <div className="space-y-6 animate-in fade-in duration-300">
                <div className="flex justify-between items-center mb-4">
                   <div>
                     <h4 className="text-[11px] font-black text-indigo-600 uppercase tracking-widest flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-indigo-400"></span>
                        MQF / Dublin Standard Mapping
                     </h4>
                     <p className="text-[8px] text-slate-400 font-bold mt-1">Authorized achieved levels only (Caps from Syllabus)</p>
                   </div>
                   <button onClick={addMqf} className="bg-indigo-600 text-white font-black text-[10px] uppercase px-4 py-2 rounded-xl hover:bg-indigo-700 transition shadow-lg">+ Add Attribute</button>
                </div>
                <div className="space-y-8">
                  {Object.entries(course.mqfs).map(([key, val]) => (
                    <div key={key} className="bg-slate-50 p-6 rounded-3xl border border-slate-200 space-y-4">
                      <div className="flex gap-4 items-start">
                        <div className="w-32 shrink-0">
                          <label className="text-[8px] font-black text-slate-400 uppercase ml-1 block mb-1">Attr Code</label>
                          <input className="w-full border-2 border-white rounded-xl p-3 text-xs font-black text-indigo-700 outline-none focus:border-indigo-400 bg-white transition text-center uppercase shadow-sm" value={key.startsWith('NEW_MQF_') ? '' : key} placeholder="CODE" onChange={e => updateMapKey('mqfs', key, e.target.value)} />
                        </div>
                        <div className="flex-grow">
                          <label className="text-[8px] font-black text-slate-400 uppercase ml-1 block mb-1">Attribute Description</label>
                          <textarea className="w-full border-2 border-white rounded-xl p-3 text-xs outline-none focus:border-indigo-400 bg-white transition min-h-[60px] resize-none shadow-sm font-medium italic" value={val} onChange={e => updateMapValue('mqfs', key, e.target.value)} placeholder="Dublin descriptor description..." />
                        </div>
                        <button onClick={() => removeItem('mqfs', key)} className="mt-6 w-10 h-10 bg-white text-red-400 rounded-full flex items-center justify-center shadow-md border border-red-50 hover:bg-red-500 hover:text-white transition-all transform hover:scale-110 active:scale-95">&times;</button>
                      </div>

                      <div className="pt-2 border-t border-slate-100">
                        <label className="text-[9px] font-black text-indigo-500 uppercase tracking-widest mb-3 block">Authorized Achieving Level (Institutional Standard)</label>
                        
                        <div className="space-y-4">
                           {(['Cognitive', 'Psychomotor', 'Affective'] as AssessmentDomain[]).map(domain => {
                              const options = cappedLevels[domain];
                              if (options.length === 0) return null;
                              return (
                                <div key={domain} className="space-y-2">
                                  <div className="text-[7px] font-black text-slate-400 uppercase tracking-widest">{domain} Domain Caps</div>
                                  <div className="flex flex-wrap gap-2">
                                    {options.map(tax => {
                                      const isMapped = (course.mqfMappings?.[key] || []).includes(tax);
                                      return (
                                        <button 
                                          key={tax} 
                                          onClick={() => toggleMqfTaxonomyMapping(key, tax)}
                                          className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase transition-all ${
                                            isMapped ? 'bg-indigo-600 text-white shadow-md ring-2 ring-indigo-200' : 'bg-white text-slate-400 border border-slate-200 hover:bg-slate-100'
                                          }`}
                                        >
                                          {tax}
                                        </button>
                                      );
                                    })}
                                  </div>
                                </div>
                              );
                           })}
                           {Object.values(cappedLevels).every(v => v.length === 0) && (
                             <p className="text-[8px] text-amber-500 italic bg-amber-50 p-2 rounded-lg border border-amber-100 flex items-center gap-2">
                               <span className="text-sm">⚠️</span> Configure Assessment Policies first to set taxonomy achievement levels.
                             </p>
                           )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
           )}
        </div>

        <div className="px-10 py-8 border-t bg-slate-50 flex gap-4 shrink-0">
           <button onClick={onCancel} className="px-8 py-4 text-slate-400 font-black uppercase text-[11px] tracking-widest hover:text-rose-500 transition">Discard Changes</button>
           <button onClick={handleFinalSave} className="flex-grow bg-slate-900 text-white font-black py-5 rounded-3xl shadow-2xl hover:bg-slate-800 transition uppercase tracking-[0.2em] text-sm flex items-center justify-center gap-3 active:scale-[0.98]">
             Finalize & Save Course Registry
           </button>
        </div>
      </div>
    </div>
  );
};
