
import React, { useMemo, useState } from 'react';
import { MatrixRow, CISTCognitiveLevel, Course } from '../../types';
import { suggestConstruct } from '../../services/aiService';
import { Button } from '@/components/ui/button';
import { Sparkles, Loader2, X } from 'lucide-react';

interface CISTTableRowProps {
  row: MatrixRow;
  index: number;
  levels: string[];
  cloKeys: string[]; // These are the global list of CLO keys in policy
  itemTypes: string[];
  onUpdate: (updates: Partial<MatrixRow>) => void;
  onToggleArray: (field: 'clos' | 'itemTypes', value: string) => void;
  onRemove: () => void;
  course?: Course;
  duplicateLevels?: Record<string, boolean>;
  spans?: {
    task: number;
    topicCode: number;
    clos: number;
    construct: number;
    itemTypes: number;
    totalMark: number;
  };
  taskTotalMark?: number;
}

export const CISTTableRow: React.FC<CISTTableRowProps> = ({ 
  row, levels, cloKeys, itemTypes, onUpdate, onToggleArray, onRemove, course, spans, duplicateLevels, taskTotalMark
}) => {
  const [isSuggesting, setIsSuggesting] = useState(false);
  const rowLevels = row.levels || {};
  
  const policies = course?.assessmentPolicies || [];
  const selectedPolicy = policies.find(p => p.name === row.task);

  const handleAiSuggest = async () => {
    if (!row.task) return;
    setIsSuggesting(true);
    
    // Get CLO descriptions
    const cloDescriptions = (row.clos || []).map(k => `${k}: ${course?.clos?.[k] || ''}`);
    
    // Get Dublin Accord standards for this task
    const daStandards = course?.daMappings?.[selectedPolicy?.id || ''] || [];

    const suggestion = await suggestConstruct({
      clos: cloDescriptions,
      daStandards: daStandards,
      taskName: row.task
    });
    
    onUpdate({ construct: suggestion });
    setIsSuggesting(false);
  };
  
  // Topics and CLOs are now restricted by the selected Task Policy
  const availableTopics = useMemo(() => {
    if (!selectedPolicy) return [];
    return selectedPolicy.linkedTopics;
  }, [selectedPolicy]);

  const availableClos = useMemo(() => {
    if (!selectedPolicy) return [];
    return selectedPolicy.linkedClos;
  }, [selectedPolicy]);

  const handleLevelChange = (level: string, subField: keyof CISTCognitiveLevel, value: string) => {
    const nextLevels = { ...rowLevels };
    if (subField === 'marks') {
      const numValue = parseInt(value) || 0;
      nextLevels[level] = { ...(nextLevels[level] || { count: '', marks: 0 }), marks: numValue };
    } else {
      nextLevels[level] = { ...(nextLevels[level] || { count: '', marks: 0 }), count: value };
    }
    const newTotal = Object.values(nextLevels).reduce((sum, l) => sum + (l.marks || 0), 0);
    onUpdate({ levels: nextLevels, totalMark: newTotal });
  };

  const inputBase = "w-full bg-transparent text-center outline-none focus:bg-white transition-colors p-1 text-black font-bold";

  return (
    <tr className="h-10 hover:bg-sky-50 transition-colors border-b border-black/10">
      {/* Assessment Task - Now a Dropdown */}
      {spans?.task !== 0 && (
        <td className="border-r-2 border-black p-0 bg-white align-middle" rowSpan={spans?.task || 1}>
          <select 
            className="w-full bg-transparent text-[10px] font-black outline-none text-center appearance-none uppercase"
            value={row.task || ''}
            onChange={e => onUpdate({ task: e.target.value, topicCode: '', clos: [] })}
          >
             <option value="">-- TASK --</option>
             {policies.map(p => <option key={p.id} value={p.name}>{p.name}</option>)}
          </select>
        </td>
      )}

      {/* CLO Checks - Restricted to Policy */}
      {cloKeys.map(k => {
        const isPolicyAllowed = availableClos.includes(k);
        return spans?.clos !== 0 ? (
          <td 
            key={k} 
            rowSpan={spans?.clos || 1}
            className={`border-r border-black text-center font-black text-xs align-middle ${isPolicyAllowed ? 'cursor-pointer hover:bg-sky-100 bg-white text-black' : 'bg-slate-50 text-slate-200 cursor-not-allowed'}`} 
            onClick={() => isPolicyAllowed && onToggleArray('clos', k)}
          >
            {row.clos?.includes(k) ? '√' : ''}
          </td>
        ) : null;
      })}

      {/* Topic - Restricted to Policy */}
      {spans?.topicCode !== 0 && (
        <td className="border-r-2 border-black p-0 bg-white align-middle" rowSpan={spans?.topicCode || 1}>
          <select 
            className={`w-full bg-transparent text-[10px] font-black outline-none text-center ${availableTopics.length === 0 ? 'text-slate-300' : 'text-black'}`}
            value={row.topicCode || ''}
            onChange={e => onUpdate({ topicCode: e.target.value })}
            disabled={availableTopics.length === 0}
          >
            <option value="">-- T# --</option>
            {availableTopics.map(t => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </td>
      )}

      {/* Levels Distribution (Free Input) */}
      {levels.map(level => (
        <React.Fragment key={level}>
          <td className={`border-r border-black p-0 transition-colors ${duplicateLevels?.[level] ? 'bg-red-50' : 'bg-white'}`}>
            <input type="text" className={`${inputBase} text-[10px] ${duplicateLevels?.[level] ? 'text-red-600' : ''}`} value={rowLevels[level]?.count ?? ''} onChange={e => handleLevelChange(level, 'count', e.target.value)} placeholder="#" />
          </td>
          <td className="border-r border-black p-0 bg-white">
            <input type="number" className={`${inputBase} text-[10px] font-black text-blue-700 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none`} value={rowLevels[level]?.marks || ''} onChange={e => handleLevelChange(level, 'marks', e.target.value)} placeholder="0" />
          </td>
        </React.Fragment>
      ))}

      {/* Total Mark */}
      {spans?.totalMark !== 0 && (
        <td className="border-r-2 border-black bg-slate-50 font-black text-xs text-center text-black align-middle" rowSpan={spans?.totalMark || 1}>
          {taskTotalMark ?? row.totalMark ?? 0}
        </td>
      )}

      {/* Construct Description (Free Text) */}
      {spans?.construct !== 0 && (
        <td className="border-r-2 border-black p-0 text-left bg-white align-middle relative group/construct" rowSpan={spans?.construct || 1}>
          <textarea 
            className="w-full bg-transparent outline-none px-2 italic font-bold focus:bg-white text-[9px] leading-tight resize-none py-1 h-full min-h-[40px] uppercase text-black" 
            value={row.construct || ''} 
            onChange={e => onUpdate({ construct: e.target.value })} 
            placeholder="CONSTRUCT..." 
          />
          {row.task && (
            <Button 
              variant="ghost"
              size="icon"
              onClick={handleAiSuggest}
              disabled={isSuggesting}
              className={`absolute right-1 bottom-1 h-6 w-6 rounded-md bg-indigo-50 text-indigo-600 hover:bg-indigo-600 hover:text-white transition-all opacity-0 group-hover/construct:opacity-100 ${isSuggesting ? 'animate-pulse' : ''}`}
              title="Suggest Construct via AI"
            >
              {isSuggesting ? <Loader2 className="h-3 w-3 animate-spin" /> : <Sparkles className="h-3 w-3" />}
            </Button>
          )}
        </td>
      )}

      {/* Item Types */}
      {itemTypes.map(t => (
        spans?.itemTypes !== 0 ? (
          <td key={t} rowSpan={spans?.itemTypes || 1} className="border-r border-black cursor-pointer hover:bg-sky-100 text-center font-black text-xs text-black bg-white align-middle" onClick={() => onToggleArray('itemTypes', t)}>
            {row.itemTypes?.includes(t) ? '√' : ''}
          </td>
        ) : null
      ))}

      <td className="p-1 no-print text-center align-middle">
        <Button variant="ghost" size="icon" onClick={onRemove} className="h-6 w-6 text-red-400 hover:text-red-600 hover:bg-red-50">
          <X className="h-4 w-4" />
        </Button>
      </td>
    </tr>
  );
};
