
import React from 'react';
import { MatrixRow, CISTCognitiveLevel, Course } from '../../types';

interface CISTTableRowProps {
  row: MatrixRow;
  index: number;
  levels: string[];
  cloKeys: string[];
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
  };
}

export const CISTTableRow: React.FC<CISTTableRowProps> = ({ 
  row, index, levels, cloKeys, itemTypes, onUpdate, onToggleArray, onRemove, course, spans, duplicateLevels
}) => {
  const rowLevels = row.levels || {};
  const hasPredefinedTopics = course?.topics && course.topics.length > 0;

  const handleLevelChange = (level: string, subField: keyof CISTCognitiveLevel, value: string) => {
    const nextLevels = { ...rowLevels };
    
    if (subField === 'marks') {
      const numValue = parseInt(value) || 0;
      nextLevels[level] = { 
        ...(nextLevels[level] || { count: '', marks: 0 }), 
        marks: numValue 
      };
    } else {
      nextLevels[level] = { 
        ...(nextLevels[level] || { count: '', marks: 0 }), 
        count: value 
      };
    }
    
    const newTotal = Object.values(nextLevels).reduce((sum, l) => sum + (l.marks || 0), 0);
    onUpdate({ levels: nextLevels, totalMark: newTotal });
  };

  const inputBase = "w-full bg-transparent text-center outline-none focus:bg-white transition-colors p-1 text-black font-bold";

  return (
    <tr className="h-10 hover:bg-sky-50 transition-colors border-b border-black/10">
      {/* Assessment Task */}
      {spans?.task !== 0 && (
        <td className="border-r-2 border-black p-0 bg-white align-middle" rowSpan={spans?.task || 1}>
          <input 
            className={`${inputBase} text-[10px] uppercase`}
            value={row.task || ''}
            onChange={e => onUpdate({ task: e.target.value })}
            placeholder="E.G. QUIZ"
          />
        </td>
      )}

      {/* CLO Checks */}
      {cloKeys.map(k => (
        spans?.clos !== 0 ? (
          <td 
            key={k} 
            rowSpan={spans?.clos || 1}
            className="border-r border-black cursor-pointer hover:bg-sky-100 text-center font-black text-xs text-black bg-white align-middle" 
            onClick={() => onToggleArray('clos', k)}
          >
            {row.clos?.includes(k) ? '√' : ''}
          </td>
        ) : null
      ))}

      {/* Topic */}
      {spans?.topicCode !== 0 && (
        <td className="border-r-2 border-black p-0 bg-white align-middle" rowSpan={spans?.topicCode || 1}>
          {hasPredefinedTopics ? (
            <select 
              className="w-full bg-transparent text-[10px] font-black outline-none cursor-pointer text-center text-black"
              value={row.topicCode || ''}
              onChange={e => onUpdate({ topicCode: e.target.value })}
            >
              <option value="">-- TOPIC --</option>
              {course?.topics?.map(t => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          ) : (
            <input 
              className={`${inputBase} text-[10px]`}
              value={row.topicCode || ''}
              onChange={e => onUpdate({ topicCode: e.target.value })}
              placeholder="T1"
            />
          )}
        </td>
      )}

      {/* Levels Distribution */}
      {levels.map(level => (
        <React.Fragment key={level}>
          <td className={`border-r border-black p-0 transition-colors ${duplicateLevels?.[level] ? 'bg-red-50' : 'bg-white'}`}>
            <input 
              type="text" 
              className={`${inputBase} text-[10px] ${duplicateLevels?.[level] ? 'text-red-600' : ''}`}
              value={rowLevels[level]?.count ?? ''} 
              onChange={e => handleLevelChange(level, 'count', e.target.value)}
              placeholder="#"
              title={duplicateLevels?.[level] ? "Warning: Duplicate question number within this task group!" : ""}
            />
          </td>
          <td className="border-r border-black p-0 bg-white">
            <input 
              type="number" 
              className={`${inputBase} text-[10px] font-black text-blue-700 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none`}
              value={rowLevels[level]?.marks || ''} 
              onChange={e => handleLevelChange(level, 'marks', e.target.value)}
              placeholder="0"
            />
          </td>
        </React.Fragment>
      ))}

      {/* Total Mark */}
      <td className="border-r-2 border-black bg-slate-50 font-black text-xs text-center text-black">
        {row.totalMark || 0}
      </td>

      {/* Construct Description */}
      {spans?.construct !== 0 && (
        <td className="border-r-2 border-black p-0 text-left bg-white align-middle" rowSpan={spans?.construct || 1}>
          <textarea 
            className="w-full bg-transparent outline-none px-2 italic font-bold focus:bg-white text-[9px] leading-tight resize-none py-1 h-full min-h-[40px] uppercase text-black" 
            value={row.construct || ''}
            onChange={e => onUpdate({ construct: e.target.value })}
            placeholder="CONSTRUCT..."
          />
        </td>
      )}

      {/* Item Types */}
      {itemTypes.map(t => (
        spans?.itemTypes !== 0 ? (
          <td 
            key={t} 
            rowSpan={spans?.itemTypes || 1}
            className="border-r border-black cursor-pointer hover:bg-sky-100 text-center font-black text-xs text-black bg-white align-middle" 
            onClick={() => onToggleArray('itemTypes', t)}
          >
            {row.itemTypes?.includes(t) ? '√' : ''}
          </td>
        ) : null
      ))}

      {/* Actions */}
      <td className="p-1 no-print text-center align-middle">
        <button onClick={onRemove} className="text-red-400 hover:text-red-600 font-black text-xl leading-none">&times;</button>
      </td>
    </tr>
  );
};
