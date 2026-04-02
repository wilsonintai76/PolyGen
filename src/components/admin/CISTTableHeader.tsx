
import React from 'react';

interface CISTTableHeaderProps {
  levels: string[];
  cloKeys: string[];
  itemTypes: string[];
  domainLabel: string;
}

export const CISTTableHeader: React.FC<CISTTableHeaderProps> = ({ levels, cloKeys, itemTypes, domainLabel }) => {
  return (
    <thead className="bg-[#D9EAF7] border-b-2 border-black sticky top-0 z-10">
      {/* Row 1: Main Headers */}
      <tr className="border-b-2 border-black">
        <th rowSpan={3} className="border-r-2 border-black p-2 w-32 font-black">ASSESSMENT TASKS</th>
        <th colSpan={cloKeys.length} className="border-r-2 border-black p-2 font-black">CLO</th>
        <th rowSpan={3} className="border-r-2 border-black p-2 w-16 font-black">TOPIC</th>
        <th colSpan={levels.length * 2} className="border-r-2 border-black p-2 font-black uppercase">{domainLabel} LEVEL & MARKS DISTRIBUTION</th>
        <th rowSpan={3} className="border-r-2 border-black p-2 w-16 font-black">TOTAL MARK</th>
        <th rowSpan={3} className="border-r-2 border-black p-2 w-56 font-black uppercase">CONSTRUCT (GS/SS)</th>
        <th colSpan={itemTypes.length} className="border-r-2 border-black p-2 font-black">TYPES OF ITEM</th>
        <th rowSpan={3} className="w-10 no-print"></th>
      </tr>
      {/* Row 2: Level Headers and CLO sub-headers */}
      <tr className="border-b-2 border-black">
        {cloKeys.map(k => (
          <th key={k} rowSpan={2} className="border-r border-black p-1 w-10 text-[8px]">{k}</th>
        ))}
        {levels.map(level => (
          <th key={level} colSpan={2} className="border-r border-black p-1 bg-[#BFD7EA] font-black text-xs">{level}</th>
        ))}
        {itemTypes.map(t => (
          <th key={t} rowSpan={2} className="border-r border-black p-1 w-7 text-[8px]">{t}</th>
        ))}
      </tr>
      {/* Row 3: # and MARKS sub-headers for Levels */}
      <tr>
        {levels.map(level => (
          <React.Fragment key={`${level}-sub`}>
            <th className="border-r border-black p-0.5 w-8 text-[9px]">#</th>
            <th className="border-r border-black p-0.5 w-12 text-[9px]">MARKS</th>
          </React.Fragment>
        ))}
      </tr>
    </thead>
  );
};
