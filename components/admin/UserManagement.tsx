
import React, { useState } from 'react';
import { User } from '../../types';

// Updated mock data with official designations
const MOCK_STAFF: User[] = [
  { username: 'faizal', full_name: 'AHMAD FAIZAL BIN JAAFAR', role: 'creator', position: 'Lecturer' },
  { username: 'aminah', full_name: 'SITI AMINAH BINTI BAKRI', role: 'reviewer', position: 'Coordinator' },
  { username: 'wong', full_name: 'DR. WONG CHIN WEI', role: 'endorser', position: 'Head of Programme' },
  { username: 'ramli', full_name: 'TN. HJ. RAMLI BIN KASSIM', role: 'endorser', position: 'Head of Department' },
  { username: 'admin', full_name: 'SYSTEM ADMINISTRATOR', role: 'admin', position: 'IT Unit Administrator' }
];

export const UserManagement: React.FC<{ currentUser?: User }> = ({ currentUser }) => {
  const [staff, setStaff] = useState<User[]>(MOCK_STAFF);

  return (
    <div className="p-10 max-w-7xl mx-auto animate-in fade-in duration-500">
      <div className="flex justify-between items-end mb-10">
        <div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight uppercase">Staff Directory</h2>
          <p className="text-slate-500 font-bold uppercase text-[11px] tracking-widest mt-1">Manage academic staff access and hierarchy</p>
        </div>
        <button className="bg-slate-900 text-white px-6 py-3 rounded-xl font-bold shadow-lg hover:bg-slate-800 transition active:scale-95 text-xs uppercase tracking-widest flex items-center gap-2">
          <span>+</span> Register New Staff
        </button>
      </div>

      <div className="bg-white rounded-[24px] shadow-sm border border-slate-200 overflow-hidden">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-100">
              <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Staff Details</th>
              <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Official Position</th>
              <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">System Access</th>
              <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
              <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {staff.map((user, idx) => (
              <tr key={idx} className="hover:bg-slate-50 transition">
                <td className="p-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-500">
                      {user.full_name.charAt(0)}
                    </div>
                    <div>
                      <div className="font-bold text-sm text-slate-800">{user.full_name}</div>
                      <div className="text-[10px] text-slate-400 font-bold uppercase">{user.username}</div>
                    </div>
                  </div>
                </td>
                <td className="p-6">
                   <div className="text-xs font-bold text-slate-600">{user.position}</div>
                </td>
                <td className="p-6">
                  <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wide ${
                    user.role === 'admin' ? 'bg-red-100 text-red-600' :
                    user.role === 'endorser' ? 'bg-emerald-100 text-emerald-600' :
                    user.role === 'reviewer' ? 'bg-purple-100 text-purple-600' :
                    'bg-blue-100 text-blue-600'
                  }`}>
                    {user.role}
                  </span>
                </td>
                <td className="p-6">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                    <span className="text-[10px] font-bold text-slate-500 uppercase">Active</span>
                  </div>
                </td>
                <td className="p-6 text-center">
                  <button className="text-slate-400 hover:text-blue-600 font-bold text-xs uppercase tracking-wider transition">Edit Profile</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-blue-50 border border-blue-100 p-4 rounded-2xl">
           <div className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-1">Lecturer</div>
           <p className="text-[10px] text-blue-800 leading-relaxed font-bold">Creator role. Authorized to develop blueprints, draft questions, and generate final papers.</p>
        </div>
        <div className="bg-purple-50 border border-purple-100 p-4 rounded-2xl">
           <div className="text-[10px] font-black text-purple-400 uppercase tracking-widest mb-1">Coordinator</div>
           <p className="text-[10px] text-purple-800 leading-relaxed font-bold">Reviewer role. Validates quality, alignment with CLOs, and ensures formatting standards are met.</p>
        </div>
        <div className="bg-emerald-50 border border-emerald-100 p-4 rounded-2xl">
           <div className="text-[10px] font-black text-emerald-400 uppercase tracking-widest mb-1">Head of Programme</div>
           <p className="text-[10px] text-emerald-800 leading-relaxed font-bold">Endorser role. Provides mid-level academic approval for specific programme courses.</p>
        </div>
        <div className="bg-rose-50 border border-rose-100 p-4 rounded-2xl">
           <div className="text-[10px] font-black text-rose-400 uppercase tracking-widest mb-1">Head of Dept</div>
           <p className="text-[10px] text-rose-800 leading-relaxed font-bold">Primary Endorser. Final authority for departmental assessments and institutional compliance.</p>
        </div>
      </div>
    </div>
  );
};
