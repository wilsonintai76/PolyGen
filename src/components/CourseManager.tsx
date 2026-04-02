
import React, { useState } from 'react';
import { Course, Department, Programme, User, LearningDomain, Taxonomy, DublinAccord } from '../types';
import { CourseEditorModal } from './CourseEditorModal';
import { SimpleCourseAddModal } from './SimpleCourseAddModal';
import { CourseCard } from './CourseCard';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

interface CourseManagerProps {
  courses: Course[];
  onSave: (course: Course) => void;
  onDelete: (id: string) => void;
  departments: Department[];
  programmes: Programme[];
  dublinAccords: DublinAccord[];
  learningDomains: LearningDomain[];
  taxonomies: Taxonomy[];
  user?: User;
  onManageJsu: (course: Course) => void;
  showToast?: (message: string, section: string) => void;
}

export const CourseManager: React.FC<CourseManagerProps> = ({ 
  courses, onSave, onDelete, departments, programmes, dublinAccords, learningDomains, taxonomies, user, onManageJsu, showToast 
}) => {
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [isAddingNew, setIsAddingNew] = useState(false);

  // Requirement: Only Reviewer or Administrator can create courses
  const canCreate = user?.role === 'Reviewer' || user?.role === 'Administrator';

  const startNew = () => {
    if (!canCreate) return;
    setIsAddingNew(true);
  };

  const handleCreateNew = async (partialCourse: Partial<Course>) => {
    const newCourse: Course = {
      id: 'local-' + Date.now(),
      code: partialCourse.code || '',
      name: partialCourse.name || '',
      deptId: partialCourse.deptId || '',
      programmeId: partialCourse.programmeId || '',
      clos: partialCourse.clos || { 'CLO 1': '' },
      da: partialCourse.da || {},
      topics: partialCourse.topics || [],
      assessmentPolicies: partialCourse.assessmentPolicies || []
    };

    try {
      await onSave(newCourse);
      setIsAddingNew(false);
      if (showToast) showToast("Course successfully registered.", "Registry");
    } catch (error) {
      console.error("Failed to create course:", error);
      if (showToast) showToast("Failed to create course. Please try again.", "Error");
    }
  };

  const handleSave = async (course: Course) => {
    try {
      await onSave(course);
      setEditingCourse(null);
      if (showToast) showToast("Course details updated.", "Registry");
    } catch (error) {
      console.error("Failed to save course:", error);
      if (showToast) showToast("Failed to save course. Please try again.", "Error");
    }
  };

  const handleIntermediateSave = async (course: Course) => {
    try {
      const savedCourse = await onSave(course);
      // If onSave returns the saved course, we should update the local state to ensure consistency
      // This is crucial for new courses that get a real ID from the backend
      if (savedCourse !== undefined && savedCourse !== null && typeof savedCourse === 'object' && 'id' in savedCourse) {
        setEditingCourse(savedCourse as Course);
      } else {
        setEditingCourse(course);
      }
    } catch (error) {
      console.error("Failed to save course (intermediate):", error);
      if (showToast) showToast("Failed to save progress. Please try again.", "Error");
      throw error;
    }
  };

  return (
    <div className="p-10 max-w-7xl mx-auto animate-in fade-in duration-500">
      <div className="flex justify-between items-end mb-12">
        <div>
          <h2 className="text-4xl font-black text-slate-900 tracking-tight uppercase">Course Registry</h2>
          <p className="text-[#94a3b8] font-bold uppercase text-[11px] tracking-widest mt-2">Manage Hierarchy: Department &rarr; Programme &rarr; Course</p>
        </div>
        {canCreate && (
          <Button 
            onClick={startNew} 
            className="bg-blue-600 text-white px-8 py-6 rounded-2xl font-black shadow-xl hover:bg-blue-700 transition transform active:scale-95 uppercase tracking-widest text-xs"
          >
            <Plus className="w-4 h-4 mr-2" /> Register New Course
          </Button>
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
          onIntermediateSave={handleIntermediateSave}
          onCancel={() => setEditingCourse(null)} 
          onUpdate={setEditingCourse} 
          departments={departments}
          programmes={programmes}
          dublinAccords={dublinAccords}
          learningDomains={learningDomains}
          taxonomies={taxonomies}
        />
      )}

      {isAddingNew && (
        <SimpleCourseAddModal
          onSave={handleCreateNew}
          onCancel={() => setIsAddingNew(false)}
          departments={departments}
          programmes={programmes}
          showToast={showToast}
        />
      )}
    </div>
  );
};
