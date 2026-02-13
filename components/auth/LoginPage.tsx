
import React, { useState } from 'react';
import { api } from '../../services/api';
import { User, Department } from '../../types';

interface LoginPageProps {
  onLogin: (user: User, token: string) => void;
  departments: Department[];
}

const POSITIONS = [
  "Lecturer",
  "Coordinator",
  "Head of Programme",
  "Head of Department"
];

export const LoginPage: React.FC<LoginPageProps> = ({ onLogin, departments }) => {
  const [isRegister, setIsRegister] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [position, setPosition] = useState(POSITIONS[0]);
  const [deptId, setDeptId] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (isRegister) {
        if (!fullName || !username || !password || !deptId) throw new Error("Please fill all fields, including department.");
        const response = await api.auth.register({ 
          username, 
          full_name: fullName.toUpperCase(), 
          position,
          deptId
        });
        onLogin(response.user, response.token);
      } else {
        const response = await api.auth.login(username, password);
        onLogin(response.user, response.token);
      }
    } catch (err: any) {
      setError(err.message || 'Authentication failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemo = (role: 'creator' | 'reviewer' | 'endorser' | 'admin') => {
    setIsRegister(false);
    setUsername(role);
    setPassword('password');
  };

  const inputClass = "w-full bg-slate-50 border-2 border-slate-100 p-4 rounded-2xl outline-none focus:border-blue-500 font-bold text-slate-700 transition placeholder:text-slate-300";
  const labelClass = "text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1";

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-slate-900 overflow-hidden">
       {/* Left Side - Visual */}
       <div className="hidden md:flex flex-col w-1/2 bg-gradient-to-br from-blue-900 to-slate-900 p-12 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
             {/* Abstract Grid Pattern */}
             <div className="grid grid-cols-6 gap-4 transform -rotate-12 scale-150">
                {Array.from({ length: 40 }).map((_, i) => (
                    <div key={i} className="w-24 h-24 border border-white/20 rounded-xl"></div>
                ))}
             </div>
          </div>
          
          <div className="relative z-10 flex flex-col h-full justify-between">
             <div className="flex items-center gap-4">
                 <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center text-white text-2xl font-black shadow-lg">P</div>
                 <h1 className="text-white font-black text-2xl tracking-tighter">POLY<span className="text-blue-400">GEN</span></h1>
             </div>
             
             <div className="space-y-6">
                <h2 className="text-5xl font-black text-white leading-tight">Secure Academic <br/>Assessment System</h2>
                <p className="text-blue-200 text-lg leading-relaxed max-w-md">
                   A standardized, secure, and collaborative platform for creating, reviewing, and endorsing polytechnic examination papers.
                </p>
                <div className="flex gap-4 pt-4">
                   <div className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-lg border border-white/10 backdrop-blur-sm">
                      <span className="text-xl">🔒</span>
                      <span className="text-xs font-bold text-white uppercase tracking-widest">Confidential</span>
                   </div>
                   <div className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-lg border border-white/10 backdrop-blur-sm">
                      <span className="text-xl">🎓</span>
                      <span className="text-xs font-bold text-white uppercase tracking-widest">Standardized</span>
                   </div>
                </div>
             </div>

             <div className="text-blue-400 text-xs font-mono">
                System Status: <span className="text-emerald-400">● Operational</span>
             </div>
          </div>
       </div>

       {/* Right Side - Auth Form */}
       <div className="flex-1 bg-white flex items-center justify-center p-8 relative overflow-y-auto custom-scrollbar">
          <div className="max-w-md w-full space-y-8 my-10">
             <div className="text-center md:text-left">
                <h3 className="text-3xl font-black text-slate-900 mb-2">
                  {isRegister ? 'Staff Registration' : 'Welcome Back'}
                </h3>
                <p className="text-slate-500">
                  {isRegister ? 'Register your academic staff account to begin.' : 'Please sign in to access your secure workspace.'}
                </p>
             </div>

             <form onSubmit={handleAuth} className="space-y-5">
                {isRegister && (
                  <>
                    <div className="space-y-2">
                       <label className={labelClass}>Full Name (As per Staff Card)</label>
                       <input 
                          type="text" 
                          required
                          className={inputClass}
                          placeholder="e.g. AHMAD FAIZAL BIN JAAFAR"
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                       />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                         <label className={labelClass}>Academic Position</label>
                         <select 
                            required
                            className={inputClass}
                            value={position}
                            onChange={(e) => setPosition(e.target.value)}
                         >
                            {POSITIONS.map(p => (
                              <option key={p} value={p}>{p}</option>
                            ))}
                         </select>
                      </div>
                      <div className="space-y-2">
                         <label className={labelClass}>Department</label>
                         <select 
                            required
                            className={inputClass}
                            value={deptId}
                            onChange={(e) => setDeptId(e.target.value)}
                         >
                            <option value="">-- Choose --</option>
                            {departments.map(d => (
                              <option key={d.id} value={d.id}>{d.name.split('OF').pop()?.trim() || d.name}</option>
                            ))}
                         </select>
                      </div>
                    </div>
                  </>
                )}

                <div className="space-y-2">
                   <label className={labelClass}>Staff ID / Username</label>
                   <input 
                      type="text" 
                      required
                      className={inputClass}
                      placeholder="Enter your ID"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                   />
                </div>
                <div className="space-y-2">
                   <label className={labelClass}>Password</label>
                   <input 
                      type="password" 
                      required
                      className={inputClass}
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                   />
                </div>

                {error && (
                    <div className="bg-red-50 text-red-500 text-sm p-4 rounded-xl border border-red-100 flex items-center gap-2 animate-in shake duration-300">
                        <span>⚠️</span> {error}
                    </div>
                )}

                <button 
                  type="submit" 
                  disabled={loading}
                  className="w-full bg-slate-900 text-white font-black py-5 rounded-2xl shadow-xl hover:bg-slate-800 transition active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      Processing...
                    </>
                  ) : (isRegister ? 'Complete Registration' : 'Sign In to Workspace')}
                </button>

                <div className="text-center pt-2">
                  <button 
                    type="button"
                    onClick={() => { setIsRegister(!isRegister); setError(''); }}
                    className="text-xs font-black text-blue-600 uppercase tracking-widest hover:underline"
                  >
                    {isRegister ? 'Already have an account? Sign In' : "Don't have an account? Self Register"}
                  </button>
                </div>
             </form>

             {/* Quick Demo Section (For Development/Review Only) */}
             <div className="pt-8 border-t border-slate-100">
                <p className="text-xs text-center text-slate-400 mb-4 font-bold uppercase tracking-widest">System Templates (Demo Mode)</p>
                <div className="grid grid-cols-4 gap-2">
                   <button onClick={() => handleQuickDemo('creator')} className="p-2 rounded-xl bg-blue-50 text-blue-600 text-[10px] font-black hover:bg-blue-100 transition">CREATOR</button>
                   <button onClick={() => handleQuickDemo('reviewer')} className="p-2 rounded-xl bg-purple-50 text-purple-600 text-[10px] font-black hover:bg-purple-100 transition">REVIEWER</button>
                   <button onClick={() => handleQuickDemo('endorser')} className="p-2 rounded-xl bg-emerald-50 text-emerald-600 text-[10px] font-black hover:bg-emerald-100 transition">ENDORSER</button>
                   <button onClick={() => handleQuickDemo('admin')} className="p-2 rounded-xl bg-slate-100 text-slate-600 text-[10px] font-black hover:bg-slate-200 transition">ADMIN</button>
                </div>
             </div>
          </div>
          
          <div className="absolute bottom-6 text-center w-full text-[10px] text-slate-300">
             © 2025 Polytechnic Assessment Management System. All rights reserved.
          </div>
       </div>
    </div>
  );
};
