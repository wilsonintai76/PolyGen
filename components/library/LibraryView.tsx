
import React from 'react';
import { AssessmentPaper } from '../../types';

interface LibraryViewProps {
  onBack: () => void;
  papers: AssessmentPaper[];
  onLoad: (paper: AssessmentPaper) => void;
}

export const LibraryView: React.FC<LibraryViewProps> = ({ onBack, papers, onLoad }) => {
  // Group papers by Course Code
  const grouped = papers.reduce((acc, paper) => {
    const key = paper.header.courseCode || 'Unknown';
    if (!acc[key]) acc[key] = [];
    acc[key].push(paper);
    return acc;
  }, {} as Record<string, AssessmentPaper[]>);

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-5xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-3xl font-extrabold text-gray-800">Assessment Library</h2>
            <p className="text-gray-500">View and reload previously generated assessments.</p>
          </div>
          <button onClick={onBack} className="text-blue-600 font-bold hover:underline">← Back to Dashboard</button>
        </div>

        {papers.length === 0 ? (
          <div className="bg-white p-12 rounded-2xl text-center border-2 border-dashed border-gray-300">
            <p className="text-gray-400 font-medium">No assessments saved yet.</p>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Cast Object.entries to ensure coursePapers is recognized as AssessmentPaper[] to fix the 'unknown' type error */}
            {(Object.entries(grouped) as [string, AssessmentPaper[]][]).map(([course, coursePapers]) => (
              <section key={course}>
                <h3 className="text-xl font-bold text-gray-700 mb-4 border-l-4 border-blue-600 pl-3">{course}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {coursePapers.map((paper, idx) => (
                    <div 
                      key={idx} 
                      onClick={() => onLoad(paper)}
                      className="bg-white p-5 rounded-xl shadow-sm border border-transparent hover:border-blue-300 hover:shadow-md transition cursor-pointer"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <span className="text-[10px] font-bold bg-blue-100 text-blue-700 px-2 py-0.5 rounded uppercase">
                          {paper.header.assessmentType}
                        </span>
                        <span className="text-[10px] text-gray-400">
                          {paper.createdAt ? new Date(paper.createdAt).toLocaleDateString() : 'N/A'}
                        </span>
                      </div>
                      <h4 className="font-bold text-gray-800 text-sm mb-1">{paper.header.courseName}</h4>
                      <p className="text-xs text-gray-500 mb-3">Session: {paper.header.session}</p>
                      <div className="flex justify-between items-center text-[10px] font-bold text-gray-400 pt-2 border-t">
                        <span>{paper.questions.length} QUESTIONS</span>
                        <span>{paper.studentInfo.totalMarks} MARKS</span>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
