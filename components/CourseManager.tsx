
import React, { useState } from 'react';
import { Course, Department, Programme, User, GlobalMqf } from '../types';
import { CourseEditorModal } from './CourseEditorModal';
import { CourseCard } from './CourseCard';

interface CourseManagerProps {
  courses: Course[];
  onSave: (course: Course) => void;
  onDelete: (id: string) => void;
  departments: Department[];
  programmes: Programme[];
  globalMqfs: GlobalMqf[];
  user?: User;
  onManageJsu: (course: Course) => void;
}

export const CourseManager: React.FC<CourseManagerProps> = ({ 
  courses, onSave, onDelete, departments, programmes, globalMqfs, user, onManageJsu 
}) => {
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);

  // Requirement: Only Coordinator (Reviewer role) can create courses
  const canCreate = user?.role === 'reviewer' || user?.role === 'admin';

  const startNew = () => {
    if (!canCreate) return;
    setEditingCourse({
      id: 'course-' + Date.now(),
      code: '',
      name: '',
      deptId: '',
      programmeId: '',
      clos: { 'CLO 1': '' },
      mqfs: {}
    });
  };

  const handleSave = (course: Course) => {
    onSave(course);
    setEditingCourse(null);
  };

  return (
    <div className="p-10 max-w-7xl mx-auto animate-in fade-in duration-500">
      <div className="flex justify-between items-end mb-12">
        <div>
          <h2 className="text-4xl font-black text-slate-900 tracking-tight uppercase">Course Repository</h2>
          <p className="text-[#94a3b8] font-bold uppercase text-[11px] tracking-widest mt-2">Manage Hierarchy: Department &rarr; Programme &rarr; Course</p>
        </div>
        {canCreate && (
          <button 
            onClick={startNew} 
            className="bg-blue-600 text-white px-8 py-4 rounded-2xl font-black shadow-xl hover:bg-blue-700 transition transform active:scale-95 uppercase tracking-widest text-xs"
          >
            + Register New Course
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {courses.map(course => (
          <CourseCard 
            key={course.id} 
            course={course}
            user={user}
            onEdit={canCreate ? setEditingCourse : undefined} 
            onDelete={canCreate ? onDelete : undefined} 
            onManageJsu={onManageJsu}
          />
        ))}
        {courses.length === 0 && (
          <div className="col-span-full py-32 text-center bg-white rounded-[40px] border-4 border-dashed border-slate-100 flex flex-col items-center">
            <span className="text-6xl mb-4 grayscale opacity-20">📚</span>
            <p className="text-[#94a3b8] font-black uppercase tracking-widest text-sm">No courses defined in repository</p>
          </div>
        )}
      </div>

      {editingCourse && (
        <CourseEditorModal 
          course={editingCourse} 
          onSave={handleSave} 
          onCancel={() => setEditingCourse(null)} 
          onUpdate={setEditingCourse} 
          departments={departments}
          programmes={programmes}
          globalMqfs={globalMqfs}
        />
      )}
    </div>
  );
};
