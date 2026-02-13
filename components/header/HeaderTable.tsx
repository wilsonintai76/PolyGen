
import React from 'react';
import { HeaderData } from '../../types';

interface HeaderTableProps {
  data: HeaderData;
  editMode?: boolean;
  onUpdate?: (data: HeaderData) => void;
}

const DefaultPoliteknikLogo = () => (
  <div className="flex flex-col items-center">
    <svg width="150" height="70" viewBox="0 0 200 100" xmlns="http://www.w3.org/2000/svg">
      <path d="M40 42 Q 100 10 160 42" stroke="black" strokeWidth="2.5" fill="none" strokeLinecap="round" />
      <path d="M55 36 Q 100 18 145 36" stroke="black" strokeWidth="1.5" fill="none" strokeLinecap="round" />
      <text x="50%" y="65" textAnchor="middle" fill="#ed1c24" style={{ fontSize: '24px', fontWeight: '900', fontFamily: 'Arial Black, sans-serif', letterSpacing: '-1px' }}>
        POLITEKNIK
      </text>
      <line x1="20" y1="72" x2="180" y2="72" stroke="#ed1c24" strokeWidth="2.5" />
      <text x="50%" y="84" textAnchor="middle" fill="#ed1c24" style={{ fontSize: '10px', fontWeight: 'bold', fontFamily: 'Arial, sans-serif', letterSpacing: '4px' }}>
        MALAYSIA
      </text>
      <text x="50%" y="96" textAnchor="middle" fill="black" style={{ fontSize: '11px', fontWeight: '900', fontFamily: 'Arial, sans-serif', letterSpacing: '1px' }}>
        KUCHING SARAWAK
      </text>
    </svg>
  </div>
);

export const HeaderTable: React.FC<HeaderTableProps> = ({ data, editMode, onUpdate }) => {
  const handleChange = (field: keyof HeaderData, value: string) => {
    if (onUpdate) {
      onUpdate({ ...data, [field]: value });
    }
  };

  const Input = ({ field, className = "" }: { field: keyof HeaderData; className?: string }) => (
    <input
      type="text"
      className={`w-full bg-blue-50 border border-blue-200 px-1 focus:outline-none focus:bg-white ${className}`}
      value={data[field] as string}
      onChange={(e) => handleChange(field, e.target.value)}
    />
  );

  /**
   * Layout Math for Perfect Alignment:
   * Total Width = 100%
   * Logo/Dept Column = 35%
   * Course/Session Labels = 35%
   * Course/Session Values = 30%
   * 
   * The Divider between Labels and Values sits at (35% + 35%) = 70% total width.
   * 
   * The Right Container (Course/Session info) is (35% + 30%) = 65% of total width.
   * Inside this 65% container, the Label section must be (35 / 65) * 100 = 53.846%
   */
  const col1Width = "w-[35%]"; // Logo/Dept
  const rightContainerWidth = "w-[65%]"; // Labels + Values
  const labelInnerWidth = "w-[53.846%]"; // 35% relative to the 100% total

  return (
    <div className="border border-black mb-4 bg-white print-exact text-[10px]">
      {/* Top Section: Logo (Left) and Course/Session Info (Right) */}
      <div className="flex">
        {/* Left Column: Logo and Department */}
        <div className={`${col1Width} border-r border-black flex flex-col min-h-[120px]`}>
          <div className="flex-grow flex items-center justify-center p-2">
            {data.logoUrl ? (
              <img src={data.logoUrl} className="max-h-20 max-w-full object-contain" alt="Institution Logo" />
            ) : (
              <DefaultPoliteknikLogo />
            )}
          </div>
          <div className="border-t border-black p-1.5 font-bold text-center uppercase leading-tight min-h-[32px] flex items-center justify-center">
            {editMode ? (
              <Input field="department" className="text-center" />
            ) : (
              data.department
            )}
          </div>
        </div>

        {/* Right Section: Course Code/Name and Session */}
        <div className={`${rightContainerWidth} flex flex-col`}>
          {/* Top Row: Course Code / Name */}
          <div className="flex flex-grow border-b border-black">
            <div className={`${labelInnerWidth} border-r border-black p-2 font-bold uppercase flex items-center`}>
              COURSE CODE / COURSE NAME
            </div>
            <div className="flex-grow p-2 uppercase flex items-center">
              {editMode ? (
                <div className="flex flex-col gap-1 w-full">
                  <Input field="courseCode" className="font-bold" />
                  <Input field="courseName" />
                </div>
              ) : (
                <div className="font-bold leading-tight">
                  {data.courseCode} {data.courseName}
                </div>
              )}
            </div>
          </div>

          {/* Middle Row: Session */}
          <div className="flex flex-grow">
            <div className={`${labelInnerWidth} border-r border-black p-2 font-bold uppercase flex items-center`}>
              SESSION
            </div>
            <div className="flex-grow p-2 uppercase flex items-center font-bold">
              {editMode ? <Input field="session" /> : data.session}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Row: Assessment Details and Set Identifier */}
      <div className="border-t border-black flex h-10 items-center uppercase font-bold">
        {/* Assessment Section (Spans Col 1 + Col 2 = 70%) */}
        <div className="w-[70%] border-r border-black px-4 flex items-center gap-1 h-full">
          <span>ASSESSMENT (%):</span>
          {editMode ? (
            <div className="flex items-center gap-1">
              <Input field="assessmentType" className="w-24 text-center" />
              <span>(</span>
              <Input field="percentage" className="w-12 text-center" />
              <span>)</span>
            </div>
          ) : (
            <span>{data.assessmentType} ({data.percentage})</span>
          )}
        </div>

        {/* Set Section (Spans Col 3 = 30%) */}
        <div className="w-[30%] flex items-center justify-center gap-4 h-full">
          <span>SET</span>
          {editMode ? (
            <div className="flex gap-2">
              {['A', 'B', 'C', 'D'].map((s) => (
                <label key={s} className="flex items-center gap-1 cursor-pointer">
                  <input 
                    type="radio" 
                    name="paperSet"
                    className="w-3 h-3"
                    checked={data.set === s}
                    onChange={() => handleChange('set', s)}
                  />
                  <span className="text-[9px] font-black">{s}</span>
                </label>
              ))}
            </div>
          ) : (
            <span className="text-lg italic font-black">{data.set}</span>
          )}
        </div>
      </div>
    </div>
  );
};
