
import React from 'react';

interface PreviewToolbarProps {
  editMode: boolean;
  viewScheme: boolean;
  onToggleEdit: () => void;
  onToggleScheme: () => void;
  onSave: () => void;
  onPrint: () => void;
  onBack: () => void;
}

export const PreviewToolbar: React.FC<PreviewToolbarProps> = (props) => {
  const { editMode, viewScheme, onToggleEdit, onToggleScheme, onSave, onPrint, onBack } = props;

  return (
    <div className="w-full max-w-4xl flex justify-between items-center mb-8 px-4 no-print animate-in fade-in slide-in-from-top-4 duration-700">
      <button 
        onClick={onBack} 
        className="text-white font-black text-xs uppercase tracking-widest hover:text-blue-400 transition flex items-center gap-2 group"
      >
        <span className="group-hover:-translate-x-1 transition-transform">←</span> 
        Workspace Hub
      </button>
      
      <div className="flex gap-3 items-center">
        <button 
          onClick={onToggleEdit} 
          className={`px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest transition shadow-xl transform active:scale-95 ${
            editMode ? 'bg-orange-500 text-white ring-4 ring-orange-500/20' : 'bg-white text-slate-800 hover:bg-slate-100'
          }`}
        >
          {editMode ? 'Finish Editing' : '✎ Edit Paper'}
        </button>
        
        {/* View Toggle Group */}
        <div className="bg-white p-1 rounded-2xl shadow-xl flex">
          <button 
            onClick={() => viewScheme && onToggleScheme()} 
            className={`px-4 py-2 rounded-xl font-black text-[10px] uppercase tracking-widest transition ${
              !viewScheme ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-700'
            }`}
          >
            Question Paper
          </button>
          <button 
            onClick={() => !viewScheme && onToggleScheme()} 
            className={`px-4 py-2 rounded-xl font-black text-[10px] uppercase tracking-widest transition ${
              viewScheme ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-700'
            }`}
          >
            Answer Scheme
          </button>
        </div>
        
        <button 
          onClick={onSave} 
          className="bg-emerald-600 text-white px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-emerald-700 transition shadow-xl transform active:scale-95 flex items-center gap-2"
        >
          Finalize & Archive
        </button>
        
        <button 
          onClick={onPrint} 
          className="bg-blue-600 text-white px-8 py-3 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-blue-700 transition shadow-xl transform active:scale-95 flex items-center gap-2"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 00-2 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
          </svg>
          Print PDF
        </button>
      </div>
    </div>
  );
};
