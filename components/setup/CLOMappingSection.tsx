
import React from 'react';

interface CLOMappingSectionProps {
  cloDefinitions: Record<string, string>;
  onUpdate: (clos: Record<string, string>) => void;
}

export const CLOMappingSection: React.FC<CLOMappingSectionProps> = ({ cloDefinitions, onUpdate }) => {
  const addClo = () => {
    // Generate a temporary unique key so the user can manually define the CLO code
    const tempKey = `NEW_CLO_${Date.now()}`;
    onUpdate({ ...cloDefinitions, [tempKey]: '' });
  };

  const removeClo = (key: string) => {
    const newClos = { ...cloDefinitions };
    delete newClos[key];
    onUpdate(newClos);
  };

  const updateCloDesc = (key: string, value: string) => {
    onUpdate({ ...cloDefinitions, [key]: value });
  };

  const updateCloKey = (oldKey: string, newKey: string) => {
    if (oldKey === newKey || !newKey.trim()) return;
    const newClos: Record<string, string> = {};
    (Object.entries(cloDefinitions) as [string, string][]).forEach(([k, v]) => {
      if (k === oldKey) newClos[newKey] = v;
      else newClos[k] = v;
    });
    onUpdate(newClos);
  };

  return (
    <div className="bg-[#fdfaff] p-8 rounded-[32px] border border-[#f5ebff] flex flex-col h-full min-h-[600px] shadow-sm">
      <div className="flex justify-between items-center mb-8">
        <h3 className="font-extrabold text-[#a855f7] uppercase tracking-wider text-[11px] flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-[#d8b4fe]"></span>
          4. CLO MAPPING
        </h3>
        <button 
          onClick={addClo} 
          className="bg-[#9333ea] text-white text-[10px] font-black px-4 py-2 rounded-xl hover:bg-[#7e22ce] transition shadow-md active:scale-95 flex items-center gap-1.5 uppercase tracking-wider"
        >
          <span className="text-base leading-none">+</span> ADD
        </button>
      </div>

      <div className="flex px-4 mb-3 text-[10px] font-black text-[#d8b4fe] uppercase tracking-widest border-b border-[#f5ebff] pb-2">
        <div className="w-28">CLO CODE</div>
        <div className="flex-grow">LEARNING OUTCOME DESCRIPTION</div>
      </div>
      
      <div className="space-y-6 flex-grow overflow-y-auto pr-2 custom-scrollbar">
        {(Object.entries(cloDefinitions) as [string, string][]).map(([key, desc]) => (
          <div key={key} className="bg-white p-5 rounded-2xl border border-[#f5ebff] shadow-sm hover:shadow-md transition group relative">
            <button 
              onClick={() => removeClo(key)}
              className="absolute -top-2.5 -right-2.5 w-7 h-7 bg-white text-red-400 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition shadow-lg hover:bg-red-500 hover:text-white z-10 border border-red-50"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <div className="flex items-center mb-3">
              <input 
                className="text-[11px] font-black text-[#9333ea] uppercase bg-[#fdfaff] px-3 py-1.5 rounded-xl border border-[#f5ebff] focus:border-[#d8b4fe] outline-none w-32 transition shadow-inner"
                value={key.startsWith('NEW_CLO_') ? '' : key}
                placeholder="e.g. CLO 1"
                onChange={(e) => updateCloKey(key, e.target.value)}
              />
            </div>
            <textarea 
              className="w-full text-xs font-bold leading-relaxed outline-none resize-none h-24 bg-[#fafafa] p-4 rounded-xl border border-gray-100 focus:border-[#d8b4fe] transition text-[#475569] shadow-inner" 
              placeholder="Describe the learning outcome..." 
              value={desc} 
              onChange={e => updateCloDesc(key, e.target.value)} 
            />
          </div>
        ))}
        {Object.keys(cloDefinitions).length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-[#cbd5e1] italic text-sm py-20 text-center">
            <span className="text-4xl mb-4 block">📝</span>
            No CLOs defined. Click + ADD to start.
          </div>
        )}
      </div>
    </div>
  );
};
