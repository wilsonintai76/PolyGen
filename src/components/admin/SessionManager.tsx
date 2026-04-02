
import React, { useState } from 'react';
import { Session } from '../../types';
import { api } from '../../services/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { X } from 'lucide-react';

interface SessionManagerProps {
  sessions: Session[];
  onUpdate: () => Promise<void> | void;
  showToast: (message: string, section: string) => void;
}

export const SessionManager: React.FC<SessionManagerProps> = ({ sessions, onUpdate, showToast }) => {
  const [newSessionName, setNewSessionName] = useState('');
  const [loading, setLoading] = useState(false);

  const handleCreate = async () => {
    if (!newSessionName.trim()) return;
    setLoading(true);
    try {
      await api.sessions.create(newSessionName.toUpperCase());
      setNewSessionName('');
      await onUpdate();
      showToast("Session created successfully.", "Session Registry");
    } catch {
      showToast("Failed to create session.", "Session Registry");
    } finally {
      setLoading(false);
    }
  };

  const handleActivate = async (id: string) => {
    setLoading(true);
    try {
      await api.sessions.activate(id);
      await onUpdate();
      showToast("Session activated successfully.", "Session Registry");
    } catch {
      showToast("Failed to activate session.", "Session Registry");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    setLoading(true);
    try {
      await api.sessions.delete(id);
      await onUpdate();
      showToast("Session deleted successfully.", "Session Registry");
    } catch {
      showToast("Failed to delete session.", "Session Registry");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-10 max-w-7xl mx-auto animate-in fade-in duration-500">
      <header className="mb-12">
        <h2 className="text-4xl font-black text-slate-900 tracking-tight uppercase">Session Registry</h2>
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
            <Input 
              className="w-full border-2 border-slate-50 bg-slate-50/50 h-14 rounded-2xl px-4 text-sm font-black outline-none focus-visible:ring-blue-400 transition" 
              placeholder="e.g. SESSION II: 2025/2026"
              value={newSessionName}
              onChange={e => setNewSessionName(e.target.value)}
              disabled={loading}
            />
            <Button 
              onClick={handleCreate}
              disabled={loading || !newSessionName.trim()}
              className="w-full bg-blue-600 text-white font-black h-14 rounded-2xl shadow-xl hover:bg-blue-700 transition active:scale-95 uppercase tracking-widest text-xs disabled:opacity-50"
            >
              {loading ? 'Processing...' : 'Create Session'}
            </Button>
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
                <Button 
                  variant={session.isActive ? "default" : "secondary"}
                  onClick={() => !session.isActive && handleActivate(session.id)}
                  disabled={loading || session.isActive}
                  className={`px-6 h-10 rounded-xl text-[10px] font-black uppercase tracking-widest transition shadow-sm ${
                    session.isActive 
                      ? 'bg-emerald-500 text-white shadow-emerald-500/20 opacity-100 hover:bg-emerald-600' 
                      : 'bg-blue-50 text-blue-600 hover:bg-blue-100'
                  }`}
                >
                  {session.isActive ? 'Activated' : 'Activate'}
                </Button>
                <Button 
                  variant="ghost"
                  size="icon"
                  onClick={() => handleDelete(session.id)}
                  disabled={loading || session.isActive}
                  className="w-10 h-10 rounded-xl flex items-center justify-center text-slate-300 hover:text-rose-500 hover:bg-rose-50 transition disabled:opacity-0 disabled:pointer-events-none"
                >
                  <X className="h-5 w-5" />
                </Button>
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
