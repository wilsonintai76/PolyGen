
import React from 'react';

interface MQFMappingSectionProps {
  mqfClusters: Record<string, string>;
  onUpdate: (mqf: Record<string, string>) => void;
}

export const MQFMappingSection: React.FC<MQFMappingSectionProps> = ({ mqfClusters, onUpdate }) => {
  const addMqf = () => {
    // Generate a temporary unique key so the user can manually define the MQF/DA code
    const tempKey = `NEW_DA_${Date.now()}`;
    onUpdate({ ...mqfClusters, [tempKey]: '' });
  };

  const removeMqf = (key: string) => {
    const newMqf = { ...mqfClusters };
    delete newMqf[key];
    onUpdate(newMqf);
  };

  const updateMqfDesc = (key: string, value: string) => {
    onUpdate({ ...mqfClusters, [key]: value });
  };

  const updateMqfKey = (oldKey: string, newKey: string) => {
    if (oldKey === newKey || !newKey.trim()) return;
    const newMqf: Record<string, string> = {};
    (Object.entries(mqfClusters) as [string, string][]).forEach(([k, v]) => {
      if (k === oldKey) newMqf[newKey] = v;
      else newMqf[k] = v;
    });
    onUpdate(newMqf);
  };

  return (
    <div className="bg-[#f6faff] p-8 rounded-[32px] border border-[#eef6ff] flex flex-col h-full min-h-[600px] shadow-sm">
      <div className="flex justify-between items-center mb-8">
        <h3 className="font-extrabold text-[#3b82f6] uppercase tracking-wider text-[11px] flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-[#93c5fd]"></span>
          5. MQF/DUBLIN ATTRIBUTES
        </h3>
        <button 
          onClick={addMqf} 
          className="bg-[#2563eb] text-white text-[10px] font-black px-4 py-2 rounded-xl hover:bg-[#1d4ed8] transition shadow-md active:scale-95 flex items-center gap-1.5 uppercase tracking-wider"
        >
          <span className="text-base leading-none">+</span> ADD
        </button>
      </div>

      <div className="flex px-4 mb-3 text-[10px] font-black text-[#93c5fd] uppercase tracking-widest border-b border-[#eef6ff] pb-2">
        <div className="w-32">ATTRIBUTE CODE</div>
        <div className="flex-grow">ATTRIBUTE DESCRIPTION</div>
      </div>

      <div className="space-y-6 flex-grow overflow-y-auto pr-2 custom-scrollbar">
        {(Object.entries(mqfClusters) as [string, string][]).map(([key, desc]) => (
          <div key={key} className="bg-white p-5 rounded-2xl border border-[#eef6ff] shadow-sm hover:shadow-md transition group relative">
            <button 
              onClick={() => removeMqf(key)}
              className="absolute -top-2.5 -right-2.5 w-7 h-7 bg-white text-red-400 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition shadow-lg hover:bg-red-500 hover:text-white z-10 border border-red-50"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <div className="flex items-center mb-3">
              <input 
                className="text-[11px] font-black text-[#2563eb] uppercase bg-[#f6faff] px-3 py-1.5 rounded-xl border border-[#eef6ff] focus:border-[#93c5fd] outline-none w-32 transition shadow-inner"
                value={key.startsWith('NEW_DA_') ? '' : key}
                placeholder="e.g. DK1"
                onChange={(e) => updateMqfKey(key, e.target.value)}
              />
            </div>
            <textarea 
              className="w-full text-xs font-bold leading-relaxed outline-none resize-none h-24 bg-[#fafafa] p-4 rounded-xl border border-gray-100 focus:border-[#93c5fd] transition text-[#475569] shadow-inner" 
              placeholder="Describe the attribute (e.g. Specialist Knowledge)..." 
              value={desc} 
              onChange={e => updateMqfDesc(key, e.target.value)} 
            />
          </div>
        ))}
        {Object.keys(mqfClusters).length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-[#cbd5e1] italic text-sm py-20 text-center">
            <span className="text-4xl mb-4 block">🧬</span>
            No MQF attributes defined. Click + ADD to start.
          </div>
        )}
      </div>
    </div>
  );
};
