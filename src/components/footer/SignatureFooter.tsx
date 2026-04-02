
import React from 'react';
import { FooterData } from '../../types';

interface SignatureFooterProps {
  data: FooterData;
  editMode?: boolean;
  onUpdate?: (data: FooterData) => void;
}

export const SignatureFooter: React.FC<SignatureFooterProps> = ({ data, editMode, onUpdate }) => {
  const handleChange = (field: keyof FooterData, value: string) => {
    if (onUpdate) {
      onUpdate({ ...data, [field]: value });
    }
  };

  const SignatureColumn = ({ 
    header,
    identityField,
    dateField,
    identityValue,
    dateValue,
    placeholder
  }: { 
    header: string;
    identityField: keyof FooterData;
    dateField: keyof FooterData;
    identityValue: string;
    dateValue: string;
    placeholder: string;
  }) => (
    <div className="flex flex-col border-r border-black last:border-r-0 h-full">
      {/* Header */}
      <div className="border-b border-black p-1 text-[10px] font-bold h-7 flex items-center">
        {header}
      </div>
      
      {/* Middle Signature Space */}
      <div className="flex-grow min-h-[60px] flex items-center justify-center">
        {editMode && <span className="text-[8px] text-slate-300 font-black uppercase">(Signature & Stamp)</span>}
      </div>

      {/* Bottom Identity & Date */}
      <div className="px-3 pb-3">
        <div className="mb-2">
          {editMode ? (
            <textarea 
              className="w-full bg-blue-50 border border-blue-200 text-[10px] font-bold p-1 outline-none focus:border-blue-400"
              rows={2}
              value={identityValue}
              onChange={(e) => handleChange(identityField, e.target.value)}
              placeholder={placeholder}
            />
          ) : (
            <div className="font-bold leading-tight text-[10px] min-h-[30px] flex items-end uppercase">
              {identityValue || placeholder}
            </div>
          )}
        </div>
        <div className="flex gap-2 items-end">
          <span className="font-bold text-[10px] shrink-0">Date :</span>
          {editMode ? (
            <input 
              className="bg-blue-50 border border-blue-200 flex-grow text-[10px] px-1 outline-none focus:border-blue-400"
              value={dateValue}
              onChange={(e) => handleChange(dateField, e.target.value)}
            />
          ) : (
            <div className="border-b border-black border-dotted flex-grow min-w-[50px] text-[10px] pb-0.5">
              {dateValue || '...........................................'}
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="mt-8 break-inside-avoid print-exact">
      <div className="text-center font-bold mb-4 uppercase text-[11px] tracking-widest">~ END OF QUESTIONS ~</div>
      
      <div className="border border-black overflow-hidden bg-white">
        <div className="grid grid-cols-3">
          <SignatureColumn 
            header="Prepared by:"
            identityField="preparedBy"
            dateField="preparedDate"
            identityValue={data.preparedBy}
            dateValue={data.preparedDate}
            placeholder="Course Lecturer"
          />
          <SignatureColumn 
            header="Reviewed by:"
            identityField="reviewedBy"
            dateField="reviewedDate"
            identityValue={data.reviewedBy}
            dateValue={data.reviewedDate}
            placeholder="Course Coordinator / Course Leader"
          />
          <SignatureColumn 
            header="Endorsed by:"
            identityField="endorsedBy"
            dateField="endorsedDate"
            identityValue={data.endorsedBy}
            dateValue={data.endorsedDate}
            placeholder="Head of Programme / Head of Department"
          />
        </div>
      </div>
    </div>
  );
};
