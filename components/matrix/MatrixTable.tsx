
import React, { useMemo } from 'react';
import { MatrixRow, CISTCognitiveLevel } from '../../types';

interface MatrixTableProps {
  rows: MatrixRow[];
  editMode?: boolean;
  onUpdate?: (rows: MatrixRow[]) => void;
}

export const MatrixTable: React.FC<MatrixTableProps> = ({ rows, editMode, onUpdate }) => {
  const processedRows = useMemo(() => {
    // Basic grouping by topic to merge cells if needed, similar to PDF visual logic if strictly applied
    // For now, mapping rows directly is safest to preserve specific constructs
    return rows;
  }, [rows]);

  return (
    <div className="mb-4 bg-white border border-black overflow-hidden">
      <table className="w-full border-collapse text-[9px] leading-tight font-sans">
        <thead>
          <tr className="bg-gray-100 text-center font-bold uppercase border-b border-black">
            <th className="border-r border-black p-1.5 w-[20%] align-middle">MQF CLUSTER / <br/>DUBLIN ATTRIBUTES</th>
            <th className="border-r border-black p-1.5 w-[10%] align-middle">LEARNING <br/>OUTCOMES</th>
            <th className="border-r border-black p-1.5 w-[15%] align-middle">TOPIC</th>
            <th className="border-r border-black p-1.5 flex-grow align-middle">CONSTRUCT</th>
            <th className="border-r border-black p-1.5 w-[10%] align-middle">TYPE OF <br/>ITEM</th>
            <th className="p-1.5 w-[12%] align-middle">LEVEL OF <br/>TAXONOMY</th>
          </tr>
        </thead>
        <tbody>
          {processedRows.length > 0 ? (
            processedRows.map((row, idx) => (
              <tr key={idx} className="align-top border-b border-black last:border-b-0">
                <td className="border-r border-black p-1.5 text-left">
                  {row.mqfCluster || '-'}
                </td>
                <td className="border-r border-black p-1.5 text-center font-bold">
                  {(row.clos || []).join(', ') || 'N/A'}
                </td>
                <td className="border-r border-black p-1.5 text-center font-black">
                  {row.topicCode || 'N/A'}
                </td>
                <td className="border-r border-black p-1.5 whitespace-pre-line text-left">
                  {row.construct}
                </td>
                <td className="border-r border-black p-1.5 text-center font-bold">
                  {(row.itemTypes || []).join(' & ') || 'Objective'}
                </td>
                <td className="p-1.5 text-center">
                  {Object.entries(row.levels || {})
                    .filter(([_, data]) => (data as CISTCognitiveLevel).marks > 0 || (data as CISTCognitiveLevel).count !== "0") // Show if count is there even if marks are tricky
                    .map(([level, _]) => level)
                    .join(' & ')}
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={6} className="p-8 text-center text-slate-300 font-bold uppercase tracking-widest italic">
                CIST Blueprint Specification
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};
