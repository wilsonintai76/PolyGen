
import React from 'react';

interface NotificationToastProps {
  message: string;
  section: string;
  visible: boolean;
}

export const NotificationToast: React.FC<NotificationToastProps> = ({ message, section, visible }) => {
  if (!visible) return null;

  return (
    <div className="fixed bottom-8 right-8 z-[100] animate-in slide-in-from-right-10 fade-in duration-500">
      <div className="bg-slate-900 border border-slate-700 text-white px-8 py-5 rounded-[32px] shadow-2xl flex items-center gap-6 ring-4 ring-white/5">
        <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center text-xl animate-pulse shadow-lg">
          ⚡
        </div>
        <div>
          <div className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-0.5">{message}</div>
          <div className="text-base font-black">
            {section} <span className="text-slate-400 font-bold ml-1">Synced</span>
          </div>
        </div>
      </div>
    </div>
  );
};
