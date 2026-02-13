
import React, { useMemo } from 'react';
import { MatrixRow, CISTCognitiveLevel } from '../../types';

interface MatrixTableProps {
  rows: MatrixRow[];
  editMode?: boolean;
  onUpdate?: (rows: MatrixRow[]) => void;
}

/**
 * Paper Matrix: Usually a simplified version of the CIST 
 * used to show CLO/Cognitive mapping for the specific questions in THIS paper.
 */
export const MatrixTable: React.FC<MatrixTableProps> = ({ rows, editMode, onUpdate }) => {
  const processedRows = useMemo(() => {
    // Group strictly by Topic Code
    const groups: Record<string, MatrixRow[]> = {};
    rows.forEach(row => {
      const key = (row.topicCode || 'General').trim();
      if (!groups[key]) groups[key] = [];
      groups[key].push(row);
    });

    return Object.values(groups).map(group => {
      if (group.length === 1) return group[0];
      
      const joinUnique = (field: keyof MatrixRow, separator: string) => {
        const values = new Set<string>();
        group.forEach(r => {
           const val = r[field];
           if (Array.isArray(val)) {
             val.forEach(v => values.add(v.toString()));
           } else if (val) {
             val.toString().split(/[\n,/&]+/).forEach(v => values.add(v.trim()));
           }
        });
        return Array.from(values).sort().join(separator);
      };

      return {
        ...group[0],
        clos: Array.from(new Set(group.flatMap(r => r.clos || []))),
        itemTypes: Array.from(new Set(group.flatMap(r => r.itemTypes || [])))
      };
    }).sort((a, b) => (a.topicCode || '').localeCompare(b.topicCode || '', undefined, { numeric: true }));
  }, [rows]);

  return (
    <div className="mb-4 bg-white border border-black overflow-hidden">
      <table className="w-full border-collapse text-[9px] leading-tight font-sans">
        <thead>
          <tr className="bg-gray-100 text-center font-bold uppercase border-b border-black">
            <th className="border-r border-black p-1.5 w-[20%]">CLO MAPPING</th>
            <th className="border-r border-black p-1.5 w-[10%]">TOPIC</th>
            <th className="border-r border-black p-1.5 flex-grow">CONSTRUCT / DESCRIPTION</th>
            <th className="border-r border-black p-1.5 w-[15%]">TAXONOMY LEVEL</th>
            <th className="p-1.5 w-[10%]">ITEM TYPE</th>
          </tr>
        </thead>
        <tbody>
          {processedRows.length > 0 ? (
            processedRows.map((row, idx) => (
              <tr key={idx} className="align-top border-b border-black last:border-b-0 hover:bg-slate-50/30 transition-colors">
                <td className="border-r border-black p-1.5 text-center font-bold">
                  {(row.clos || []).join(', ') || 'N/A'}
                </td>
                <td className="border-r border-black p-1.5 text-center font-black">
                  {row.topicCode || 'N/A'}
                </td>
                <td className="border-r border-black p-1.5 italic">
                  {row.construct}
                </td>
                <td className="border-r border-black p-1.5 text-center">
                  {Object.entries(row.cognitiveLevels || {})
                    .filter(([_, data]) => (data as CISTCognitiveLevel).marks > 0)
                    .map(([level, _]) => level)
                    .join(', ')}
                </td>
                <td className="p-1.5 text-center font-bold">
                  {(row.itemTypes || []).join(' & ') || 'S'}
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={5} className="p-8 text-center text-slate-300 font-bold uppercase tracking-widest italic">
                Blueprint mapping will be derived from CIST configuration
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};