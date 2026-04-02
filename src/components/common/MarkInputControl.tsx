
import React, { useState } from 'react';

interface MarkInputControlProps {
  onAddMark: (marks: number) => void;
  className?: string;
}

export const MarkInputControl: React.FC<MarkInputControlProps> = ({ onAddMark, className = '' }) => {
  const [custom, setCustom] = useState('');

  const handleAdd = () => {
    const val = parseFloat(custom);
    if (!isNaN(val) && val > 0) {
      onAddMark(val);
      setCustom('');
    }
  };

  return (
    <div className={`flex items-center gap-1 flex-wrap ${className}`}>
      {[1, 2, 3, 4, 5, 10].map(m => (
        <button 
          key={m}
          type="button"
          onClick={() => onAddMark(m)}
          className="px-2 py-0.5 bg-indigo-50 text-indigo-600 text-[9px] font-black rounded hover:bg-indigo-100 border border-indigo-100 transition shadow-sm"
        >
          +{m}M
        </button>
      ))}
      <div className="flex items-center gap-0.5 bg-white border border-slate-200 rounded px-1 ml-1 shadow-sm focus-within:border-blue-300 transition-colors">
         <input 
           className="w-8 bg-transparent text-[9px] font-bold outline-none text-center py-0.5 text-slate-700 placeholder:text-slate-300"
           placeholder="#"
           type="number"
           value={custom}
           onChange={e => setCustom(e.target.value)}
           onKeyDown={e => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleAdd();
              }
           }}
         />
         <button 
           type="button"
           onClick={handleAdd}
           className="text-[8px] font-black text-blue-500 hover:text-blue-700 px-1 border-l border-slate-100"
         >
           ADD
         </button>
      </div>
    </div>
  );
};
