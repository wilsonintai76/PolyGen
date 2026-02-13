
import React from 'react';
import { Course, User } from '../types';

interface CourseCardProps {
  course: Course;
  user?: User;
  onEdit?: (course: Course) => void;
  onDelete?: (id: string) => void;
  onManageJsu?: (course: Course) => void;
}

export const CourseCard: React.FC<CourseCardProps> = ({ course, user, onEdit, onDelete, onManageJsu }) => {
  const cloCount = Object.keys(course.clos || {}).length;
  const mqfCount = Object.keys(course.mqfs || {}).length;
  const isJsuDefined = !!(course.jsuTemplate && course.jsuTemplate.length > 0);
  
  // Registration Completeness Checks (Items 1-5 in Registry Editor)
  const hasMetadata = !!(course.code && course.name && course.deptId && course.programmeId);
  const hasClos = cloCount > 0;
  const hasTopics = !!(course.topics && course.topics.length > 0);
  const hasPolicies = !!(course.assessmentPolicies && course.assessmentPolicies.length > 0);
  const hasMqf = mqfCount > 0;

  // STRICT RULE: All 5 items must be present
  const isRegistrationComplete = hasMetadata && hasClos && hasTopics && hasPolicies && hasMqf;
  
  // Requirement: Only Coordinator (Reviewer role) or Admin can manage JSU/Course details
  const canManage = user?.role === 'reviewer' || user?.role === 'admin';

  return (
    <div className="bg-white p-8 rounded-[40px] shadow-sm border border-slate-100 hover:shadow-md transition group relative flex flex-col h-full">
      {/* Header with Code and Actions */}
      <div className="flex justify-between items-start mb-6">
        <div className={`px-4 py-1.5 rounded-xl text-[11px] font-black uppercase tracking-widest shadow-sm ${
            isRegistrationComplete ? 'bg-[#ebf3ff] text-[#3b82f6]' : 'bg-slate-100 text-slate-400'
        }`}>
          {course.code || 'DRAFT'}
        </div>
        <div className="flex gap-3 pt-1">
          {onEdit && (
            <button 
              onClick={() => onEdit(course)} 
              className="text-slate-400 hover:text-blue-600 transition-colors"
              title="Edit Course Metadata"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
              </svg>
            </button>
          )}
          {onDelete && (
            <button 
              onClick={() => onDelete(course.id)} 
              className="text-slate-400 hover:text-red-600 transition-colors"
              title="Delete Course"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Course Name */}
      <h3 className="font-black text-slate-800 text-lg uppercase leading-tight mb-4 line-clamp-3">
        {course.name || 'Untitled Course'}
      </h3>

      {/* Status Badge */}
      <div className="mb-8 min-h-[40px]">
        {!isRegistrationComplete ? (
          <div className="flex flex-col gap-1">
             <span className="text-[9px] font-black bg-rose-50 text-rose-500 px-3 py-1 rounded-full uppercase tracking-widest border border-rose-100 w-fit">
               REGISTRATION PENDING
             </span>
             <span className="text-[7px] font-black text-rose-300 uppercase tracking-widest pl-1 leading-tight">
               MISSING: 
               {!hasMetadata ? ' INFO ' : ''}
               {!hasClos ? ' CLOS ' : ''}
               {!hasTopics ? ' TOPICS ' : ''}
               {!hasPolicies ? ' POLICIES ' : ''}
               {!hasMqf ? ' STDS' : ''}
             </span>
          </div>
        ) : isJsuDefined ? (
          <span className="text-[9px] font-black bg-emerald-100 text-emerald-600 px-3 py-1 rounded-full uppercase tracking-widest">
            JSU Blueprint Defined
          </span>
        ) : (
          <span className="text-[9px] font-black bg-amber-100 text-amber-600 px-3 py-1 rounded-full uppercase tracking-widest">
            JSU Blueprint Pending
          </span>
        )}
      </div>

      {/* Action Area */}
      {canManage && onManageJsu && (
        <button 
          onClick={() => onManageJsu(course)}
          disabled={!isRegistrationComplete}
          className={`mb-6 w-full py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition shadow-lg active:scale-95 flex items-center justify-center gap-2 ${
             isRegistrationComplete 
             ? 'bg-slate-900 text-white hover:bg-slate-800' 
             : 'bg-slate-100 text-slate-300 cursor-not-allowed shadow-none border border-slate-200'
          }`}
        >
          {!isRegistrationComplete && <span className="text-xs grayscale opacity-50">🔒</span>}
          MANAGE CIST
        </button>
      )}

      {/* Divider */}
      <div className="mt-auto pt-6 border-t border-slate-50 flex justify-between items-center text-[10px] font-black text-[#94a3b8] uppercase tracking-widest">
        <span>{cloCount} CLOS</span>
        <span>{mqfCount} MQF/DA</span>
      </div>
    </div>
  );
};
