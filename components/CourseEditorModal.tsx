
import React, { useMemo, useState } from 'react';
import { Course, Department, Programme, GlobalMqf } from '../types';

interface CourseEditorModalProps {
  course: Course;
  onSave: (course: Course) => void;
  onCancel: () => void;
  onUpdate: (course: Course) => void;
  departments: Department[];
  programmes: Programme[];
  globalMqfs: GlobalMqf[];
}

type Tab = 'identity' | 'clos' | 'mqfs' | 'topics';

export const CourseEditorModal: React.FC<CourseEditorModalProps> = ({ 
  course, onSave, onCancel, onUpdate, departments, programmes, globalMqfs 
}) => {
  const [activeTab, setActiveTab] = useState<Tab>('identity');

  const filteredProgrammes = useMemo(() => {
    return programmes.filter(p => p.deptId === course.deptId);
  }, [programmes, course.deptId]);

  const updateMapKey = (mapType: 'clos', oldKey: string, newKey: string) => {
    const currentMap = { ...course[mapType] };
    const value = currentMap[oldKey];
    const newMap: Record<string, string> = {};
    
    Object.keys(currentMap).forEach(k => {
      if (k === oldKey) newMap[newKey] = value;
      else newMap[k] = currentMap[k];
    });

    onUpdate({ ...course, [mapType]: newMap });
  };

  const updateMapValue = (mapType: 'clos', key: string, newValue: string) => {
    onUpdate({
      ...course,
      [mapType]: { ...course[mapType], [key]: newValue }
    });
  };

  const removeItem = (mapType: 'clos' | 'mqfs', key: string) => {
    const newMap = { ...course[mapType] };
    delete newMap[key];
    onUpdate({ ...course, [mapType]: newMap });
  };

  const addClo = () => {
    const tempKey = `NEW_CLO_${Date.now()}`;
    onUpdate({
      ...course,
      clos: { ...course.clos, [tempKey]: '' }
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

  const addMqfFromGlobal = (mqfCode: string) => {
    if (!mqfCode) return;
    const selected = globalMqfs.find(m => m.code === mqfCode);
    if (selected) {
      onUpdate({
        ...course,
        mqfs: { ...course.mqfs, [selected.code]: selected.description }
      });
    }
  };

  const handleFinalSave = () => {
    if (!course.deptId || !course.programmeId || !course.code || !course.name) {
      alert("Please ensure Department, Programme, Course Code, and Course Name are filled.");
      return;
    }

    const finalClos: Record<string, string> = {};
    Object.entries(course.clos).forEach(([k, v]) => {
      const cleanK = k.startsWith('NEW_CLO_') ? 'CLO' : k;
      finalClos[cleanK] = v as string;
    });

    // Clean topics (remove empty)
    const finalTopics = (course.topics || []).filter(t => t.trim() !== '');

    onSave({ ...course, clos: finalClos, topics: finalTopics });
  };

  const availableGlobalMqfs = globalMqfs.filter(m => !course.mqfs[m.code]);

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

        {/* Tab Switcher */}
        <div className="flex bg-white shrink-0 border-b">
           <button onClick={() => setActiveTab('identity')} className={tabClass('identity')}>1. Core Metadata</button>
           <button onClick={() => setActiveTab('clos')} className={tabClass('clos')}>2. Learning Outcomes</button>
           <button onClick={() => setActiveTab('mqfs')} className={tabClass('mqfs')}>3. Standards/MQF</button>
           <button onClick={() => setActiveTab('topics')} className={tabClass('topics')}>4. Course Topics</button>
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
                      {filteredProgrammes.map(p => <option key={p.id} value={p.id}>[{p.code}] {p.name}</option>)}
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
                        <input 
                          className="w-full border-2 border-white rounded-xl p-3 text-xs font-black text-slate-800 outline-none focus:border-purple-400 bg-white transition text-center uppercase shadow-sm" 
                          value={key.startsWith('NEW_CLO_') ? '' : key} 
                          placeholder="CODE"
                          onChange={e => updateMapKey('clos', key, e.target.value)} 
                        />
                      </div>
                      <div className="flex-grow">
                        <textarea 
                          className="w-full border-2 border-white rounded-xl p-3 text-xs outline-none focus:border-purple-400 bg-white transition min-h-[80px] resize-none shadow-sm font-medium italic" 
                          value={val} 
                          onChange={e => updateMapValue('clos', key, e.target.value)} 
                          placeholder="Provide the specific measurable outcome for students..." 
                        />
                      </div>
                      <button 
                        onClick={() => removeItem('clos', key)}
                        className="w-10 h-10 bg-white text-red-400 rounded-full flex items-center justify-center shadow-md border border-red-50 hover:bg-red-500 hover:text-white transition-all transform hover:scale-110 active:scale-95"
                      >&times;</button>
                    </div>
                  ))}
                  {Object.keys(course.clos).length === 0 && (
                    <div className="py-20 text-center bg-slate-50 rounded-3xl border-2 border-dashed border-slate-100 flex flex-col items-center">
                       <span className="text-4xl mb-3">📝</span>
                       <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">No learning outcomes defined</p>
                    </div>
                  )}
                </div>
              </div>
           )}

           {activeTab === 'mqfs' && (
              <div className="space-y-6 animate-in fade-in duration-300">
                <div className="flex justify-between items-center mb-4">
                   <h4 className="text-[11px] font-black text-indigo-600 uppercase tracking-widest flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-indigo-400"></span>
                      Standards & Attributes (MQF/DA)
                   </h4>
                   <div className="flex items-center gap-3">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">Link from Global Pool:</label>
                      <select 
                        className="bg-indigo-600 text-white border-none rounded-xl text-[10px] font-black uppercase px-4 py-2 outline-none hover:bg-indigo-700 transition shadow-lg"
                        onChange={e => {
                          addMqfFromGlobal(e.target.value);
                          e.target.value = '';
                        }}
                        value=""
                      >
                        <option value="">+ SELECT STANDARD</option>
                        {availableGlobalMqfs.map(m => (
                          <option key={m.id} value={m.code}>{m.code} - {m.description.substring(0, 50)}...</option>
                        ))}
                      </select>
                   </div>
                </div>
                <div className="space-y-4">
                  {Object.entries(course.mqfs).map(([key, val]) => (
                    <div key={key} className="flex gap-4 group relative items-start bg-slate-50/50 p-5 rounded-3xl border border-slate-100 hover:bg-white hover:shadow-lg transition">
                      <div className="w-32 shrink-0">
                        <div className="w-full border-2 border-white rounded-xl p-3 text-xs font-black text-slate-800 bg-white transition text-center uppercase shadow-sm">
                          {key}
                        </div>
                      </div>
                      <div className="flex-grow">
                        <div className="w-full border-2 border-white rounded-xl p-3 text-[11px] bg-white transition min-h-[80px] shadow-sm font-medium italic text-slate-500 leading-relaxed">
                          {val}
                        </div>
                      </div>
                      <button 
                        onClick={() => removeItem('mqfs', key)}
                        className="w-10 h-10 bg-white text-red-400 rounded-full flex items-center justify-center shadow-md border border-red-50 hover:bg-red-500 hover:text-white transition-all transform hover:scale-110 active:scale-95"
                      >&times;</button>
                    </div>
                  ))}
                  {Object.keys(course.mqfs).length === 0 && (
                    <div className="py-20 text-center bg-slate-50 rounded-3xl border-2 border-dashed border-slate-100 flex flex-col items-center">
                       <span className="text-4xl mb-3">🧬</span>
                       <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">No standards linked yet</p>
                    </div>
                  )}
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
                      <div className="w-16 shrink-0 flex items-center justify-center font-black text-slate-300 text-lg">
                        {idx + 1}.
                      </div>
                      <div className="flex-grow">
                        <input 
                          className="w-full border-2 border-white rounded-xl p-4 text-sm font-bold text-slate-700 outline-none focus:border-emerald-400 bg-white transition shadow-sm" 
                          value={topic} 
                          onChange={e => updateTopic(idx, e.target.value)} 
                          placeholder={`Topic/Chapter ${idx + 1} title (e.g. 1.0 Basic Measurement)`}
                        />
                      </div>
                      <button 
                        onClick={() => removeTopic(idx)}
                        className="w-10 h-10 bg-white text-red-400 rounded-xl flex items-center justify-center shadow-sm border border-red-50 hover:bg-red-500 hover:text-white transition-all active:scale-95"
                      >&times;</button>
                    </div>
                  ))}
                  {(!course.topics || course.topics.length === 0) && (
                    <div className="py-20 text-center bg-slate-50 rounded-3xl border-2 border-dashed border-slate-100 flex flex-col items-center">
                       <span className="text-4xl mb-3">📂</span>
                       <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">No syllabus topics registered</p>
                    </div>
                  )}
                </div>
                {course.topics && course.topics.length > 0 && (
                   <p className="text-[10px] text-slate-400 font-bold italic text-center uppercase tracking-tighter">These topics will appear as a dropdown selection when creating assessment papers.</p>
                )}
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
