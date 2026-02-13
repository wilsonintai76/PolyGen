
import React, { useState } from 'react';
import { Department } from '../../types';
import { api } from '../../services/api';

interface DepartmentManagerProps {
  departments: Department[];
  onUpdate: () => void;
}

export const DepartmentManager: React.FC<DepartmentManagerProps> = ({ departments, onUpdate }) => {
  const [newDept, setNewDept] = useState({ name: '', headOfDept: '' });
  const [loading, setLoading] = useState(false);

  const addDept = async () => {
    if (!newDept.name) return;
    setLoading(true);
    try {
      await api.departments.save(newDept as Department);
      setNewDept({ name: '', headOfDept: '' });
      onUpdate();
    } finally {
      setLoading(false);
    }
  };

  const removeDept = async (id: string) => {
    if (!confirm("Are you sure?")) return;
    setLoading(true);
    try {
      await api.departments.delete(id);
      onUpdate();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-10 max-w-7xl mx-auto animate-in fade-in duration-500">
      <div className="flex justify-between items-end mb-12">
        <div>
          <h2 className="text-4xl font-black text-slate-900 tracking-tight uppercase">Department Manager</h2>
          <p className="text-slate-500 font-bold uppercase text-[11px] tracking-widest mt-2">Define top-level organizational structure</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
        <div className="lg:col-span-1 bg-white p-8 rounded-[40px] shadow-sm border border-slate-100 h-fit sticky top-10">
          <h3 className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-6">Create New Department</h3>
          <div className="space-y-4">
            <input 
              className="w-full border-2 border-slate-50 bg-slate-50/50 rounded-2xl p-4 text-xs font-bold outline-none focus:border-blue-400 transition" 
              placeholder="Full Department Name"
              value={newDept.name}
              onChange={e => setNewDept({...newDept, name: e.target.value})}
              disabled={loading}
            />
            <input 
              className="w-full border-2 border-slate-50 bg-slate-50/50 rounded-2xl p-4 text-xs font-bold outline-none focus:border-blue-400 transition" 
              placeholder="Head of Department Name"
              value={newDept.headOfDept}
              onChange={e => setNewDept({...newDept, headOfDept: e.target.value})}
              disabled={loading}
            />
            <button 
              onClick={addDept}
              disabled={loading || !newDept.name}
              className="w-full bg-blue-600 text-white font-black py-4 rounded-2xl shadow-xl hover:bg-blue-700 transition active:scale-95 uppercase tracking-widest text-xs"
            >
              {loading ? 'Processing...' : 'Add Department'}
            </button>
          </div>
        </div>

        <div className="lg:col-span-2 space-y-4">
          {departments.map(dept => (
            <div key={dept.id} className="bg-white p-8 rounded-[40px] shadow-sm border border-slate-100 flex justify-between items-center group hover:border-blue-200 transition">
              <div>
                <h4 className="text-lg font-black text-slate-800 uppercase leading-tight">{dept.name}</h4>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">HOD: {dept.headOfDept || 'PENDING ASSIGNMENT'}</p>
              </div>
              <button 
                onClick={() => removeDept(dept.id)}
                disabled={loading}
                className="w-10 h-10 rounded-xl flex items-center justify-center text-slate-300 hover:text-rose-500 hover:bg-rose-50 transition"
              >
                &times;
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
