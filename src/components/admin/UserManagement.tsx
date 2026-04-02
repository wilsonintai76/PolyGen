
import React, { useState, useEffect } from 'react';
import { User, Department, Programme } from '../../types';
import { api } from '../../services/api';

import { Pencil, Trash2, Plus, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface UserManagementProps {
  showToast?: (message: string, section: string) => void;
}

export const UserManagement: React.FC<UserManagementProps> = ({ showToast }) => {
  const [staff, setStaff] = useState<User[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [programmes, setProgrammes] = useState<Programme[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  // Filters
  const [filterDept, setFilterDept] = useState<string>('');
  const [filterProg, setFilterProg] = useState<string>('');

  // Form state
  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [role, setRole] = useState<'Administrator' | 'Creator' | 'Reviewer' | 'Endorser' | 'Contributor'>('Creator');
  const [position, setPosition] = useState('');
  const [deptId, setDeptId] = useState('');
  const [programmeId, setProgrammeId] = useState('');

  const [deletingUser, setDeletingUser] = useState<string | null>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [users, depts, progs] = await Promise.all([
        api.users.list(),
        api.departments.list(),
        api.programmes.list()
      ]);
      setStaff(users);
      setDepartments(depts);
      setProgrammes(progs);
    } catch (err) {
      console.error("Failed to load data", err);
      if (showToast) showToast("Failed to load staff directory", "Staff Directory");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingUser) return;
    try {
      await api.users.delete(deletingUser);
      setStaff(staff.filter(u => u.id !== deletingUser));
      setDeletingUser(null);
      if (showToast) showToast("User deleted successfully", "Staff Directory");
    } catch (err) {
      const msg = (err as Error)?.message || "Failed to delete user.";
      if (showToast) showToast(msg, "Staff Directory");
    }
  };

  const openModal = (user?: User) => {
    if (user) {
      setEditingUser(user);
      setEmail(user.email || '');
      setFullName(user.full_name);
      setRole(user.role);
      setPosition(user.position);
      setDeptId(user.deptId || '');
      setProgrammeId(user.programmeId || '');
    } else {
      setEditingUser(null);
      setEmail('');
      setFullName('');
      setRole('Creator');
      setPosition('');
      setDeptId('');
      setProgrammeId('');
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      if (editingUser) {
        const updateData: Partial<User> = {
          full_name: fullName.toUpperCase(),
          role,
          position,
          deptId: deptId || undefined,
          programmeId: programmeId || undefined
        };
        const res = await api.users.updateProfile(editingUser.id, updateData);
        setStaff(staff.map(u => u.id === editingUser.id ? res.user : u));
        if (showToast) showToast("User profile updated successfully", "Staff Directory");
      } else {
        const msg = "Users must register themselves via the login page. You can then edit their roles here.";
        if (showToast) showToast(msg, "Staff Directory");
      }
      setIsModalOpen(false);
    } catch (error) {
      console.error("User save failed:", error);
      const msg = (error as Error).message || "Failed to save user.";
      if (showToast) showToast(msg, "Staff Directory");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) return <div className="p-10 text-center">Loading staff directory...</div>;

  const filteredStaff = staff.filter(user => {
    if (filterDept && user.deptId !== filterDept) return false;
    if (filterProg && user.programmeId !== filterProg) return false;
    return true;
  });

  return (
    <div className="p-10 max-w-7xl mx-auto animate-in fade-in duration-500">
      <div className="flex justify-between items-end mb-10">
        <div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight uppercase">Staff Directory</h2>
          <p className="text-slate-500 font-bold uppercase text-[11px] tracking-widest mt-1">Manage academic staff access and hierarchy</p>
        </div>
        <Button 
          onClick={() => openModal()}
          className="bg-slate-900 text-white px-6 py-6 rounded-xl font-bold shadow-lg hover:bg-slate-800 transition active:scale-95 text-xs uppercase tracking-widest flex items-center gap-2"
        >
          <Plus className="h-4 w-4" /> Register New Staff
        </Button>
      </div>

      <div className="flex gap-4 mb-6">
        <div className="flex-1">
          <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-1 block">Filter by Department</Label>
          <select
            className="w-full bg-white border-2 border-slate-100 h-12 px-4 rounded-xl outline-none focus-visible:ring-blue-500 font-bold text-slate-700 transition"
            value={filterDept}
            onChange={(e) => {
              setFilterDept(e.target.value);
              setFilterProg(''); // Reset programme filter when department changes
            }}
          >
            <option value="">All Departments</option>
            {departments.map(d => (
              <option key={d.id} value={d.id}>{d.name}</option>
            ))}
          </select>
        </div>
        <div className="flex-1">
          <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-1 block">Filter by Programme</Label>
          <select
            className="w-full bg-white border-2 border-slate-100 h-12 px-4 rounded-xl outline-none focus-visible:ring-blue-500 font-bold text-slate-700 transition"
            value={filterProg}
            onChange={(e) => setFilterProg(e.target.value)}
            disabled={!filterDept}
          >
            <option value="">All Programmes</option>
            {programmes
              .filter(p => !filterDept || p.deptId === filterDept)
              .map(p => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="bg-white rounded-[24px] shadow-sm border border-slate-200 overflow-hidden">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-100">
              <th className="p-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">Staff Details</th>
              <th className="p-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">Department & Programme</th>
              <th className="p-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">Official Position</th>
              <th className="p-3 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredStaff.map((user, idx) => (
              <tr key={idx} className="hover:bg-slate-50 transition">
                <td className="p-3">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <div 
                        className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-black cursor-help ${
                          user.role === 'Administrator' ? 'bg-red-100 text-red-600' :
                          user.role === 'Endorser' ? 'bg-emerald-100 text-emerald-600' :
                          user.role === 'Reviewer' ? 'bg-purple-100 text-purple-600' :
                          user.role === 'Contributor' ? 'bg-amber-100 text-amber-600' :
                          'bg-blue-100 text-blue-600'
                        }`}
                        title={user.role}
                      >
                        {user.role.charAt(0)}
                      </div>
                      <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-white" title="Active"></div>
                    </div>
                    <div>
                      <div className="font-bold text-sm text-slate-800 leading-tight">{user.full_name}</div>
                      <div className="text-[10px] text-slate-400 font-bold uppercase">{user.email}</div>
                    </div>
                  </div>
                </td>
                <td className="p-3">
                   <div className="text-xs font-bold text-slate-600">
                     {departments.find(d => d.id === user.deptId)?.name || '-'}
                   </div>
                   <div className="text-[10px] text-slate-400 font-bold uppercase mt-0.5">
                     {programmes.find(p => p.id === user.programmeId)?.name || '-'}
                   </div>
                </td>
                <td className="p-3">
                   <div className="text-xs font-bold text-slate-600">{user.position}</div>
                </td>
                <td className="p-3">
                  <div className="flex items-center justify-center gap-2">
                    <Button 
                      variant="ghost"
                      size="icon"
                      onClick={() => openModal(user)}
                      className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition"
                      title="Edit Profile"
                    >
                      <Pencil size={16} strokeWidth={2.5} />
                    </Button>
                    <Button 
                      variant="ghost"
                      size="icon"
                      onClick={() => setDeletingUser(user.id)}
                      className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-red-600 hover:bg-red-50 transition"
                      title="Delete User"
                    >
                      <Trash2 size={16} strokeWidth={2.5} />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      <div className="mt-6 grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="bg-blue-50 border border-blue-100 p-4 rounded-2xl">
           <div className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-1">Creator</div>
           <p className="text-[10px] text-blue-800 leading-relaxed font-bold">Lecturer role. Authorized to develop blueprints, draft questions, and generate final papers.</p>
        </div>
        <div className="bg-purple-50 border border-purple-100 p-4 rounded-2xl">
           <div className="text-[10px] font-black text-purple-400 uppercase tracking-widest mb-1">Reviewer</div>
           <p className="text-[10px] text-purple-800 leading-relaxed font-bold">Course Coordinator role. Validates quality, alignment with CLOs, and ensures formatting standards are met.</p>
        </div>
        <div className="bg-emerald-50 border border-emerald-100 p-4 rounded-2xl">
           <div className="text-[10px] font-black text-emerald-400 uppercase tracking-widest mb-1">Endorser</div>
           <p className="text-[10px] text-emerald-800 leading-relaxed font-bold">Head of Programme / Dept. Provides academic approval and final authority for departmental assessments.</p>
        </div>
        <div className="bg-amber-50 border border-amber-100 p-4 rounded-2xl">
           <div className="text-[10px] font-black text-amber-500 uppercase tracking-widest mb-1">Contributor</div>
           <p className="text-[10px] text-amber-800 leading-relaxed font-bold">Subject Matter Expert. Contributes questions to the shared Question Bank.</p>
        </div>
        <div className="bg-rose-50 border border-rose-100 p-4 rounded-2xl">
           <div className="text-[10px] font-black text-rose-400 uppercase tracking-widest mb-1">Administrator</div>
           <p className="text-[10px] text-rose-800 leading-relaxed font-bold">System management. Authorized to manage users, departments, and institutional settings.</p>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="bg-slate-900 p-6 text-white flex justify-between items-center">
              <div>
                <h3 className="text-xl font-black tracking-tight uppercase">{editingUser ? 'Edit Staff' : 'Register Staff'}</h3>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">{editingUser ? 'Update details' : 'Add new member'}</p>
              </div>
              <Button variant="ghost" size="icon" onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white hover:bg-slate-800 transition">
                <X className="h-6 w-6" />
              </Button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="space-y-2">
                <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Email Address</Label>
                <Input 
                  type="email" 
                  required
                  disabled={!!editingUser}
                  className="w-full bg-slate-50 border-2 border-slate-100 h-12 rounded-xl outline-none focus-visible:ring-blue-500 font-bold text-slate-700 transition disabled:opacity-50"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Full Name</Label>
                <Input 
                  type="text" 
                  required
                  className="w-full bg-slate-50 border-2 border-slate-100 h-12 rounded-xl outline-none focus-visible:ring-blue-500 font-bold text-slate-700 transition"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Department</Label>
                  <select 
                    className="w-full bg-slate-50 border-2 border-slate-100 h-12 px-4 rounded-xl outline-none focus-visible:ring-blue-500 font-bold text-slate-700 transition"
                    value={deptId}
                    onChange={(e) => {
                      setDeptId(e.target.value);
                      setProgrammeId(''); // Reset programme when department changes
                    }}
                  >
                    <option value="">-- None --</option>
                    {departments.map(d => (
                      <option key={d.id} value={d.id}>{d.name?.split('OF').pop()?.trim() || d.name || 'Unknown'}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Programme</Label>
                  <select 
                    className="w-full bg-slate-50 border-2 border-slate-100 h-12 px-4 rounded-xl outline-none focus-visible:ring-blue-500 font-bold text-slate-700 transition"
                    value={programmeId}
                    onChange={(e) => setProgrammeId(e.target.value)}
                    disabled={!deptId}
                  >
                    <option value="">-- None --</option>
                    {programmes
                      .filter(p => String(p.deptId) === String(deptId))
                      .map(p => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                    {programmes.filter(p => String(p.deptId) === String(deptId)).length === 0 && (
                      <option disabled>No programmes found</option>
                    )}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">System Role</Label>
                  <select 
                    required
                    className="w-full bg-slate-50 border-2 border-slate-100 h-12 px-4 rounded-xl outline-none focus-visible:ring-blue-500 font-bold text-slate-700 transition"
                    value={role}
                    onChange={(e) => setRole(e.target.value as User['role'])}
                  >
                    <option value="Creator">Creator</option>
                    <option value="Reviewer">Reviewer</option>
                    <option value="Endorser">Endorser</option>
                    <option value="Contributor">Contributor</option>
                    <option value="Administrator">Administrator</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Official Position</Label>
                  <select 
                    required
                    className="w-full bg-slate-50 border-2 border-slate-100 h-12 px-4 rounded-xl outline-none focus-visible:ring-blue-500 font-bold text-slate-700 transition"
                    value={position}
                    onChange={(e) => setPosition(e.target.value)}
                  >
                    <option value="">-- Select Position --</option>
                    <option value="Lecturer">Lecturer</option>
                    <option value="Course Coordinator">Course Coordinator</option>
                    <option value="Head Of Programme">Head Of Programme</option>
                    <option value="Head Of Department">Head Of Department</option>
                  </select>
                </div>
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
                  disabled={isSubmitting}
                  className="flex-1 bg-blue-600 text-white font-bold h-12 rounded-xl shadow-lg shadow-blue-500/30 hover:bg-blue-700 transition active:scale-95 text-sm uppercase tracking-wider disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      Processing...
                    </>
                  ) : (editingUser ? 'Save Changes' : 'Register Staff')}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {deletingUser && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden animate-in zoom-in-95 duration-300 p-6 text-center">
            <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <Trash2 size={32} />
            </div>
            <h3 className="text-xl font-black tracking-tight uppercase mb-2">Confirm Deletion</h3>
            <p className="text-sm text-slate-500 font-bold mb-6">Are you sure you want to delete this user? This action cannot be undone.</p>
            <div className="flex gap-3">
              <Button 
                variant="outline"
                onClick={() => setDeletingUser(null)}
                className="flex-1 bg-slate-100 text-slate-600 font-bold h-12 rounded-xl hover:bg-slate-200 transition text-sm uppercase tracking-wider"
              >
                Cancel
              </Button>
              <Button 
                variant="destructive"
                onClick={handleDelete}
                className="flex-1 bg-red-600 text-white font-bold h-12 rounded-xl shadow-lg shadow-red-500/30 hover:bg-red-700 transition active:scale-95 text-sm uppercase tracking-wider"
              >
                Delete
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
