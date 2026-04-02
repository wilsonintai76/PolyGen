import React from 'react';
import { PaperVersion } from '../../types';

interface VersionHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  history: PaperVersion[];
  onRevert: (version: PaperVersion) => void;
  onView?: (version: PaperVersion) => void;
}

export const VersionHistoryModal: React.FC<VersionHistoryModalProps> = ({ isOpen, onClose, history, onRevert, onView }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[80vh] flex flex-col">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center">
          <h2 className="text-xl font-black text-slate-800">Version History</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div className="p-6 overflow-y-auto flex-1">
          {history.length === 0 ? (
            <div className="text-center text-slate-500 py-8">
              No version history available.
            </div>
          ) : (
            <div className="space-y-4">
              {history.map((version) => (
                <div key={version.id} className="border border-slate-200 rounded-xl p-4 flex justify-between items-center hover:border-blue-300 transition">
                  <div>
                    <div className="font-bold text-slate-800 flex items-center gap-2">
                      {version.action}
                    </div>
                    <div className="text-sm text-slate-500 mt-1">
                      {new Date(version.timestamp).toLocaleString()} by {version.savedBy}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {onView && (
                      <button
                        onClick={() => onView(version)}
                        className="px-4 py-2 bg-slate-50 text-slate-600 font-bold text-xs uppercase tracking-widest rounded-lg hover:bg-slate-100 transition"
                      >
                        View
                      </button>
                    )}
                    <button
                      onClick={() => onRevert(version)}
                      className="px-4 py-2 bg-blue-50 text-blue-600 font-bold text-xs uppercase tracking-widest rounded-lg hover:bg-blue-100 transition"
                    >
                      Revert
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
