import React, { useState } from 'react';
import { User, Department } from '../../types';
import { api } from '../../services/api';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';

interface UserProfileModalProps {
  user: User;
  onClose: () => void;
  onUpdate: (updatedUser: User) => void;
  isMandatory?: boolean;
  departments?: Department[];
}

const POSITIONS = [
  "Lecturer",
  "Course Coordinator",
  "Head Of Programme",
  "Head Of Department"
];

export const UserProfileModal: React.FC<UserProfileModalProps> = ({ user, onClose, onUpdate, isMandatory, departments = [] }) => {
  const [fullName, setFullName] = useState(user.full_name);
  const [position, setPosition] = useState(user.position || POSITIONS[0]);
  const [deptId, setDeptId] = useState(user.deptId || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      if (isMandatory && (!position || !deptId)) {
        throw new Error("Please select your position and department.");
      }

      let mappedRole: "Administrator" | "Creator" | "Reviewer" | "Endorser" | "Contributor" = "Creator";
      if (position === "Course Coordinator") mappedRole = "Reviewer";
      if (position === "Head Of Programme") mappedRole = "Endorser";
      if (position === "Head Of Department") mappedRole = "Endorser";

      const updateData: Partial<User> = {
        full_name: fullName.toUpperCase(),
        position,
        deptId,
        role: mappedRole
      };

      const response = await api.users.updateProfile(user.id, updateData);
      onUpdate(response.user);
      onClose();
    } catch (err) {
      setError((err as Error).message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-300">
        <div className="bg-slate-900 p-6 text-white flex justify-between items-center">
          <div>
            <h3 className="text-xl font-black tracking-tight uppercase">
              {isMandatory ? 'Complete Your Profile' : 'Edit Profile'}
            </h3>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">
              {isMandatory ? 'Required for first-time setup' : 'Update your details'}
            </p>
          </div>
          {!isMandatory && (
            <Button variant="ghost" size="icon" onClick={onClose} className="text-slate-400 hover:text-white transition">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </Button>
          )}
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="space-y-2">
            <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Full Name</Label>
            <Input 
              type="text" 
              required
              className="w-full bg-slate-50 border-2 border-slate-100 p-3 rounded-xl outline-none focus:border-blue-500 font-bold text-slate-700 transition"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Position</Label>
              <select 
                required
                className="w-full bg-slate-50 border-2 border-slate-100 p-3 rounded-xl outline-none focus:border-blue-500 font-bold text-slate-700 transition text-sm"
                value={position}
                onChange={(e) => setPosition(e.target.value)}
              >
                {POSITIONS.map(p => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Department</Label>
              <select 
                required
                className="w-full bg-slate-50 border-2 border-slate-100 p-3 rounded-xl outline-none focus:border-blue-500 font-bold text-slate-700 transition text-sm"
                value={deptId}
                onChange={(e) => setDeptId(e.target.value)}
              >
                <option value="">Select</option>
                {departments.map(d => (
                  <option key={d.id} value={d.id}>{d.name.split('OF').pop()?.trim() || d.name}</option>
                ))}
              </select>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 text-red-500 text-xs p-3 rounded-xl border border-red-100 flex items-center gap-2 font-bold">
              <span>⚠️</span> {error}
            </div>
          )}
          {success && (
            <div className="bg-emerald-50 text-emerald-600 text-xs p-3 rounded-xl border border-emerald-100 flex items-center gap-2 font-bold">
              <span>✅</span> {success}
            </div>
          )}

          <div className="flex gap-3 pt-4">
            {!isMandatory && (
              <Button 
                type="button"
                variant="outline"
                onClick={onClose}
                className="flex-1 text-slate-600 font-bold py-6 rounded-xl hover:bg-slate-200 transition text-sm uppercase tracking-wider"
              >
                Cancel
              </Button>
            )}
            <Button 
              type="submit"
              disabled={loading}
              className={`w-full bg-blue-600 text-white font-bold py-6 rounded-xl shadow-lg shadow-blue-500/30 hover:bg-blue-700 transition active:scale-95 disabled:opacity-50 text-sm uppercase tracking-wider ${isMandatory ? '' : 'flex-1'}`}
            >
              {loading ? 'Saving...' : (isMandatory ? 'Complete Setup' : 'Save Changes')}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
