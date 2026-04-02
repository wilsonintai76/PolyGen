
import React, { useState } from 'react';
import { api } from '../../services/api';
import { User, Department, Programme } from '../../types';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';

interface LoginPageProps {
  onLogin: (user: User, token: string) => void;
  departments: Department[];
  programmes: Programme[];
  showToast?: (message: string, section: string) => void;
}

const POSITIONS = [
  "Lecturer",
  "Course Coordinator",
  "Head Of Programme",
  "Head Of Department"
];

export const LoginPage: React.FC<LoginPageProps> = ({ onLogin, departments, showToast }) => {
  const [isRegister, setIsRegister] = useState(false);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [email, setEmail] = useState('');
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
      if (isForgotPassword) {
        if (!email) throw new Error("Please enter your email address.");
        await api.auth.resetPassword(email);
        if (showToast) showToast("Password reset email sent. Please check your inbox.", "Authentication");
        setIsForgotPassword(false);
      } else if (isRegister) {
        if (!fullName || !email || !password || !deptId) throw new Error("Please fill all fields, including department.");
        if (password.length < 6) throw new Error("Password must be at least 6 characters.");
        const response = await api.auth.register({ 
          email, 
          full_name: fullName.toUpperCase(), 
          position,
          deptId,
          password
        });
        onLogin(response.user, response.token);
      } else {
        const response = await api.auth.login(email, password);
        onLogin(response.user, response.token);
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Authentication failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
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
                 <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-teal-500 rounded-xl flex items-center justify-center text-white text-2xl font-black shadow-lg shadow-cyan-500/20">P</div>
                 <div className="flex flex-col">
                    <h1 className="text-white font-black text-2xl tracking-tighter uppercase leading-none">Poly<span className="text-cyan-400">Gen</span></h1>
                    <span className="text-[10px] font-black text-blue-400 uppercase tracking-[0.2em] mt-1">Assessment System</span>
                 </div>
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
                  {isForgotPassword ? 'Reset Password' : isRegister ? 'Staff Registration' : 'Welcome Back'}
                </h3>
                <p className="text-slate-500">
                  {isForgotPassword ? 'Enter your email to receive a password reset link.' : isRegister ? 'Register your academic staff account to begin.' : 'Please sign in to access your secure workspace.'}
                </p>
             </div>

             <form onSubmit={handleAuth} className="space-y-5">
                {isRegister && (
                  <>
                    <div className="space-y-2">
                       <Label className={labelClass}>Full Name (As per Staff Card)</Label>
                       <Input 
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
                         <Label className={labelClass}>Academic Position</Label>
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
                         <Label className={labelClass}>Department</Label>
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
                   <Label className={labelClass}>Email Address</Label>
                   <Input 
                      type="email" 
                      required
                      className={inputClass}
                      placeholder="e.g. staff@polytechnic.edu.my"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                   />
                </div>
                {!isForgotPassword && (
                  <div className="space-y-2">
                     <div className="flex justify-between items-center">
                       <Label className={labelClass}>Password</Label>
                       {!isRegister && (
                         <Button 
                           variant="link"
                           type="button" 
                           onClick={() => { setIsForgotPassword(true); setError(''); }}
                           className="text-[10px] font-bold text-blue-600 hover:underline p-0 h-auto"
                         >
                           Forgot Password?
                         </Button>
                       )}
                     </div>
                     <Input 
                        type="password" 
                        required
                        className={inputClass}
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                     />
                  </div>
                )}

                {error && (
                    <div className="bg-red-50 text-red-500 text-sm p-4 rounded-xl border border-red-100 flex items-center gap-2 animate-in shake duration-300">
                        <span>⚠️</span> {error}
                    </div>
                )}

                <Button 
                  type="submit" 
                  disabled={loading}
                  className="w-full bg-slate-900 text-white font-black py-5 rounded-2xl shadow-xl hover:bg-slate-800 transition active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      Processing...
                    </>
                  ) : (isForgotPassword ? 'Send Reset Link' : isRegister ? 'Complete Registration' : 'Sign In to Workspace')}
                </Button>

                <div className="text-center pt-2 space-y-2 flex flex-col">
                  {isForgotPassword ? (
                    <Button 
                      variant="link"
                      type="button"
                      onClick={() => { setIsForgotPassword(false); setError(''); }}
                      className="text-xs font-black text-slate-500 uppercase tracking-widest hover:underline p-0 h-auto"
                    >
                      Back to Sign In
                    </Button>
                  ) : (
                    <Button 
                      variant="link"
                      type="button"
                      onClick={() => { setIsRegister(!isRegister); setError(''); }}
                      className="text-xs font-black text-blue-600 uppercase tracking-widest hover:underline p-0 h-auto"
                    >
                      {isRegister ? 'Already have an account? Sign In' : "Don't have an account? Self Register"}
                    </Button>
                  )}
                </div>
              </form>
           </div>
           
           <div className="absolute bottom-6 text-center w-full text-[10px] text-slate-300 flex flex-col items-center gap-1">
             <span>© 2025 PolyGen Assessment System • Politeknik Kuching Sarawak</span>
             <div className="flex gap-3">
               <a href="/privacy-policy.html" target="_blank" rel="noopener noreferrer" className="hover:text-slate-500 hover:underline">Privacy Policy</a>
               <a href="/terms-of-service.html" target="_blank" rel="noopener noreferrer" className="hover:text-slate-500 hover:underline">Terms of Service</a>
             </div>
          </div>
       </div>
    </div>
  );
};
