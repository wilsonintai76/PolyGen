
import React from 'react';
import { Course, User } from '../types';
import { Button } from '@/components/ui/button';
import { Pencil, Trash2, Settings, Lock } from 'lucide-react';

interface CourseCardProps {
  course: Course;
  user?: User;
  onEdit?: (course: Course) => void;
  onDelete?: (id: string) => void;
  onManageJsu?: (course: Course) => void;
}

export const CourseCard: React.FC<CourseCardProps> = ({ course, user, onEdit, onDelete, onManageJsu }) => {
  const cloCount = Object.keys(course.clos || {}).length;
  const mappedDaCodes = new Set(Object.values(course.daMappings || {}).flat());
  const daCount = Math.max(Object.keys(course.da || {}).length, mappedDaCodes.size);
  const isJsuDefined = !!(course.jsuTemplate && course.jsuTemplate.length > 0);
  
  // Registration Completeness Checks (Items 1-5 in Registry Editor)
  const hasMetadata = !!(course.code && course.name && course.deptId && course.programmeId);
  const hasClos = cloCount > 0;
  const hasTopics = !!(course.topics && course.topics.length > 0);
  const hasPolicies = !!(course.assessmentPolicies && course.assessmentPolicies.length > 0);
  const hasDa = daCount > 0;

  // STRICT RULE: All 5 items must be present
  const isRegistrationComplete = hasMetadata && hasClos && hasTopics && hasPolicies && hasDa;
  
  // Requirement: Only Reviewer or Admin can manage JSU/Course details
  const canManage = user?.role === 'Reviewer' || user?.role === 'Administrator';

  return (
    <div className="bg-white p-8 rounded-[40px] shadow-sm border border-slate-100 hover:shadow-md transition group relative flex flex-col h-full">
      {/* Header with Code and Actions */}
      <div className="flex justify-between items-start mb-6">
        <div className={`px-4 py-1.5 rounded-xl text-[11px] font-black uppercase tracking-widest shadow-sm ${
            isRegistrationComplete ? 'bg-[#ebf3ff] text-[#3b82f6]' : 'bg-slate-100 text-slate-400'
        }`}>
          {course.code || 'DRAFT'}
        </div>
        <div className="flex gap-1 pt-1">
          {onEdit && (
            <Button 
              variant="ghost"
              size="icon"
              onClick={() => onEdit(course)} 
              className="h-8 w-8 text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
              title="Manage Course Details"
            >
              <Pencil className="h-4 w-4" />
            </Button>
          )}
          {onDelete && (
            <Button 
              variant="ghost"
              size="icon"
              onClick={() => onDelete(course.id)} 
              className="h-8 w-8 text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
              title="Delete Course"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
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
               {!hasDa ? ' STDS' : ''}
             </span>
          </div>
        ) : isJsuDefined ? (
          <span className="text-[9px] font-black bg-emerald-100 text-emerald-600 px-3 py-1 rounded-full uppercase tracking-widest">
            CIST Blueprint Defined
          </span>
        ) : (
          <span className="text-[9px] font-black bg-amber-100 text-amber-600 px-3 py-1 rounded-full uppercase tracking-widest">
            CIST Blueprint Pending
          </span>
        )}
      </div>

      {/* Action Area */}
      {canManage && onEdit && !isRegistrationComplete && (
        <Button 
          onClick={() => onEdit(course)}
          className="mb-4 w-full py-6 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition shadow-xl active:scale-95 bg-blue-600 text-white hover:bg-blue-700 flex items-center justify-center gap-2"
        >
          <Settings className="w-4 h-4" /> MANAGE DETAILS
        </Button>
      )}

      {canManage && onManageJsu && (
        <Button 
          onClick={() => onManageJsu(course)}
          disabled={!isRegistrationComplete}
          variant={isRegistrationComplete ? "default" : "outline"}
          className={`mb-6 w-full py-6 rounded-2xl text-[10px] font-black uppercase tracking-widest transition shadow-lg active:scale-95 flex items-center justify-center gap-2 ${
             isRegistrationComplete 
             ? 'bg-slate-900 text-white hover:bg-slate-800' 
             : 'bg-slate-100 text-slate-300 cursor-not-allowed shadow-none border border-slate-200 hover:bg-slate-100 hover:text-slate-300'
          }`}
        >
          {!isRegistrationComplete && <Lock className="w-3 h-3 grayscale opacity-50" />}
          {isJsuDefined ? 'UPDATE BLUEPRINT' : 'CREATE BLUEPRINT'}
        </Button>
      )}

      {/* Divider */}
      <div className="mt-auto pt-6 border-t border-slate-50 flex justify-between items-center text-[10px] font-black text-[#94a3b8] uppercase tracking-widest">
        <span>{cloCount} CLOS</span>
        <span>{daCount} Dublin Accord</span>
      </div>
    </div>
  );
};
