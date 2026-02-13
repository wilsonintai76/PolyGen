
import React, { useState } from 'react';
import { Session } from '../../types';
import { api } from '../../services/api';

interface SessionManagerProps {
  sessions: Session[];
  onUpdate: () => void;
}

export const SessionManager: React.FC<SessionManagerProps> = ({ sessions, onUpdate }) => {
  const [newSessionName, setNewSessionName] = useState('');
  const [loading, setLoading] = useState(false);

  const handleCreate = async () => {
    if (!newSessionName.trim()) return;
    setLoading(true);
    try {
      await api.sessions.create(newSessionName.toUpperCase());
      setNewSessionName('');
      onUpdate();
    } finally {
      setLoading(false);
    }
  };

  const handleActivate = async (id: string) => {
    if (!confirm("Activating this session will archive all others. Proceed?")) return;
    setLoading(true);
    try {
      await api.sessions.activate(id);
      onUpdate();
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure? This cannot be undone.")) return;
    setLoading(true);
    try {
      await api.sessions.delete(id);
      onUpdate();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-10 max-w-7xl mx-auto animate-in fade-in duration-500">
      <header className="mb-12">
        <h2 className="text-4xl font-black text-slate-900 tracking-tight uppercase">Session Control</h2>
        <p className="text-slate-500 font-bold uppercase text-[11px] tracking-widest mt-2">Manage institutional academic periods and active assessment cycles</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Creation Box */}
        <div className="lg:col-span-1 bg-white p-8 rounded-[40px] shadow-sm border border-slate-100 h-fit">
          <div className="flex items-center gap-2 mb-6">
            <span className="w-2 h-2 rounded-full bg-blue-500"></span>
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Register New Academic Session</h3>
          </div>
          <div className="space-y-4">
            <input 
              className="w-full border-2 border-slate-50 bg-slate-50/50 rounded-2xl p-4 text-sm font-black outline-none focus:border-blue-400 transition" 
              placeholder="e.g. SESSION II: 2025/2026"
              value={newSessionName}
              onChange={e => setNewSessionName(e.target.value)}
              disabled={loading}
            />
            <button 
              onClick={handleCreate}
              disabled={loading || !newSessionName.trim()}
              className="w-full bg-blue-600 text-white font-black py-4 rounded-2xl shadow-xl hover:bg-blue-700 transition active:scale-95 uppercase tracking-widest text-xs disabled:opacity-50"
            >
              {loading ? 'Processing...' : 'Create Session'}
            </button>
          </div>
          <div className="mt-8 p-4 bg-amber-50 rounded-2xl border border-amber-100">
             <p className="text-[9px] text-amber-700 font-bold leading-relaxed uppercase tracking-tighter">
                Note: Only one session can be active at a time. All paper generations will default to the current active session.
             </p>
          </div>
        </div>

        {/* List Box */}
        <div className="lg:col-span-2 space-y-4">
          {sessions.slice().reverse().map(session => (
            <div key={session.id} className={`bg-white p-8 rounded-[40px] border-2 transition-all flex justify-between items-center group ${
              session.isActive ? 'border-blue-500 shadow-lg' : 'border-slate-50 shadow-sm hover:border-slate-200'
            }`}>
              <div className="flex items-center gap-6">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center font-black text-lg border-2 ${
                  session.isActive ? 'bg-blue-50 border-blue-100 text-blue-600' : 'bg-slate-50 border-slate-100 text-slate-400'
                }`}>
                  {session.isActive ? '⚡' : '📅'}
                </div>
                <div>
                  <h4 className="text-xl font-black text-slate-800 tracking-tight">{session.name}</h4>
                  <div className="flex items-center gap-3 mt-1">
                    {session.isActive ? (
                      <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">Currently Active</span>
                    ) : (
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Archived Session</span>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="flex gap-2">
                {!session.isActive && (
                  <button 
                    onClick={() => handleActivate(session.id)}
                    disabled={loading}
                    className="px-6 py-2.5 rounded-xl bg-blue-50 text-blue-600 text-[10px] font-black uppercase tracking-widest hover:bg-blue-100 transition shadow-sm"
                  >
                    Activate
                  </button>
                )}
                <button 
                  onClick={() => handleDelete(session.id)}
                  disabled={loading || session.isActive}
                  className="w-10 h-10 rounded-xl flex items-center justify-center text-slate-300 hover:text-rose-500 hover:bg-rose-50 transition disabled:opacity-0"
                >
                  &times;
                </button>
              </div>
            </div>
          ))}
          {sessions.length === 0 && (
            <div className="py-20 text-center flex flex-col items-center opacity-30 italic">
               <span className="text-5xl mb-4">⌛</span>
               <p className="text-[11px] font-black uppercase tracking-widest">No sessions defined in the database</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
