
import React from 'react';

interface DashboardStatsProps {
  courseCount: number;
  bankCount: number;
  libraryCount: number;
}

export const DashboardStats: React.FC<DashboardStatsProps> = ({ courseCount, bankCount, libraryCount }) => {
  const stats = [
    { label: 'Active Courses', value: courseCount, icon: '📚', color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Question Bank Items', value: bankCount, icon: '🗄️', color: 'text-purple-600', bg: 'bg-purple-50' },
    { label: 'Saved Assessments', value: libraryCount, icon: '📁', color: 'text-emerald-600', bg: 'bg-emerald-50' }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
      {stats.map((stat, i) => (
        <div key={i} className="bg-white p-10 rounded-[40px] shadow-sm border border-slate-100 flex flex-col items-center text-center hover:shadow-md transition-shadow group">
          <div className={`w-20 h-20 ${stat.bg} rounded-[24px] flex items-center justify-center text-4xl mb-6 shadow-inner group-hover:scale-110 transition-transform`}>
            {stat.icon}
          </div>
          <div className="text-4xl font-black text-slate-900 mb-1">{stat.value}</div>
          <div className={`text-[11px] font-black uppercase tracking-widest ${stat.color}`}>{stat.label}</div>
        </div>
      ))}
    </div>
  );
};
