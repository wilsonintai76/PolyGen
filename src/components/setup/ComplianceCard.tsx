
import React from 'react';
import { User } from '../../types';

interface ComplianceCardProps {
  currentUser?: User;
  coordinatorName: string;
  approverName: string;
}

export const ComplianceCard: React.FC<ComplianceCardProps> = ({ currentUser, coordinatorName, approverName }) => {
  return (
    <div className="bg-white p-6 rounded-[24px] shadow-sm border border-slate-200 flex flex-col h-full">
      <h3 className="font-black text-emerald-600 uppercase tracking-widest text-[10px] mb-6 flex items-center gap-2">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
        SOP Workflow Compliance
      </h3>

      <div className="space-y-4 flex-grow">
         {/* Creator Role */}
         <div className="flex gap-3 items-center group">
            <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-xs border border-blue-100 group-hover:bg-blue-600 group-hover:text-white transition">
               1
            </div>
            <div>
               <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Phase 2: Creator</div>
               <div className="text-xs font-bold text-slate-800">{currentUser?.full_name || 'Current User'}</div>
               <div className="text-[9px] text-slate-400 italic">Drafting & Mapping</div>
            </div>
         </div>

         <div className="w-0.5 h-4 bg-slate-100 ml-4"></div>

         {/* Reviewer Role */}
         <div className="flex gap-3 items-center group">
            <div className="w-8 h-8 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center font-bold text-xs border border-purple-100 group-hover:bg-purple-600 group-hover:text-white transition">
               2
            </div>
            <div>
               <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Phase 3: Reviewer</div>
               <div className="text-xs font-bold text-slate-800">{coordinatorName || 'Pending Assignment'}</div>
               <div className="text-[9px] text-slate-400 italic">Quality Assurance Audit</div>
            </div>
         </div>

         <div className="w-0.5 h-4 bg-slate-100 ml-4"></div>

         {/* Approver Role */}
         <div className="flex gap-3 items-center group">
            <div className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-xs border border-emerald-100 group-hover:bg-emerald-600 group-hover:text-white transition">
               3
            </div>
            <div>
               <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Phase 4: Approver</div>
               <div className="text-xs font-bold text-slate-800">{approverName || 'Pending Assignment'}</div>
               <div className="text-[9px] text-slate-400 italic">Final Endorsement</div>
            </div>
         </div>
      </div>
    </div>
  );
};
