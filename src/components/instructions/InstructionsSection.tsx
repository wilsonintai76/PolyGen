import React from 'react';

interface InstructionsSectionProps {
  instructions: string[];
  editMode?: boolean;
  onUpdate: (instructions: string[]) => void;
}

export const InstructionsSection: React.FC<InstructionsSectionProps> = ({ instructions, editMode, onUpdate }) => {
  const handleUpdate = (idx: number, value: string) => {
    const updated = [...instructions];
    updated[idx] = value;
    onUpdate(updated);
  };

  const removeInstruction = (idx: number) => {
    onUpdate(instructions.filter((_, i) => i !== idx));
  };

  const addInstruction = () => {
    onUpdate([...instructions, '']);
  };

  return (
    <div className={`mb-6 space-y-2 ${editMode ? 'bg-blue-50/20 p-4 rounded-3xl border border-dashed border-blue-100' : ''}`}>
      <div className="flex justify-between items-center mb-1">
        <div className="font-bold underline text-xs uppercase tracking-tight">INSTRUCTIONS:</div>
        {editMode && (
          <button 
            onClick={addInstruction}
            className="text-[9px] font-black bg-blue-600 text-white px-3 py-1 rounded-lg hover:bg-blue-700 transition shadow-sm active:scale-95 uppercase tracking-widest"
          >
            + Add Instruction
          </button>
        )}
      </div>

      {editMode ? (
        <div className="space-y-2">
          {instructions.map((ins, i) => (
            <div key={i} className="flex gap-2 group/ins">
              <span className="text-xs font-bold pt-2 w-4 shrink-0 text-blue-400">{i + 1}.</span>
              <input 
                className="flex-grow bg-white border border-blue-100 p-2 rounded-xl text-xs outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-100 transition shadow-sm"
                value={ins}
                onChange={(e) => handleUpdate(i, e.target.value)}
                placeholder={`Instruction ${i + 1}...`}
              />
              <button 
                onClick={() => removeInstruction(i)}
                className="text-red-300 hover:text-red-500 font-bold px-2 text-xl transition-colors opacity-0 group-hover/ins:opacity-100"
                title="Remove instruction"
              >
                ×
              </button>
            </div>
          ))}
          {instructions.length === 0 && (
            <div className="text-center py-4 text-xs italic text-gray-400">No instructions added. Click the button above to add one.</div>
          )}
        </div>
      ) : (
        <ol className="list-decimal list-inside text-xs space-y-1">
          {instructions.map((ins, i) => (
            <li key={i} className="pl-1">{ins}</li>
          ))}
        </ol>
      )}
    </div>
  );
};