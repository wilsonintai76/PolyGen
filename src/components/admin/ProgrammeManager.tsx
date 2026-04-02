
import React, { useState, useEffect } from 'react';
import { Programme, Department, User } from '../../types';
import { api } from '../../services/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Pencil, Trash2, Plus, RefreshCw, X } from 'lucide-react';

interface ProgrammeManagerProps {
  departments: Department[];
  programmes: Programme[];
  onUpdate: () => void;
  showToast?: (message: string, section: string) => void;
}

export const ProgrammeManager: React.FC<ProgrammeManagerProps> = ({ departments, programmes, onUpdate, showToast }) => {
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProg, setEditingProg] = useState<Programme | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [users, setUsers] = useState<User[]>([]);

  // Form state
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [deptId, setDeptId] = useState('');
  const [headOfProgramme, setHeadOfProgramme] = useState('');

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const allUsers = await api.users.list();
        setUsers(allUsers);
      } catch (error) {
        console.error("Failed to load users", error);
      }
    };
    fetchUsers();
  }, []);

  const openModal = (prog?: Programme) => {
    if (prog) {
      setEditingProg(prog);
      setName(prog.name);
      setCode(prog.code);
      setDeptId(prog.deptId);
      setHeadOfProgramme(prog.headOfProgramme || '');
    } else {
      setEditingProg(null);
      setName('');
      setCode('');
      setDeptId('');
      setHeadOfProgramme('');
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !code || !deptId) return;
    setLoading(true);
    try {
      if (editingProg) {
        await api.programmes.save({ ...editingProg, name, code, deptId, headOfProgramme });
      } else {
        await api.programmes.save({ id: '', name, code, deptId, headOfProgramme });
      }
      onUpdate();
      setIsModalOpen(false);
      if (showToast) showToast("Programme saved successfully!", "Programme Registry");
    } catch (err: unknown) {
      console.error("Failed to save programme:", err);
      const msg = err instanceof Error ? err.message : 'Unknown error';
      if (showToast) showToast(`Failed to save programme: ${msg}`, "Programme Registry");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingId) return;
    setLoading(true);
    try {
      await api.programmes.delete(deletingId);
      onUpdate();
      setDeletingId(null);
      if (showToast) showToast("Programme deleted successfully!", "Programme Registry");
    } catch (err: unknown) {
      console.error("Failed to delete programme:", err);
      const msg = err instanceof Error ? err.message : 'Unknown error';
      if (showToast) showToast(`Failed to delete programme: ${msg}`, "Programme Registry");
    } finally {
      setLoading(false);
    }
  };

  const getDeptName = (id: string) => departments.find(d => d.id === id)?.name || 'Unknown Department';

  return (
    <div className="p-10 max-w-7xl mx-auto animate-in fade-in duration-500">
      <div className="flex justify-between items-end mb-10">
        <div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight uppercase">Programme Registry</h2>
          <p className="text-slate-500 font-bold uppercase text-[11px] tracking-widest mt-1">Manage academic programmes and department affiliations</p>
        </div>
        <div className="flex gap-3">
          <Button 
            variant="outline"
            onClick={() => onUpdate()}
            className="bg-white text-slate-600 px-4 py-6 rounded-xl font-bold border border-slate-200 hover:bg-slate-50 transition active:scale-95 text-xs uppercase tracking-widest flex items-center gap-2"
            title="Refresh Data"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh
          </Button>
          <Button 
            onClick={() => openModal()}
            className="bg-slate-900 text-white px-6 py-6 rounded-xl font-bold shadow-lg hover:bg-slate-800 transition active:scale-95 text-xs uppercase tracking-widest flex items-center gap-2"
          >
            <Plus className="h-4 w-4" /> Register Programme
          </Button>
        </div>
      </div>

      <div className="bg-white rounded-[24px] shadow-sm border border-slate-200 overflow-hidden">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-100">
              <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Programme Code</th>
              <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Full Name</th>
              <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Head of Programme</th>
              <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Affiliation</th>
              <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {programmes.map((prog) => (
              <tr key={prog.id} className="hover:bg-slate-50 transition">
                <td className="p-6">
                  <div className="w-16 h-10 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600 font-black text-sm border border-blue-100 shadow-inner">
                    {prog.code}
                  </div>
                </td>
                <td className="p-6">
                  <div className="font-bold text-sm text-slate-800 uppercase">{prog.name}</div>
                </td>
                <td className="p-6">
                   <div className="text-xs font-bold text-slate-600 uppercase">{users.find(u => u.id === prog.headOfProgramme)?.full_name || 'PENDING ASSIGNMENT'}</div>
                </td>
                <td className="p-6">
                   <div className="text-xs font-bold text-slate-600 uppercase">{getDeptName(prog.deptId)}</div>
                </td>
                <td className="p-6">
                  <div className="flex items-center justify-center gap-2">
                    <Button 
                      variant="ghost"
                      size="icon"
                      onClick={() => openModal(prog)}
                      disabled={loading}
                      className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition disabled:opacity-50"
                      title="Edit Programme"
                    >
                      <Pencil size={16} strokeWidth={2.5} />
                    </Button>
                    <Button 
                      variant="ghost"
                      size="icon"
                      onClick={() => setDeletingId(prog.id)}
                      disabled={loading}
                      className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-red-600 hover:bg-red-50 transition disabled:opacity-50"
                      title="Delete Programme"
                    >
                      <Trash2 size={16} strokeWidth={2.5} />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
            {programmes.length === 0 && (
              <tr>
                <td colSpan={4} className="p-10 text-center text-slate-500 font-bold text-sm">No programmes registered.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="bg-slate-900 p-6 text-white flex justify-between items-center">
              <div>
                <h3 className="text-xl font-black tracking-tight uppercase">{editingProg ? 'Edit Programme' : 'Register Programme'}</h3>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">{editingProg ? 'Update details' : 'Add new programme'}</p>
              </div>
              <Button variant="ghost" size="icon" onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white hover:bg-slate-800 transition">
                <X className="h-6 w-6" />
              </Button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="space-y-2">
                <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Parent Department</Label>
                <select 
                  required
                  className="w-full bg-slate-50 border-2 border-slate-100 h-12 px-4 rounded-xl outline-none focus-visible:ring-blue-500 font-bold text-slate-700 transition"
                  value={deptId}
                  onChange={(e) => setDeptId(e.target.value)}
                >
                  <option value="">-- Select Department --</option>
                  {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                </select>
              </div>

              <div className="space-y-2">
                <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Programme Code</Label>
                <Input 
                  type="text" 
                  required
                  className="w-full bg-slate-50 border-2 border-slate-100 h-12 rounded-xl outline-none focus-visible:ring-blue-500 font-bold text-slate-700 transition"
                  placeholder="e.g. DKM"
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                />
              </div>

              <div className="space-y-2">
                <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Full Name</Label>
                <Input 
                  type="text" 
                  required
                  className="w-full bg-slate-50 border-2 border-slate-100 h-12 rounded-xl outline-none focus-visible:ring-blue-500 font-bold text-slate-700 transition"
                  placeholder="e.g. Diploma in Mechanical Engineering"
                  value={name}
                  onChange={(e) => setName(e.target.value.toUpperCase())}
                />
              </div>

              <div className="space-y-2 relative">
                <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Head of Programme (Optional)</Label>
                <Input
                  type="text"
                  className="w-full bg-slate-50 border-2 border-slate-100 h-12 rounded-xl outline-none focus-visible:ring-blue-500 font-bold text-slate-700 transition"
                  placeholder="Search and select staff..."
                  value={
                    headOfProgramme
                      ? users.find(u => u.id === headOfProgramme)?.full_name || headOfProgramme
                      : ''
                  }
                  onChange={(e) => {
                    const val = e.target.value;
                    // If user clears the input, clear the selection
                    if (!val) setHeadOfProgramme('');
                    // We don't update headOfProgramme on typing to avoid breaking the ID reference,
                    // but we can let them type to filter if we implement a custom dropdown.
                    // For simplicity, we use a datalist.
                  }}
                  list="staff-list"
                  onInput={(e) => {
                    const val = e.currentTarget.value;
                    const matchedUser = users.find(u => u.full_name === val || u.id === val || u.email === val);
                    if (matchedUser) {
                      setHeadOfProgramme(matchedUser.id);
                    }
                  }}
                />
                <datalist id="staff-list">
                  {users.map(u => (
                    <option key={u.id} value={u.full_name}>{u.full_name} ({u.email})</option>
                  ))}
                </datalist>
              </div>

              <div className="flex gap-3 pt-4">
                <Button 
                  type="button"
                  variant="outline"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 bg-slate-100 text-slate-600 font-bold h-12 rounded-xl hover:bg-slate-200 transition text-sm uppercase tracking-wider"
                >
                  Cancel
                </Button>
                <Button 
                  type="submit"
                  disabled={loading || !name || !code || !deptId}
                  className="flex-1 bg-blue-600 text-white font-bold h-12 rounded-xl shadow-lg shadow-blue-500/30 hover:bg-blue-700 transition active:scale-95 disabled:opacity-50 text-sm uppercase tracking-wider"
                >
                  {loading ? 'Processing...' : (editingProg ? 'Save Changes' : 'Add Programme')}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {deletingId && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden animate-in zoom-in-95 duration-300 p-6 text-center">
            <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <Trash2 size={32} />
            </div>
            <h3 className="text-xl font-black tracking-tight uppercase mb-2">Confirm Deletion</h3>
            <p className="text-sm text-slate-500 font-bold mb-6">Are you sure you want to delete this programme? This action cannot be undone.</p>
            <div className="flex gap-3">
              <Button 
                variant="outline"
                onClick={() => setDeletingId(null)}
                className="flex-1 bg-slate-100 text-slate-600 font-bold h-12 rounded-xl hover:bg-slate-200 transition text-sm uppercase tracking-wider"
              >
                Cancel
              </Button>
              <Button 
                variant="destructive"
                onClick={handleDelete}
                disabled={loading}
                className="flex-1 bg-red-600 text-white font-bold h-12 rounded-xl shadow-lg shadow-red-500/30 hover:bg-red-700 transition active:scale-95 disabled:opacity-50 text-sm uppercase tracking-wider"
              >
                {loading ? 'Deleting...' : 'Delete'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
