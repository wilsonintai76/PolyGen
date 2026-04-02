
import React, { useState } from 'react';
import { Course, Department, Programme } from '../types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { X } from 'lucide-react';

interface SimpleCourseAddModalProps {
  onSave: (course: Partial<Course>) => void;
  onCancel: () => void;
  departments: Department[];
  programmes: Programme[];
  showToast?: (message: string, section: string) => void;
}

export const SimpleCourseAddModal: React.FC<SimpleCourseAddModalProps> = ({ 
  onSave, onCancel, departments, programmes, showToast 
}) => {
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    deptId: '',
    programmeId: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.code || !formData.name || !formData.deptId || !formData.programmeId) {
      if (showToast) showToast("Please fill in all required fields.", "Error");
      return;
    }
    onSave({
      ...formData,
      clos: { 'CLO 1': '' },
      da: {},
      topics: [],
      assessmentPolicies: []
    });
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-300">
      <div className="bg-white rounded-[40px] shadow-2xl w-full max-w-xl overflow-hidden flex flex-col border border-slate-200">
        <div className="px-10 py-8 border-b flex justify-between items-center bg-slate-50 shrink-0">
          <div>
            <h3 className="text-2xl font-black text-slate-800 uppercase tracking-tight">Register New Course</h3>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Stage 1: Initial Shell Creation</p>
          </div>
          <Button variant="ghost" size="icon" onClick={onCancel} className="w-10 h-10 rounded-full text-slate-500 hover:bg-slate-200 transition">
            <X className="w-5 h-5" />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="p-10 space-y-8">
          <div className="space-y-6">
            <div className="grid grid-cols-1 gap-6">
              <div className="space-y-2">
                <Label className="block text-[10px] font-black text-blue-500 uppercase tracking-widest ml-1">Parent Department</Label>
                <select 
                  className="flex h-12 w-full items-center justify-between rounded-2xl border-2 border-slate-100 bg-white px-4 py-2 text-sm font-bold text-slate-700 shadow-sm ring-offset-background placeholder:text-muted-foreground focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition"
                  value={formData.deptId}
                  onChange={e => setFormData({...formData, deptId: e.target.value, programmeId: ''})}
                  required
                >
                  <option value="">-- Select Department --</option>
                  {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                </select>
              </div>
              <div className="space-y-2">
                <Label className="block text-[10px] font-black text-blue-500 uppercase tracking-widest ml-1">Target Programme</Label>
                <select 
                  className="flex h-12 w-full items-center justify-between rounded-2xl border-2 border-slate-100 bg-white px-4 py-2 text-sm font-bold text-slate-700 shadow-sm ring-offset-background placeholder:text-muted-foreground focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition"
                  value={formData.programmeId}
                  disabled={!formData.deptId}
                  onChange={e => setFormData({...formData, programmeId: e.target.value})}
                  required
                >
                  <option value="">-- Select Programme --</option>
                  {programmes.filter(p => p.deptId === formData.deptId).map(p => <option key={p.id} value={p.id}>[{p.code}] {p.name}</option>)}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-6">
              <div className="space-y-2">
                <Label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Course Code</Label>
                <Input 
                  className="h-12 border-2 border-slate-50 rounded-2xl px-4 font-black text-slate-700 bg-slate-50 shadow-inner focus-visible:ring-blue-400 focus-visible:border-blue-400 transition" 
                  value={formData.code} 
                  onChange={e => setFormData({...formData, code: e.target.value.toUpperCase()})} 
                  placeholder="e.g. DJJ10243"
                  required 
                />
              </div>
              <div className="space-y-2">
                <Label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Course Name</Label>
                <Input 
                  className="h-12 border-2 border-slate-50 rounded-2xl px-4 font-black text-slate-700 bg-slate-50 shadow-inner focus-visible:ring-blue-400 focus-visible:border-blue-400 transition" 
                  value={formData.name} 
                  onChange={e => setFormData({...formData, name: e.target.value.toUpperCase()})} 
                  placeholder="e.g. WORKSHOP TECHNOLOGY"
                  required 
                />
              </div>
            </div>
          </div>

          <div className="pt-6 flex gap-4">
            <Button type="button" variant="ghost" onClick={onCancel} className="px-8 py-6 text-slate-400 font-black uppercase text-[11px] tracking-widest hover:text-rose-500 hover:bg-rose-50 rounded-3xl transition">Cancel</Button>
            <Button type="submit" className="flex-grow bg-blue-600 text-white font-black py-6 rounded-3xl shadow-2xl hover:bg-blue-700 transition uppercase tracking-[0.2em] text-sm flex items-center justify-center gap-3 active:scale-[0.98]">
              Create Course Shell
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
