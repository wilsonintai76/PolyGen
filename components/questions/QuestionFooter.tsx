
import React from 'react';

interface QuestionFooterProps {
  mqfCluster?: string; // Legacy
  mqfKeys?: string[]; // Modern
  taxonomy?: string;
  construct?: string;
  marks: number;
  editMode?: boolean;
  onUpdate: (data: { mqfKeys?: string[]; taxonomy?: string; marks: number; mqfCluster?: string; construct?: string }) => void;
  hasSubQuestions?: boolean;
}

export const QuestionFooter: React.FC<QuestionFooterProps> = ({ mqfCluster, mqfKeys, taxonomy, construct, marks, editMode, onUpdate, hasSubQuestions }) => {
  const displayMqf = mqfKeys && mqfKeys.length > 0 ? mqfKeys.join(', ') : mqfCluster || "";

  const handleMqfChange = (val: string) => {
    const keys = val.split(',').map(k => k.trim()).filter(k => !!k);
    onUpdate({ mqfKeys: keys, taxonomy, marks, mqfCluster: keys.join(', '), construct });
  };

  return (
    <div className="flex flex-col items-end mt-4 pt-4 border-t border-dashed border-slate-200">
      {editMode ? (
        <div className="flex flex-col gap-1 items-end w-full">
          <div className="flex gap-4 justify-end w-full flex-wrap">
            <div className="flex flex-col items-end">
              <label className="text-[7px] text-blue-400 font-black uppercase tracking-widest mb-0.5">MQF Keys (comma separated)</label>
              <input 
                className="w-40 bg-blue-50 border border-blue-100 text-right px-2 py-1 text-[10px] font-bold rounded-lg outline-none focus:border-blue-400" 
                value={displayMqf} 
                onChange={(e) => handleMqfChange(e.target.value)}
                placeholder="e.g. DK1, DK3"
              />
            </div>
            <div className="flex flex-col items-end">
              <label className="text-[7px] text-blue-400 font-black uppercase tracking-widest mb-0.5">Construct (SS/GS)</label>
              <select 
                className="w-32 bg-blue-50 border border-blue-100 text-right px-2 py-1 text-[10px] font-bold rounded-lg outline-none focus:border-blue-400" 
                value={construct || "SS"} 
                onChange={(e) => onUpdate({ mqfKeys, taxonomy, marks, mqfCluster, construct: e.target.value })}
              >
                <option value="SS">Specific Skills (SS)</option>
                <option value="GS">Generic Skills (GS)</option>
              </select>
            </div>
            <div className="flex flex-col items-end">
              <label className="text-[7px] text-blue-400 font-black uppercase tracking-widest mb-0.5">Taxonomy</label>
              <input 
                className="w-24 bg-blue-50 border border-blue-100 text-center px-2 py-1 text-[10px] font-bold rounded-lg outline-none focus:border-blue-400" 
                value={taxonomy || ""} 
                onChange={(e) => onUpdate({ mqfKeys, taxonomy: e.target.value, marks, mqfCluster, construct })}
                placeholder="e.g. C1"
              />
            </div>
            <div className="flex flex-col items-end">
              <label className="text-[7px] text-blue-400 font-black uppercase tracking-widest mb-0.5">
                {hasSubQuestions ? "Marks (Auto)" : "Marks"}
              </label>
              <input 
                type="number"
                className={`w-20 border px-2 py-1 text-[10px] font-bold rounded-lg text-center outline-none transition-colors ${
                  hasSubQuestions 
                    ? 'bg-slate-100 border-slate-200 text-slate-500 cursor-not-allowed' 
                    : 'bg-blue-50 border-blue-100 focus:border-blue-400 text-blue-900'
                }`} 
                value={marks} 
                disabled={hasSubQuestions}
                onChange={(e) => onUpdate({ mqfKeys, taxonomy, marks: parseInt(e.target.value) || 0, mqfCluster, construct })}
              />
            </div>
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-end">
          <div className="flex gap-1 items-center font-bold text-[10px] mb-0.5 uppercase tracking-tighter text-gray-500">
             {displayMqf && <span>{displayMqf}</span>}
             {displayMqf && (taxonomy || construct) && <span>,</span>}
             {taxonomy && <span>{taxonomy}</span>}
             {taxonomy && construct && <span>,</span>}
             {construct && <span>{construct}</span>}
          </div>
          <div className="font-bold text-[11px]">({marks} marks)</div>
        </div>
      )}
    </div>
  );
};
