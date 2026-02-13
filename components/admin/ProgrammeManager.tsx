
import React, { useState } from 'react';
import { Programme, Department } from '../../types';

interface ProgrammeManagerProps {
  departments: Department[];
}

export const ProgrammeManager: React.FC<ProgrammeManagerProps> = ({ departments }) => {
  const [programmes, setProgrammes] = useState<Programme[]>([
    { id: 'p1', deptId: '1', name: 'DIPLOMA IN MECHANICAL ENGINEERING', code: 'DKM' },
    { id: 'p2', deptId: '1', name: 'DIPLOMA IN MECHATRONICS ENGINEERING', code: 'DEM' },
    { id: 'p3', deptId: '2', name: 'DIPLOMA IN INFORMATION TECHNOLOGY (DIGITAL TECHNOLOGY)', code: 'DDT' }
  ]);

  const [newProg, setNewProg] = useState({ name: '', code: '', deptId: '' });

  const addProg = () => {
    if (!newProg.name || !newProg.code || !newProg.deptId) {
      alert("Please fill in all fields including the parent department.");
      return;
    }
    setProgrammes([...programmes, { id: Date.now().toString(), ...newProg }]);
    setNewProg({ name: '', code: '', deptId: '' });
  };

  const getDeptName = (id: string) => departments.find(d => d.id === id)?.name || 'Unknown Department';

  return (
    <div className="p-10 max-w-7xl mx-auto animate-in fade-in duration-500">
      <div className="flex justify-between items-end mb-12">
        <div>
          <h2 className="text-4xl font-black text-slate-900 tracking-tight uppercase">Programme Registry</h2>
          <p className="text-slate-500 font-bold uppercase text-[11px] tracking-widest mt-2">Manage academic programmes and department affiliations</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
        {/* Creation Form */}
        <div className="lg:col-span-1 bg-white p-8 rounded-[40px] shadow-sm border border-slate-100 h-fit sticky top-10">
          <h3 className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-6">Register New Programme</h3>
          <div className="space-y-4">
            <div className="space-y-1">
              <label className="text-[9px] font-black text-slate-400 uppercase ml-1">Parent Department</label>
              <select 
                className="w-full border-2 border-slate-50 bg-slate-50/50 rounded-2xl p-4 text-xs font-bold outline-none focus:border-blue-400 transition"
                value={newProg.deptId}
                onChange={e => setNewProg({...newProg, deptId: e.target.value})}
              >
                <option value="">-- Select Department --</option>
                {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-[9px] font-black text-slate-400 uppercase ml-1">Programme Code</label>
              <input 
                className="w-full border-2 border-slate-50 bg-slate-50/50 rounded-2xl p-4 text-xs font-bold outline-none focus:border-blue-400 transition" 
                placeholder="e.g. DKM"
                value={newProg.code}
                onChange={e => setNewProg({...newProg, code: e.target.value.toUpperCase()})}
              />
            </div>
            <div className="space-y-1">
              <label className="text-[9px] font-black text-slate-400 uppercase ml-1">Full Name</label>
              <input 
                className="w-full border-2 border-slate-50 bg-slate-50/50 rounded-2xl p-4 text-xs font-bold outline-none focus:border-blue-400 transition" 
                placeholder="e.g. Diploma in Mechanical Engineering"
                value={newProg.name}
                onChange={e => setNewProg({...newProg, name: e.target.value})}
              />
            </div>
            <button 
              onClick={addProg}
              className="w-full bg-blue-600 text-white font-black py-4 rounded-2xl shadow-xl hover:bg-blue-700 transition active:scale-95 uppercase tracking-widest text-xs mt-4"
            >
              Add Programme
            </button>
          </div>
        </div>

        {/* List View */}
        <div className="lg:col-span-2 space-y-4">
          {programmes.map(prog => (
            <div key={prog.id} className="bg-white p-8 rounded-[40px] shadow-sm border border-slate-100 flex justify-between items-center group hover:border-blue-200 transition">
              <div className="flex gap-6 items-center">
                <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 font-black text-sm border border-blue-100 shadow-inner shrink-0">
                  {prog.code}
                </div>
                <div>
                  <h4 className="text-lg font-black text-slate-800 uppercase leading-tight">{prog.name}</h4>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Affiliation: {getDeptName(prog.deptId)}</p>
                </div>
              </div>
              <button 
                onClick={() => setProgrammes(programmes.filter(p => p.id !== prog.id))}
                className="w-10 h-10 rounded-xl flex items-center justify-center text-slate-300 hover:text-rose-500 hover:bg-rose-50 transition"
              >
                &times;
              </button>
            </div>
          ))}
          {programmes.length === 0 && (
            <div className="py-20 text-center bg-white rounded-[40px] border-4 border-dashed border-slate-50 flex flex-col items-center">
               <span className="text-4xl mb-2">🎓</span>
               <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">No programmes registered</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
