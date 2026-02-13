
import React from 'react';
import { User } from '../types';

interface DashboardLayoutProps {
  children: React.ReactNode;
  activeStep: string;
  onNavigate: (step: any) => void;
  user?: User;
  onLogout: () => void;
}

interface SidebarItem {
  id: string;
  label: string;
  icon: string;
  adminOnly?: boolean;
}

interface SidebarGroup {
  label: string;
  items: SidebarItem[];
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children, activeStep, onNavigate, user, onLogout }) => {
  const groups: SidebarGroup[] = [
    {
      label: 'ACADEMIC WORKSPACE',
      items: [
        { id: 'dashboard', label: 'Command Hub', icon: '🏛️' },
      ]
    },
    {
      label: 'REPOSITORIES',
      items: [
        { id: 'setup', label: 'New Assessment', icon: '📝' },
        { id: 'manage-bank', label: 'Question Bank', icon: '🗄️' },
        { id: 'library', label: 'Paper Archive', icon: '📁' },
      ]
    },
    {
      label: 'INSTITUTIONAL HIERARCHY',
      items: [
        { id: 'departments', label: 'Department Manager', icon: '🏢', adminOnly: true },
        { id: 'programmes', label: 'Programme Registry', icon: '🎓', adminOnly: true },
        { id: 'courses', label: 'Course Catalog', icon: '📚', adminOnly: true },
      ]
    },
    {
      label: 'ACADEMIC STANDARDS',
      items: [
        { id: 'sessions', label: 'Session Control', icon: '⏳', adminOnly: true },
        { id: 'global-mqf', label: 'Global MQF/DA', icon: '🧬', adminOnly: true },
        { id: 'branding', label: 'Institution Identity', icon: '⚙️', adminOnly: true },
        { id: 'users', label: 'Staff Management', icon: '👥', adminOnly: true },
      ]
    },
    {
      label: 'SUPPORT',
      items: [
        { id: 'help', label: 'User Manual', icon: '❓' },
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-[#f8fafc] flex font-sans">
      {/* Enterprise Sidebar */}
      <aside className="w-72 bg-[#0f172a] text-white flex flex-col shrink-0 border-r border-slate-800 shadow-2xl z-50 print:hidden">
        
        {/* Brand Identity */}
        <div className="p-8 border-b border-slate-800/50">
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white font-black shadow-lg shadow-blue-500/20">P</div>
             <div>
                <h1 className="text-xl font-black tracking-tighter uppercase">Poly<span className="text-blue-500">Gen</span></h1>
                <p className="text-[9px] text-slate-500 font-black uppercase tracking-[0.2em]">Enterprise V3.5</p>
             </div>
          </div>
        </div>

        {/* Staff Identity Card */}
        <div className="px-6 py-6">
          <div className="bg-slate-800/40 rounded-3xl p-4 border border-slate-700/50 flex items-center gap-4">
             <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xl font-bold border border-slate-600 ${
               user?.role === 'admin' ? 'bg-rose-500/20 text-rose-400' : 'bg-blue-500/20 text-blue-400'
             }`}>
               {user?.full_name.charAt(0) || 'U'}
             </div>
             <div className="overflow-hidden">
                <p className="text-xs font-black truncate text-white uppercase tracking-tight">{user?.full_name || 'Academic Staff'}</p>
                <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mt-0.5">{user?.role || 'Lecturer'}</p>
             </div>
          </div>
        </div>

        {/* Dynamic Navigation */}
        <nav className="flex-grow overflow-y-auto px-4 space-y-8 custom-scrollbar pb-10">
          {groups.map((group, idx) => {
            const visibleItems = group.items.filter(item => !item.adminOnly || user?.role === 'admin');
            if (visibleItems.length === 0) return null;

            return (
              <div key={idx} className="space-y-2">
                <h3 className="px-4 text-[9px] font-black text-slate-500 uppercase tracking-[0.25em] mb-3">{group.label}</h3>
                <div className="space-y-1">
                  {visibleItems.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => onNavigate(item.id)}
                      className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl transition-all duration-300 text-[13px] font-bold ${
                        activeStep === item.id || (item.id === 'setup' && ['setup', 'cist', 'preview'].includes(activeStep))
                          ? 'bg-blue-600 text-white shadow-xl shadow-blue-600/20 translate-x-1' 
                          : 'text-slate-400 hover:bg-slate-800/50 hover:text-white'
                      }`}
                    >
                      <span className="text-lg opacity-80">{item.icon}</span>
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
        </nav>

        {/* System Exit */}
        <div className="p-6 mt-auto border-t border-slate-800/50 bg-slate-900/30">
          <button 
             onClick={onLogout}
             className="w-full flex items-center justify-center gap-3 py-4 rounded-2xl text-slate-500 hover:text-rose-400 hover:bg-rose-50/10 transition-all font-black uppercase text-[10px] tracking-widest"
          >
             Sign Out Session
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-grow overflow-y-auto bg-slate-50 h-screen custom-scrollbar relative">
        {children}
      </main>
    </div>
  );
};
