
import React, { useMemo, useState } from 'react';
import { Course, Department, Programme, AssessmentTaskPolicy, LearningDomain, Taxonomy, DublinAccord, Topic, Construct } from '../types';
import { generateTopicConstructs } from '../services/aiService';
import { BookOpen, ChevronDown, ChevronUp, Sparkles, Trash2, Plus, Loader2, Check, XCircle, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface CourseEditorModalProps {
  course: Course;
  onSave: (course: Course) => void;
  onIntermediateSave?: (course: Course) => Promise<void>;
  onCancel: () => void;
  onUpdate: (course: Course) => void;
  departments: Department[];
  programmes: Programme[];
  dublinAccords: DublinAccord[];
  learningDomains: LearningDomain[];
  taxonomies: Taxonomy[];
}

type Tab = 'identity' | 'clos' | 'syllabus' | 'policies' | 'da';

export const CourseEditorModal: React.FC<CourseEditorModalProps> = ({ 
  course, onSave, onCancel, onUpdate, onIntermediateSave, departments, programmes, learningDomains, taxonomies, dublinAccords 
}) => {
  const isNewCourse = useMemo(() => course.id.toString().includes('local'), [course.id]);
  const TABS = useMemo(() => {
    const base: Tab[] = ['clos', 'syllabus', 'policies', 'da'];
    return isNewCourse ? ['identity' as Tab, ...base] : base;
  }, [isNewCourse]);

  const [activeTab, setActiveTab] = useState<Tab>(TABS[0]);
  const [isSaving, setIsSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [isError, setIsError] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  
  const TAB_LABELS: Record<Tab, string> = {
    identity: 'Core Metadata',
    clos: 'Learning Outcomes',
    syllabus: 'Syllabus & Topics',
    policies: 'Assessment Policies',
    da: 'Standards Mapping'
  };

  const currentIdx = TABS.indexOf(activeTab);

  const handleNext = async () => {
    if (currentIdx < TABS.length - 1) {
      if (onIntermediateSave) {
        setIsSaving(true);
        setIsError(false);
        try {
          await onIntermediateSave(course);
          setIsSaved(true);
          // Wait a bit to show the "Saved" state
          await new Promise(resolve => setTimeout(resolve, 800));
          setIsSaved(false);
        } catch (e) {
          console.error("Intermediate save failed", e);
          setIsError(true);
          setErrorMessage(e instanceof Error ? e.message : "Save failed");
          // Show error for 8 seconds to ensure user sees it
          setTimeout(() => {
            setIsError(false);
            setErrorMessage(null);
          }, 8000);
          return;
        } finally {
          setIsSaving(false);
        }
      }
      setActiveTab(TABS[currentIdx + 1]);
    }
  };

  const handleBack = () => {
    if (currentIdx > 0) setActiveTab(TABS[currentIdx - 1]);
  };

  const taxonomyOptions = useMemo(() => {
    const options: Record<string, string[]> = {};
    learningDomains.forEach(domain => {
      options[domain.name] = taxonomies
        .filter(t => t.domain_id === domain.id)
        .map(t => t.level)
        .sort();
    });
    return options;
  }, [learningDomains, taxonomies]);



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

  const toggleDaTaskMapping = (policyId: string, daCode: string) => {
    const currentMappings = { ...(course.daMappings || {}) };
    const daList = currentMappings[policyId] || [];
    const isAdding = !daList.includes(daCode);
    
    const nextDaList = isAdding 
      ? [...daList, daCode]
      : daList.filter(c => c !== daCode);
    
    const nextMappings = { ...currentMappings, [policyId]: nextDaList };
    
    // Update the flat da dictionary for definitions
    const nextDaDefs = { ...(course.da || {}) };
    if (isAdding) {
      const allStandards = [...(dublinAccords || [])];
      const standard = allStandards.find(s => s.code === daCode);
      if (standard) {
        nextDaDefs[daCode] = standard.description;
      }
    } else {
      // Check if still used elsewhere
      const stillUsed = Object.values(nextMappings).some(codes => codes.includes(daCode));
      if (!stillUsed) {
        delete nextDaDefs[daCode];
      }
    }

    onUpdate({
      ...course,
      daMappings: nextMappings,
      da: nextDaDefs
    });
  };

  const removeItem = (mapType: 'clos', key: string) => {
    const newMap = { ...course[mapType] };
    delete newMap[key];
    
    onUpdate({ ...course, [mapType]: newMap });
  };

  const addClo = () => {
    const existing = Object.keys(course.clos || {});
    const nextNum = existing.length + 1;
    const newKey = `CLO ${nextNum}`;
    onUpdate({ ...course, clos: { ...(course.clos || {}), [newKey]: '' } });
  };

  const [expandedTopicIdx, setExpandedTopicIdx] = useState<number | null>(null);
  const [isGenerating, setIsGenerating] = useState<string | null>(null);

  const addTopic = () => {
    const currentTopics = course.topics || [];
    const newTopic: Topic = {
      id: `local-${crypto.randomUUID()}`,
      course_id: course.id,
      code: `T${currentTopics.length + 1}`,
      name: '',
      syllabus: '',
      constructs: []
    };
    onUpdate({ ...course, topics: [...currentTopics, newTopic] });
    setExpandedTopicIdx(currentTopics.length);
  };

  const updateTopic = (idx: number, updates: Partial<Topic>) => {
    const currentTopics = [...(course.topics || [])];
    currentTopics[idx] = { ...currentTopics[idx], ...updates };
    onUpdate({ ...course, topics: currentTopics });
  };

  const removeTopic = (idx: number) => {
    const currentTopics = [...(course.topics || [])];
    currentTopics.splice(idx, 1);
    // Re-index codes
    const reindexed = currentTopics.map((t, i) => ({ ...t, code: `T${i + 1}` }));
    onUpdate({ ...course, topics: reindexed });
    if (expandedTopicIdx === idx) setExpandedTopicIdx(null);
    else if (expandedTopicIdx !== null && expandedTopicIdx > idx) setExpandedTopicIdx(expandedTopicIdx - 1);
  };

  const handleGenerateConstructs = async (idx: number) => {
    const topic = (course.topics || [])[idx];
    if (!topic || !topic.syllabus) return;

    setIsGenerating(topic.id);
    try {
      const generated = await generateTopicConstructs({
        topicTitle: topic.name,
        topicSyllabus: topic.syllabus,
        courseClos: Object.values(course.clos || {})
      });

      const newConstructs: Construct[] = generated.map(g => ({
        id: `local-${crypto.randomUUID()}`,
        topic_id: topic.id,
        code: g.code,
        description: g.description
      }));

      updateTopic(idx, { constructs: [...(topic.constructs || []), ...newConstructs] });
    } catch (error) {
      console.error("Failed to generate constructs:", error);
    } finally {
      setIsGenerating(null);
    }
  };

  const addPolicy = () => {
    const current = course.assessmentPolicies || [];
    const newPolicy: AssessmentTaskPolicy = {
      id: crypto.randomUUID(),
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

  const handleFinalSave = async () => {
    setIsSaving(true);
    setIsError(false);
    try {
      await onSave(course);
      setIsSaved(true);
      await new Promise(resolve => setTimeout(resolve, 800));
      setIsSaved(false);
    } catch (e) {
      console.error("Final save failed", e);
      setIsError(true);
      setErrorMessage(e instanceof Error ? e.message : "Save failed");
      // Show error for 8 seconds
      setTimeout(() => {
        setIsError(false);
        setErrorMessage(null);
      }, 8000);
    } finally {
      setIsSaving(false);
    }
  };

  const tabClass = (t: Tab) => `flex-1 py-4 text-[11px] font-black uppercase tracking-widest transition-all border-b-4 ${
    activeTab === t ? 'text-blue-600 border-blue-600 bg-blue-50/30' : 'text-slate-400 border-transparent hover:text-slate-600 hover:bg-slate-50'
  }`;

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-300">
      <div className="bg-white rounded-[40px] shadow-2xl w-full max-w-6xl max-h-[95vh] overflow-hidden flex flex-col border border-slate-200">
        <div className="px-10 py-6 border-b flex justify-between items-center bg-slate-50 shrink-0">
          <div>
            <h3 className="text-2xl font-black text-slate-800 uppercase tracking-tight">
              {isNewCourse ? 'Course Registry Editor' : course.name}
            </h3>
            <div className="flex items-center gap-3 mt-1">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Registry: {course.code || 'Drafting...'}</p>
              {!isNewCourse && (
                <>
                  <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                  <p className="text-[10px] font-bold text-blue-500 uppercase tracking-widest">
                    {departments.find(d => d.id === course.deptId)?.name}
                  </p>
                  <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                  <p className="text-[10px] font-bold text-indigo-500 uppercase tracking-widest">
                    {programmes.find(p => p.id === course.programmeId)?.name}
                  </p>
                </>
              )}
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={onCancel} className="w-10 h-10 rounded-full text-slate-500 hover:bg-slate-200 transition">
            <X className="w-5 h-5" />
          </Button>
        </div>

        <div className="flex bg-white shrink-0 border-b">
           {TABS.map((tab, idx) => (
             <Button 
               variant="ghost"
               key={tab}
               onClick={() => setActiveTab(tab)} 
               className={tabClass(tab) + " rounded-none h-auto"}
             >
               {idx + 1}. {TAB_LABELS[tab]}
             </Button>
           ))}
        </div>
        
        <div className="p-10 overflow-y-auto custom-scrollbar bg-white flex-grow">
           {activeTab === 'identity' && (
             <div className="space-y-10 animate-in fade-in duration-300">
               <div className="grid grid-cols-1 md:grid-cols-2 gap-8 bg-blue-50/30 p-8 rounded-[32px] border border-blue-100/50 shadow-inner">
                  <div className="space-y-2">
                    <label className="block text-[10px] font-black text-blue-500 uppercase tracking-widest ml-1">Parent Department</label>
                    <select 
                      className="w-full border-2 border-white bg-white rounded-2xl p-4 outline-none focus:border-blue-400 transition font-bold text-slate-700 shadow-sm disabled:bg-slate-50 disabled:text-slate-400 disabled:cursor-not-allowed"
                      value={course.deptId || ''}
                      disabled={!isNewCourse}
                      onChange={e => onUpdate({...course, deptId: e.target.value, programmeId: ''})}
                    >
                      <option value="">-- Select Department --</option>
                      {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="block text-[10px] font-black text-blue-500 uppercase tracking-widest ml-1">Target Programme</label>
                    <select 
                      className="w-full border-2 border-white bg-white rounded-2xl p-4 outline-none focus:border-blue-400 transition font-bold text-slate-700 shadow-sm disabled:bg-slate-50 disabled:text-slate-400 disabled:cursor-not-allowed"
                      value={course.programmeId || ''}
                      disabled={!isNewCourse || !course.deptId}
                      onChange={e => onUpdate({...course, programmeId: e.target.value})}
                    >
                      <option value="">-- Select Programme --</option>
                      {programmes.filter(p => p.deptId === course.deptId).map(p => <option key={p.id} value={p.id}>[{p.code}] {p.name}</option>)}
                    </select>
                  </div>
               </div>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-2">
                    <Label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Course Code</Label>
                    <Input className="h-12 border-2 border-slate-50 rounded-2xl px-4 font-black text-slate-700 bg-slate-50 shadow-inner focus-visible:ring-blue-400 focus-visible:border-blue-400 transition" value={course.code || ''} onChange={e => onUpdate({...course, code: e.target.value.toUpperCase()})} placeholder="e.g. DJJ10243" />
                  </div>
                  <div className="space-y-2">
                    <Label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Course Name</Label>
                    <Input className="h-12 border-2 border-slate-50 rounded-2xl px-4 font-black text-slate-700 bg-slate-50 shadow-inner focus-visible:ring-blue-400 focus-visible:border-blue-400 transition" value={course.name || ''} onChange={e => onUpdate({...course, name: e.target.value.toUpperCase()})} placeholder="e.g. WORKSHOP TECHNOLOGY" />
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
                   <Button onClick={addClo} className="bg-purple-600 text-white font-black text-[10px] uppercase px-4 py-2 rounded-xl hover:bg-purple-700 transition shadow-lg h-8">+ Add CLO</Button>
                </div>
                 <div className="overflow-hidden rounded-2xl border border-slate-200 shadow-sm">
                   <table className="w-full text-left border-collapse">
                     <thead className="bg-slate-50 border-b border-slate-200">
                       <tr>
                         <th className="px-4 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest w-32">Code</th>
                         <th className="px-4 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">Description</th>
                         <th className="px-4 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest w-16 text-center">Action</th>
                       </tr>
                     </thead>
                     <tbody className="divide-y divide-slate-100 bg-white">
                       {Object.entries(course.clos || {}).map(([key, val]) => (
                         <tr key={key} className="group hover:bg-slate-50/50 transition-colors">
                           <td className="px-4 py-2 align-top">
                             <Input className="h-10 border border-transparent hover:border-slate-200 focus-visible:ring-purple-400 rounded-lg px-2 text-xs font-black text-slate-800 bg-transparent transition text-center uppercase" defaultValue={key} placeholder="CODE" onBlur={e => updateMapKey('clos', key, e.target.value)} />
                           </td>
                           <td className="px-4 py-2 align-top">
                             <textarea 
                               className="w-full border border-transparent hover:border-slate-200 focus:border-purple-400 rounded-lg p-2 text-xs outline-none bg-transparent transition resize-none font-medium italic leading-relaxed overflow-hidden" 
                               value={val || ''} 
                               onChange={e => {
                                 updateMapValue('clos', key, e.target.value);
                                 e.target.style.height = 'auto';
                                 e.target.style.height = e.target.scrollHeight + 'px';
                               }} 
                               placeholder="Outcome description..." 
                               rows={1}
                               ref={(el) => {
                                 if (el) {
                                   el.style.height = 'auto';
                                   el.style.height = el.scrollHeight + 'px';
                                 }
                               }}
                             />
                           </td>
                           <td className="px-4 py-2 align-top text-center">
                             <Button variant="ghost" size="icon" onClick={() => removeItem('clos', key)} className="w-8 h-8 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors text-lg">
                               <X className="h-4 w-4" />
                             </Button>
                           </td>
                         </tr>
                       ))}
                     </tbody>
                   </table>
                   {Object.keys(course.clos || {}).length === 0 && (
                     <div className="text-center py-10 bg-slate-50">
                       <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">No CLOs defined yet. Click &quot;+ Add CLO&quot; to begin.</p>
                     </div>
                   )}
                 </div>
              </div>
           )}

           {activeTab === 'syllabus' && (
              <div className="space-y-10 animate-in fade-in duration-300">
                <div className="flex justify-between items-center">
                  <div>
                    <h4 className="text-[11px] font-black text-emerald-600 uppercase tracking-widest flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                        Course Syllabus & Topics
                    </h4>
                    <p className="text-[9px] text-slate-400 font-bold uppercase mt-1">Define topics, syllabus content, and generate assessment constructs</p>
                  </div>
                  <Button onClick={addTopic} className="bg-emerald-600 text-white font-black text-[10px] uppercase px-4 py-2 rounded-xl hover:bg-emerald-700 transition shadow-lg flex items-center gap-2 h-8">
                    <Plus size={14} /> Add Topic
                  </Button>
                </div>

                <div className="space-y-6">
                  {(course.topics || []).map((topic, idx) => (
                    <div key={topic.id} className="bg-white rounded-[32px] border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                      <div 
                        className="p-6 flex items-center justify-between cursor-pointer hover:bg-slate-50/50 transition-colors"
                        onClick={() => setExpandedTopicIdx(expandedTopicIdx === idx ? null : idx)}
                      >
                        <div className="flex items-center gap-6">
                          <div className="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-600 font-black text-sm">
                            {topic.code}
                          </div>
                          <div>
                            <Input 
                              className="h-8 text-sm font-black text-slate-700 uppercase bg-transparent border-b-2 border-transparent focus-visible:ring-0 focus-visible:border-emerald-400 px-1 rounded-none shadow-none"
                              value={topic.name}
                              onChange={e => {
                                e.stopPropagation();
                                updateTopic(idx, { name: e.target.value.toUpperCase() });
                              }}
                              onClick={e => e.stopPropagation()}
                              placeholder="TOPIC TITLE"
                            />
                            <p className="text-[9px] text-slate-400 font-bold uppercase mt-1">
                              {topic.constructs?.length || 0} Constructs Generated
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <Button 
                            variant="ghost"
                            size="icon"
                            onClick={(e) => {
                              e.stopPropagation();
                              removeTopic(idx);
                            }}
                            className="p-2 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-colors h-auto w-auto"
                          >
                            <Trash2 size={18} />
                          </Button>
                          <div className="text-slate-300">
                            {expandedTopicIdx === idx ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                          </div>
                        </div>
                      </div>

                      {expandedTopicIdx === idx && (
                        <div className="p-8 border-t border-slate-100 bg-slate-50/30 space-y-8 animate-in slide-in-from-top-2 duration-300">
                          <div className="space-y-3">
                            <div className="flex justify-between items-center">
                              <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Topic Syllabus Content</label>
                              <span className="text-[8px] text-slate-300 font-bold uppercase">Paste relevant syllabus text for this topic</span>
                            </div>
                            <textarea 
                              className="w-full h-40 border-2 border-white bg-white rounded-2xl p-4 outline-none focus:border-emerald-400 transition font-medium text-slate-700 shadow-sm resize-none text-sm"
                              value={topic.syllabus || ''}
                              onChange={e => updateTopic(idx, { syllabus: e.target.value })}
                              placeholder="e.g. 1.1 Introduction to Hand Tools, 1.2 Safety Procedures..."
                            />
                          </div>

                          <div className="space-y-4">
                            <div className="flex justify-between items-center">
                              <div>
                                <label className="text-[9px] font-black text-indigo-400 uppercase tracking-widest">Assessment Constructs</label>
                                <p className="text-[8px] text-slate-400 font-bold uppercase mt-0.5">Skills and knowledge to be measured</p>
                              </div>
                              <Button 
                                onClick={() => handleGenerateConstructs(idx)}
                                disabled={!topic.syllabus || isGenerating === topic.id}
                                className={`flex items-center gap-2 px-4 py-2 rounded-xl font-black text-[10px] uppercase transition-all h-8 ${
                                  !topic.syllabus || isGenerating === topic.id
                                    ? 'bg-slate-100 text-slate-300 cursor-not-allowed'
                                    : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg'
                                }`}
                              >
                                {isGenerating === topic.id ? (
                                  <>
                                    <Loader2 size={14} className="animate-spin" /> Generating...
                                  </>
                                ) : (
                                  <>
                                    <Sparkles size={14} /> Generate with AI
                                  </>
                                )}
                              </Button>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              {(topic.constructs || []).map((c, cIdx) => (
                                <div key={c.id} className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex items-start gap-3 group">
                                  <div className="flex flex-col gap-1">
                                    <Input 
                                      className="w-12 h-6 px-1 py-0.5 bg-indigo-50 text-indigo-600 rounded-lg text-[9px] font-black border border-transparent focus-visible:ring-indigo-300 text-center"
                                      value={c.code}
                                      onChange={e => {
                                        const next = [...(topic.constructs || [])];
                                        next[cIdx] = { ...next[cIdx], code: e.target.value.toUpperCase() };
                                        updateTopic(idx, { constructs: next });
                                      }}
                                    />
                                  </div>
                                  <div className="flex-1">
                                    <textarea 
                                      className="w-full bg-transparent border-none outline-none text-xs font-bold text-slate-600 resize-none p-0"
                                      value={c.description}
                                      rows={2}
                                      onChange={e => {
                                        const next = [...(topic.constructs || [])];
                                        next[cIdx] = { ...next[cIdx], description: e.target.value };
                                        updateTopic(idx, { constructs: next });
                                      }}
                                    />
                                  </div>
                                  <Button 
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => {
                                      const next = [...(topic.constructs || [])];
                                      next.splice(cIdx, 1);
                                      updateTopic(idx, { constructs: next });
                                    }}
                                    className="opacity-0 group-hover:opacity-100 text-slate-300 hover:text-rose-500 transition-all h-auto w-auto p-1"
                                  >
                                    <Trash2 size={14} />
                                  </Button>
                                </div>
                              ))}
                              <Button 
                                variant="outline"
                                onClick={() => {
                                  const next = [...(topic.constructs || [])];
                                  const lastCode = next.length > 0 ? next[next.length - 1].code : `${topic.code}.0`;
                                  const base = lastCode.split('.')[0];
                                  const num = parseInt(lastCode.split('.')[1] || '0') + 1;
                                  const newCode = `${base}.${num}`;
                                  
                                  next.push({
                                    id: `local-${Date.now()}`,
                                    topic_id: topic.id,
                                    code: newCode,
                                    description: ''
                                  });
                                  updateTopic(idx, { constructs: next });
                                }}
                                className="border-2 border-dashed border-slate-100 rounded-2xl p-4 flex items-center justify-center gap-2 text-slate-400 hover:text-indigo-600 hover:border-indigo-200 hover:bg-indigo-50/30 transition-all group h-auto"
                              >
                                <Plus size={14} className="group-hover:scale-110 transition-transform" />
                                <span className="text-[9px] font-black uppercase">Add Construct</span>
                              </Button>
                              {(!topic.constructs || topic.constructs.length === 0) && (
                                <div className="col-span-2 py-8 border-2 border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center text-slate-400">
                                  <Sparkles size={24} className="mb-2 opacity-20" />
                                  <p className="text-[9px] font-black uppercase">No constructs yet. Use AI to generate them from syllabus.</p>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}

                  {(!course.topics || course.topics.length === 0) && (
                    <div className="text-center py-20 bg-slate-50 rounded-[40px] border-2 border-dashed border-slate-200">
                      <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
                        <BookOpen size={24} className="text-slate-300" />
                      </div>
                      <h5 className="text-xs font-black text-slate-600 uppercase tracking-widest">No Topics Defined</h5>
                      <p className="text-[9px] text-slate-400 font-bold uppercase mt-1">Add your first topic to start building the course syllabus</p>
                      <Button onClick={addTopic} className="mt-6 bg-emerald-600 text-white font-black text-[10px] uppercase px-6 py-6 rounded-xl hover:bg-emerald-700 transition shadow-lg">
                        <Plus className="w-4 h-4 mr-2" /> Add First Topic
                      </Button>
                    </div>
                  )}
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
                   <Button onClick={addPolicy} className="bg-indigo-600 text-white font-black text-[10px] uppercase px-4 py-2 rounded-xl hover:bg-indigo-700 transition shadow-lg h-8">+ Add Task Policy</Button>
                </div>

                <div className="space-y-8">
                   {(course.assessmentPolicies || []).map(p => (
                     <div key={p.id} className="bg-slate-50 p-8 rounded-[32px] border border-slate-200 space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
                           <div className="space-y-1">
                              <Label className="text-[9px] font-black text-slate-400 uppercase">Task Name</Label>
                              <Input className="h-10 border-2 border-white bg-white px-3 rounded-xl font-black text-xs focus-visible:ring-indigo-400" value={p.name || ''} onChange={e => updatePolicy(p.id, { name: e.target.value.toUpperCase() })} placeholder="e.g. QUIZ 1" />
                           </div>
                           <div className="space-y-1">
                              <Label className="text-[9px] font-black text-slate-400 uppercase">Weight (%)</Label>
                              <Input type="number" className="h-10 border-2 border-white bg-white px-3 rounded-xl font-black text-xs focus-visible:ring-indigo-400 text-center" value={p.weightage ?? 0} onChange={e => updatePolicy(p.id, { weightage: parseInt(e.target.value) || 0 })} />
                           </div>
                           <div className="space-y-1">
                              <Label className="text-[9px] font-black text-slate-400 uppercase">Duration</Label>
                              <Input className="h-10 border-2 border-white bg-white px-3 rounded-xl font-black text-xs focus-visible:ring-indigo-400" value={p.duration || ''} onChange={e => updatePolicy(p.id, { duration: e.target.value.toUpperCase() })} placeholder="e.g. 1 HOUR" />
                           </div>
                           <div className="space-y-1">
                              <Label className="text-[9px] font-black text-rose-500 uppercase">Max Taxonomy</Label>
                              <Input 
                                list={`taxonomy-options-${p.id}`}
                                className="h-10 border-2 border-white bg-white px-3 rounded-xl font-black text-xs focus-visible:ring-rose-400" 
                                value={p.maxTaxonomy || ''} 
                                onChange={e => updatePolicy(p.id, { maxTaxonomy: e.target.value.toUpperCase() })} 
                                placeholder="Select or type..."
                              />
                              <datalist id={`taxonomy-options-${p.id}`}>
                                 {Object.values(taxonomyOptions).flat().map(opt => <option key={opt} value={opt} />)}
                              </datalist>
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
                                 {(course.clos && Object.keys(course.clos).map(clo => {
                                   const active = p.linkedClos.includes(clo);
                                   return (
                                     <button key={clo} onClick={() => togglePolicyItem(p.id, 'linkedClos', clo)} className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase transition-all ${active ? 'bg-purple-600 text-white shadow-md' : 'bg-white text-slate-400 border border-white'}`}>{clo}</button>
                                   );
                                 })) || <span className="text-[8px] text-slate-300 uppercase italic">No CLOs defined</span>}
                              </div>
                           </div>
                        </div>
                     </div>
                   ))}
                </div>
              </div>
           )}

           {activeTab === 'da' && (
              <div className="space-y-6 animate-in fade-in duration-300">
                <div className="flex justify-between items-center mb-4">
                   <div>
                     <h4 className="text-[11px] font-black text-indigo-600 uppercase tracking-widest flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-indigo-400"></span>
                        Dublin Accord Standard Mapping
                     </h4>
                     <p className="text-[8px] text-slate-400 font-bold mt-1">Map Dublin Accord Registry standards to Assessment Tasks</p>
                   </div>
                </div>
                 <div className="space-y-8">
                  {(course.assessmentPolicies || []).map(policy => (
                    <div key={policy.id} className="bg-slate-50 p-6 rounded-3xl border border-slate-200 space-y-4">
                      <div className="flex gap-4 items-start">
                        <div className="w-full">
                          <label className="text-[10px] font-black text-slate-600 uppercase ml-1 block mb-3">{policy.name || 'Unnamed Task'}</label>
                          <div className="flex flex-wrap gap-2">
                            {dublinAccords.map(da => {
                              const isMapped = (course.daMappings?.[policy.id] || []).includes(da.code);
                              return (
                                <button 
                                  key={da.code} 
                                  onClick={() => toggleDaTaskMapping(policy.id, da.code)}
                                  title={da.description}
                                  className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase transition-all ${
                                    isMapped ? 'bg-rose-600 text-white shadow-md ring-2 ring-rose-200' : 'bg-white text-slate-400 border border-slate-200 hover:bg-slate-100'
                                  }`}
                                >
                                  {da.code}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                  {(!course.assessmentPolicies || course.assessmentPolicies.length === 0) && (
                    <div className="text-center py-10 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200">
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">No Assessment Policies defined yet. Define tasks first.</p>
                    </div>
                  )}
                 </div>
              </div>
           )}


        </div>

        <div className="px-10 py-8 border-t bg-slate-50 flex justify-between items-center shrink-0">
            <div className="flex gap-4">
              <Button variant="ghost" onClick={onCancel} className="px-6 py-6 text-slate-400 font-black uppercase text-[10px] tracking-widest hover:text-rose-500 hover:bg-rose-50 transition rounded-2xl">Discard Changes</Button>
              {currentIdx > 0 && (
                <Button variant="outline" onClick={handleBack} className="px-8 py-6 bg-white border-2 border-slate-200 text-slate-600 font-black rounded-2xl uppercase text-[10px] tracking-widest hover:bg-slate-50 transition">
                  &larr; Previous Step
                </Button>
              )}
            </div>
            
            <div className="flex flex-col items-end gap-2">
              <div className="flex gap-4">
                {currentIdx < TABS.length - 1 ? (
                  <Button 
                    onClick={handleNext} 
                    disabled={isSaving || isSaved}
                    className={`px-12 py-6 text-white font-black rounded-2xl uppercase text-[10px] tracking-widest transition shadow-lg flex items-center gap-3 ${
                      isError ? 'bg-rose-600 hover:bg-rose-700 animate-shake' : 'bg-blue-600 hover:bg-blue-700'
                    } ${isSaving || isSaved ? 'opacity-70 cursor-not-allowed' : ''}`}
                  >
                    {isSaving ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Saving...
                      </>
                    ) : isSaved ? (
                      <>
                        <Check className="w-4 h-4" />
                        Saved!
                      </>
                    ) : isError ? (
                      <>
                        <XCircle className="w-4 h-4" />
                        Failed!
                      </>
                    ) : (
                      <>Save & Next Step &rarr;</>
                    )}
                  </Button>
                ) : (
                  <Button 
                    onClick={handleFinalSave} 
                    disabled={isSaving || isSaved}
                    className={`px-12 py-6 text-white font-black rounded-2xl shadow-2xl transition uppercase tracking-[0.2em] text-[10px] flex items-center gap-3 active:scale-[0.98] ${
                      isError ? 'bg-rose-600 hover:bg-rose-700 animate-shake' : 'bg-slate-900 hover:bg-slate-800'
                    } ${isSaving || isSaved ? 'opacity-70 cursor-not-allowed' : ''}`}
                  >
                    {isSaving ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Saving...
                      </>
                    ) : isSaved ? (
                      <>
                        <Check className="w-4 h-4" />
                        Saved!
                      </>
                    ) : isError ? (
                      <>
                        <XCircle className="w-4 h-4" />
                        Failed!
                      </>
                    ) : (
                      <>Finalize & Save Course Registry</>
                    )}
                  </Button>
                )}
              </div>
              {isError && errorMessage && (
                <div className="mt-4 p-4 bg-rose-50 border-2 border-rose-100 rounded-2xl flex items-start gap-3 animate-in fade-in slide-in-from-top-2 duration-500">
                  <XCircle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-[10px] font-black text-rose-600 uppercase tracking-widest mb-1">Save Operation Failed</p>
                    <p className="text-xs font-medium text-rose-700 leading-relaxed">{errorMessage}</p>
                    <p className="text-[9px] font-bold text-rose-400 uppercase tracking-tighter mt-2">Please check your network connection or try again in a few moments.</p>
                  </div>
                </div>
              )}
            </div>
         </div>
      </div>
    </div>
  );
};
