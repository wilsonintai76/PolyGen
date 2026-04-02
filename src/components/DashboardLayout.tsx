
import React from 'react';
import { User } from '../types';

import { api } from '../services/api';
import { Button } from './ui/button';

interface DashboardLayoutProps {
  children: React.ReactNode;
  activeStep: string;
  onNavigate: (step: string) => void;
  user?: User;
  onLogout: () => void;
  onOpenProfile?: () => void;
}

interface SidebarItem {
  id: string;
  label: string;
  icon: string;
  allowedRoles?: string[]; // If undefined, available to all. If defined, only these roles.
}

interface SidebarGroup {
  label: string;
  items: SidebarItem[];
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children, activeStep, onNavigate, user, onLogout, onOpenProfile }) => {
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
        { id: 'setup', label: 'New Assessment', icon: '📝', allowedRoles: ['Administrator', 'Reviewer', 'Creator'] },
        { id: 'manage-bank', label: 'Question Bank', icon: '🗄️', allowedRoles: ['Administrator', 'Reviewer', 'Creator', 'Contributor'] },
        { id: 'library', label: 'Paper Archive', icon: '📁' },
      ]
    },
    {
      label: 'INSTITUTIONAL HIERARCHY',
      items: [
        { id: 'departments', label: 'My Department', icon: '🏢', allowedRoles: ['Administrator'] },
        { id: 'programmes', label: 'Programme', icon: '🎓', allowedRoles: ['Administrator'] },
        { id: 'courses', label: 'Course', icon: '📚', allowedRoles: ['Administrator', 'Reviewer'] },
      ]
    },
    {
      label: 'ACADEMIC STANDARDS',
      items: [
        { id: 'sessions', label: 'Session', icon: '⏳', allowedRoles: ['Administrator'] },
        { id: 'manage-templates', label: 'Assessment Templates', icon: '🎨', allowedRoles: ['Administrator'] },
        { id: 'global-da', label: 'Dublin Accord', icon: '🧬', allowedRoles: ['Administrator'] },
        { id: 'users', label: 'Staff Management', icon: '👥', allowedRoles: ['Administrator'] },
      ]
    },
    {
      label: 'SUPPORT',
      items: [
        { id: 'help', label: 'User Manual', icon: '❓' },
      ]
    },
    {
      label: 'LEGAL',
      items: [
        { id: 'privacy', label: 'Privacy Policy', icon: '🛡️' },
        { id: 'terms', label: 'Terms of Service', icon: '📜' },
      ]
    }
  ];

  return (
    <div className="h-screen flex flex-col bg-[#f8fafc] font-sans overflow-hidden">
      {/* 1. Full-Width Fixed Header */}
      <header className="bg-white border-b border-slate-200 flex items-center justify-between shrink-0 z-[60] print:hidden shadow-sm h-16">
         {/* Column 1: Brand Identity - Width matched to Sidebar (w-72) */}
         <div className="w-72 h-full flex items-center px-8 bg-[#0f172a] shrink-0 border-r border-slate-800">
            <img 
               src="https://odzvkxzgoibxxybcocbr.supabase.co/storage/v1/object/public/branding/PolyGen%20Logo.png" 
               alt="PolyGen Logo" 
               className="h-7 w-auto object-contain"
               referrerPolicy="no-referrer"
            />
         </div>

         {/* Column 2: Page Label Section (Left Indent) */}
         <div className="flex-grow flex items-center justify-start gap-4 px-10">
            <div className="w-8 h-8 rounded-lg bg-blue-600/10 flex items-center justify-center text-base">
               {groups.flatMap(g => g.items).find(i => i.id === activeStep)?.icon || '🏛️'}
            </div>
            <div>
               <h2 className="text-[13px] font-black text-slate-900 uppercase tracking-tight leading-none">
                  {groups.flatMap(g => g.items).find(i => i.id === activeStep)?.label || 'Command Hub'}
               </h2>
               <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">
                  {groups.find(g => g.items.some(i => i.id === activeStep))?.label || 'Academic Workspace'}
               </p>
            </div>
         </div>
         
         {/* Column 3: Profile Section - Width matched to Sidebar (w-72) for symmetry */}
         <div className="w-72 flex items-center justify-end gap-6 px-8 h-full">
            <Button 
               variant="ghost"
               onClick={onOpenProfile}
               className="flex items-center gap-4 px-3 py-6 rounded-2xl hover:bg-slate-50 transition-colors text-left group h-auto"
            >
               <div className="text-right hidden sm:block">
                  <p className="text-[10px] font-black text-slate-900 uppercase tracking-tight group-hover:text-blue-600 transition-colors">{user?.full_name || 'Academic Staff'}</p>
                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{user?.role || 'Creator'}</p>
               </div>
               <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-sm font-bold border border-slate-200 shrink-0 shadow-sm ${
                  user?.role === 'Administrator' ? 'bg-rose-500/10 text-rose-500' : 
                  user?.role === 'Reviewer' ? 'bg-purple-500/10 text-purple-500' :
                  user?.role === 'Endorser' ? 'bg-emerald-500/10 text-emerald-500' :
                  user?.role === 'Contributor' ? 'bg-amber-500/10 text-amber-500' :
                  'bg-blue-500/10 text-blue-500'
               }`}>
                  {user?.full_name?.charAt(0) || 'U'}
               </div>
            </Button>
         </div>
      </header>

      {/* 2. Middle Section (Sidebar + Content) */}
      <div className="flex flex-grow overflow-hidden">
        {/* Enterprise Sidebar */}
        <aside className="w-72 bg-[#0f172a] text-white flex flex-col shrink-0 border-r border-slate-800 z-50 print:hidden">
          {/* Dynamic Navigation */}
          <nav className="flex-grow overflow-y-auto px-4 space-y-8 custom-scrollbar py-8">
            {groups.map((group, idx) => {
              const visibleItems = group.items.filter(item => !item.allowedRoles || (user?.role && item.allowedRoles.includes(user.role)));
              if (visibleItems.length === 0) return null;

              return (
                <div key={idx} className="space-y-2">
                  <h3 className="px-4 text-[9px] font-black text-slate-500 uppercase tracking-[0.25em] mb-3">{group.label}</h3>
                  <div className="space-y-1">
                    {visibleItems.map((item) => (
                      <button
                        key={item.id}
                        onClick={() => onNavigate(item.id)}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl transition-all duration-300 text-[12px] font-bold ${
                          activeStep === item.id || (item.id === 'setup' && ['setup', 'cist', 'preview'].includes(activeStep))
                            ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20 translate-x-1' 
                            : 'text-slate-400 hover:bg-slate-800/50 hover:text-white'
                        }`}
                      >
                        <span className="text-base opacity-80">{item.icon}</span>
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
            <Button 
               variant="ghost"
               onClick={onLogout}
               className="w-full flex items-center justify-center gap-3 py-6 rounded-2xl text-slate-500 hover:text-rose-400 hover:bg-rose-50/10 transition-all font-black uppercase text-[9px] tracking-widest h-auto"
            >
               Sign Out Session
            </Button>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-grow bg-slate-50 relative flex flex-col overflow-hidden">
          <div className="flex-grow overflow-y-auto custom-scrollbar">
            {children}
          </div>
        </main>
      </div>

      {/* 3. Full-Width Fixed Footer */}
      <footer className="bg-white border-t border-slate-200 flex items-center justify-between shrink-0 z-[60] print:hidden shadow-[0_-1px_3px_rgba(0,0,0,0.05)] h-14">
         {/* Left Status Section - Matches Sidebar Width with Divider */}
         <div className="w-72 h-full hidden md:flex flex-col items-center justify-center gap-1.5 bg-[#0f172a] border-r border-slate-800 shrink-0 px-8">
            <span className="text-[7px] font-black text-slate-500 uppercase tracking-[0.3em] mb-0.5">System Status</span>
            <div className="flex items-center gap-2">
               <div className={`flex items-center gap-1 px-1.5 py-0.5 rounded-full border ${api.isSupabaseConfigured ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-amber-500/10 text-amber-400 border-amber-500/20'}`}>
                  <div className={`w-1 h-1 rounded-full ${api.isSupabaseConfigured ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`}></div>
                  <span className="text-[6px] font-black uppercase tracking-wider">{api.isSupabaseConfigured ? 'Cloud' : 'Local'}</span>
               </div>
               <div className="flex items-center gap-1 px-1.5 py-0.5 bg-emerald-500/10 text-emerald-400 rounded-full border border-emerald-500/20">
                  <div className="w-1 h-1 rounded-full bg-emerald-400 animate-pulse"></div>
                  <span className="text-[6px] font-black uppercase tracking-wider">Operational</span>
               </div>
            </div>
         </div>

         {/* Right Branding Section - Centered in remaining space */}
         <div className="flex-grow flex items-center justify-center gap-4 px-4">
            <img 
               src="https://odzvkxzgoibxxybcocbr.supabase.co/storage/v1/object/public/branding/logopks.png" 
               alt="PKS Logo" 
               className="h-8 w-auto object-contain"
               referrerPolicy="no-referrer"
            />
            <span className="text-[11px] font-black text-slate-700 uppercase tracking-tight">POLITEKNIK KUCHING SARAWAK</span>
         </div>
      </footer>
    </div>
  );
};
