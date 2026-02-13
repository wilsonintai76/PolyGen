
import React from 'react';
import { StudentSectionData } from '../../types';

interface StudentInfoTableProps {
  data: StudentSectionData;
  editMode?: boolean;
  onUpdate?: (data: StudentSectionData) => void;
}

export const StudentInfoTable: React.FC<StudentInfoTableProps> = ({ data, editMode, onUpdate }) => {
  const handleChange = (field: keyof StudentSectionData, value: string | number) => {
    if (onUpdate) {
      onUpdate({ ...data, [field]: value });
    }
  };

  const labelWidthClass = "w-48"; // Increased from w-40 to w-48 to handle long labels like PROGRAMME/SECTION

  return (
    <div className="border border-black mb-6 bg-white print-exact">
      <div className="flex">
        <div className="flex-grow">
          <div className="flex border-b border-black h-8 items-center">
            <div className={`${labelWidthClass} px-2 font-bold text-[10px]`}>NAME</div>
            <div className="border-l border-black flex-grow h-full bg-white"></div>
          </div>
          <div className="flex border-b border-black h-8 items-center">
            <div className={`${labelWidthClass} px-2 font-bold text-[10px]`}>REGISTRATION NO</div>
            <div className="border-l border-black flex-grow h-full bg-white"></div>
          </div>
          <div className="flex h-8 items-center">
            <div className={`${labelWidthClass} px-2 font-bold text-[10px]`}>PROGRAMME/SECTION</div>
            <div className="border-l border-black flex-grow h-full bg-white"></div>
          </div>
        </div>

        <div className="w-48 border-l border-black flex flex-col">
          <div className="flex-grow border-b border-black flex flex-col justify-center items-center p-2">
            <span className="font-bold text-[10px] mb-1">DURATION</span>
            {editMode ? (
              <input 
                type="text" 
                className="w-full text-center bg-blue-50 border border-blue-200 font-bold uppercase text-[10px]"
                value={data.duration}
                onChange={(e) => handleChange('duration', e.target.value)}
              />
            ) : (
              <span className="font-bold text-[11px]">{data.duration}</span>
            )}
          </div>
          <div className="h-10 flex items-center justify-between px-2 bg-white">
            <span className="font-bold text-[10px]">TOTAL MARKS</span>
            {editMode ? (
              <div className="flex items-center">
                <span className="text-[11px]">/</span>
                <input 
                  type="number" 
                  className="w-12 text-center bg-blue-50 border border-blue-200 font-bold ml-1 text-[11px]"
                  value={data.totalMarks}
                  onChange={(e) => handleChange('totalMarks', parseInt(e.target.value) || 0)}
                />
              </div>
            ) : (
              <span className="font-bold text-[11px]">/{data.totalMarks}</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
