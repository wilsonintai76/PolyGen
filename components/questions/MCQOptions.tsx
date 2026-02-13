
import React from 'react';

interface MCQOptionsProps {
  options: string[];
  correctAnswer?: string;
  editMode?: boolean;
  onChange: (options: string[]) => void;
  onCorrectChange?: (label: string) => void;
}

export const MCQOptions: React.FC<MCQOptionsProps> = ({ options, correctAnswer, editMode, onChange, onCorrectChange }) => {
  const handleOptionChange = (idx: number, val: string) => {
    const newOpts = [...options];
    newOpts[idx] = val;
    onChange(newOpts);
  };

  const labels = ['A', 'B', 'C', 'D'];

  const getIsCorrect = (label: string) => {
    if (!correctAnswer) return false;
    return correctAnswer.trim().startsWith(`Option ${label}`);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-3 ml-4 mt-4 mb-6">
      {labels.map((label, idx) => {
        const isCorrect = getIsCorrect(label);
        return (
          <div 
            key={label} 
            className={`flex items-start text-sm p-2 rounded-xl transition-all ${
              isCorrect ? 'bg-emerald-50 border border-emerald-100' : 'border border-transparent'
            }`}
          >
            {/* Answer Selector (Only in Edit Mode) */}
            {editMode && onCorrectChange && (
              <div 
                onClick={() => onCorrectChange(label)}
                className={`mr-3 mt-0.5 w-5 h-5 rounded-full border-2 flex items-center justify-center cursor-pointer transition-colors shrink-0 ${
                  isCorrect 
                    ? 'bg-emerald-500 border-emerald-500' 
                    : 'border-slate-300 hover:border-emerald-300'
                }`}
                title="Mark as Correct Answer"
              >
                {isCorrect && <span className="text-white text-[10px] font-bold">✓</span>}
              </div>
            )}

            <span className={`font-bold mr-2 mt-0.5 ${isCorrect ? 'text-emerald-700' : 'text-slate-700'}`}>{label}.</span>
            
            {editMode ? (
              <input 
                className={`flex-grow bg-transparent border-b border-dashed px-1 text-xs outline-none focus:border-blue-400 transition ${
                  isCorrect ? 'border-emerald-300 text-emerald-800 font-bold' : 'border-slate-200'
                }`}
                value={options[idx] || ''}
                onChange={(e) => handleOptionChange(idx, e.target.value)}
                placeholder={`Option ${label}`}
              />
            ) : (
              <span className={`${isCorrect ? 'font-bold text-emerald-800' : ''}`}>{options[idx] || 'Option ' + label}</span>
            )}
          </div>
        );
      })}
    </div>
  );
};
