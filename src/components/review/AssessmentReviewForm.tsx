
import React, { useState } from 'react';
import { AssessmentPaper } from '../../types';
import { A4Page } from '../layout/A4Page';

interface AssessmentReviewFormProps {
  paper: AssessmentPaper;
  deptName?: string;
  onBack: () => void;
  onApprove?: (feedback: string, checklist: string[], checklistNotes: string[]) => void;
  onReturn?: (feedback: string, checklist: string[], checklistNotes: string[]) => void;
  isReviewer?: boolean;
  isEndorser?: boolean;
}

export const AssessmentReviewForm: React.FC<AssessmentReviewFormProps> = ({ paper, deptName, onBack, onApprove, onReturn, isReviewer, isEndorser }) => {
  // Extracting drafter name from "NAME (POSITION)" format if present
  const drafterRaw = paper.footer.preparedBy || "";
  const drafterName = drafterRaw.split('(')[0].trim();

  // Initial state for checklist to allow digital filling
  const [reviews, setReviews] = useState<string[]>(paper.checklist || Array(8).fill(""));
  const [notes, setNotes] = useState<string[]>(paper.checklistNotes || Array(8).fill(""));
  const [generalFeedback, setGeneralFeedback] = useState(paper.feedback || "");

  const toggleReview = (idx: number) => {
    if (!isReviewer && !isEndorser) return;
    const newReviews = [...reviews];
    const current = newReviews[idx];
    if (current === "✓") newReviews[idx] = "X";
    else if (current === "X") newReviews[idx] = "";
    else newReviews[idx] = "✓";
    setReviews(newReviews);
  };

  const handleNoteChange = (idx: number, val: string) => {
    if (!isReviewer && !isEndorser) return;
    const newNotes = [...notes];
    newNotes[idx] = val;
    setNotes(newNotes);
  };

  const items = [
    { text: "Comply with curriculum (comply with opportunity, compliant with specification, correct construct, correct title, clear, appropriate difficulty level, align with the topic and impartial in assessing)", isRed: false },
    { text: "Adhere to the distribution of topics AST/CIST/CAIST/CAT", isRed: true, redPart: "AST/CIST/CAIST/CAT" },
    { text: "Appropriate level of taxonomy domain", isRed: false },
    { text: "Appropriate distribution of marks", isRed: false },
    { text: "Appropriate division of answering time", isRed: false },
    { text: "Comply with course work assessment format (CLO and taxonomy domain available)", isRed: false },
    { text: "Other comments:", isRed: false },
    { text: "Final Review has been corrected (√)", isRed: false },
  ];

  return (
    <div className="bg-slate-800 min-h-screen py-10 flex justify-center">
       <A4Page className="p-10 shadow-2xl print:shadow-none print:m-0 font-['Arial'] text-black">
          {/* Header Box */}
          <div className="border border-black mb-6">
             <div className="text-center py-4 border-b border-black">
                <h1 className="text-lg font-bold uppercase tracking-wide">CONTINUOUS ASSESSMENT REVIEW FORM</h1>
             </div>
             
             <div className="flex justify-between px-2 py-2 border-b border-black text-xs font-bold uppercase">
                <div className="flex gap-2">
                   <span>DEPARTMENT:</span>
                   <span>{deptName || paper.header.department}</span>
                </div>
                <div className="flex gap-2">
                   <span>SESSION:</span>
                   <span>{paper.header.session}</span>
                </div>
             </div>

             <div className="grid grid-cols-2 text-xs font-bold uppercase">
                {/* Row 1 */}
                <div className="border-r border-black border-b p-2 flex gap-2">
                   <span className="w-32 shrink-0">COURSE CODE :</span>
                   <span>{paper.header.courseCode}</span>
                </div>
                <div className="border-b border-black p-2 flex gap-2">
                   <span className="w-32 shrink-0">COURSE NAME :</span>
                   <span>{paper.header.courseName}</span>
                </div>

                {/* Row 2 */}
                <div className="border-r border-black border-b p-2 flex gap-2">
                   <span className="w-32 shrink-0">NAME OF DRAFTER :</span>
                   <span>{drafterName}</span>
                </div>
                <div className="border-b border-black p-2 flex gap-2">
                   <span className="w-32 shrink-0">TYPE OF ASSESSMENT :</span>
                   <span>{paper.header.assessmentType}</span>
                </div>

                {/* Row 3 */}
                <div className="border-r border-black p-2 flex gap-2 col-span-2">
                   <span className="w-32 shrink-0">ASSESSMENT SET :</span>
                   <span>SET {paper.header.set}</span>
                </div>
             </div>
          </div>

          {/* Checklist Table */}
          <div className="mb-6 border border-black border-b-0">
             <table className="w-full text-xs border-collapse">
                <thead>
                   <tr className="bg-gray-200">
                      <th className="border-b border-black border-r px-2 py-3 w-[55%] text-left uppercase">ITEM EVALUATION CHECKLIST</th>
                      <th className="border-b border-black border-r px-2 py-3 w-[15%] text-center uppercase">REVIEW</th>
                      <th className="border-b border-black px-2 py-3 w-[30%] text-center uppercase">REVIEW NOTES (if any)</th>
                   </tr>
                </thead>
                <tbody>
                   {items.map((item, i) => (
                      <tr key={i} className="group hover:bg-slate-50">
                         <td className="border-b border-black border-r px-2 py-2 align-top h-12">
                            {item.isRed ? (
                               <span>
                                  Adhere to the distribution of topics <br/>
                                  <span className="text-red-600 font-bold">{item.redPart}</span>
                               </span>
                            ) : (
                               <span>{item.text}</span>
                            )}
                         </td>
                         <td 
                             className={`border-b border-black border-r px-2 py-1 align-middle text-center select-none transition-colors ${isReviewer ? 'cursor-pointer hover:bg-slate-100' : ''}`}
                             onClick={() => toggleReview(i)}
                          >
                             <span className={`text-lg font-black ${reviews[i] === '✓' ? 'text-emerald-600' : reviews[i] === 'X' ? 'text-rose-600' : ''}`}>
                                {reviews[i]}
                             </span>
                          </td>
                         <td className="border-b border-black px-2 py-1 align-middle">
                             <textarea 
                               className="w-full h-full bg-transparent outline-none resize-none overflow-hidden text-xs font-medium"
                               rows={2}
                               value={notes[i]}
                               onChange={(e) => handleNoteChange(i, e.target.value)}
                             />
                         </td>
                      </tr>
                   ))}
                </tbody>
             </table>
          </div>

          {/* Footer Signatures */}
          <div className="border border-black grid grid-cols-3 text-xs">
             {/* Col 1 */}
             <div className="border-r border-black p-2 flex flex-col h-40">
                <div className="font-bold mb-8">Prepared by:</div>
                <div className="flex-grow"></div>
                <div className="mb-6">
                   <div className="mb-2">Course Lecturer</div>
                </div>
                <div>Date :</div>
             </div>

             {/* Col 2 */}
             <div className="border-r border-black p-2 flex flex-col h-40">
                <div className="font-bold mb-8">Reviewed by:</div>
                <div className="flex-grow"></div>
                <div className="mb-2 leading-tight">
                   Course Coordinator/Course Leader/Head of Programme/<br/>
                   Head of Department
                </div>
                <div className="mt-auto">Date:</div>
             </div>

             {/* Col 3 */}
             <div className="p-2 flex flex-col h-40">
                <div className="font-bold mb-8">Endorsed by:</div>
                <div className="flex-grow"></div>
                <div className="mb-2 leading-tight">
                   Course Leader/Head of Programme/<br/>
                   Head of Department
                </div>
                <div className="mt-auto">Date:</div>
             </div>
          </div>

          {/* General Feedback Section */}
          <div className="mt-6 border border-black p-4 bg-yellow-50">
             <h3 className="font-bold text-sm uppercase mb-2">General Feedback / Instructions for Revision:</h3>
             <textarea 
                className="w-full bg-transparent outline-none resize-none text-sm font-medium min-h-[100px]"
                placeholder="Enter overall feedback here..."
                value={generalFeedback}
                onChange={(e) => setGeneralFeedback(e.target.value)}
                readOnly={!isReviewer && !isEndorser}
             />
          </div>

       </A4Page>

       {/* Floating Action Bar for Reviewer */}
       {isReviewer && (
          <div className="fixed bottom-8 right-8 flex gap-4 animate-in slide-in-from-bottom-10 duration-500">
             <button 
               onClick={() => onReturn && onReturn(generalFeedback, reviews, notes)} 
               className="bg-rose-600 text-white px-6 py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-rose-700 transition shadow-2xl transform active:scale-95 flex items-center gap-3"
             >
                <span>↩</span> Return to Sender
             </button>
             <button 
               onClick={() => onApprove && onApprove(generalFeedback, reviews, notes)} 
               className="bg-emerald-600 text-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-emerald-700 transition shadow-2xl transform active:scale-95 flex items-center gap-3"
             >
                <span>✓</span> Approve & Forward
             </button>
          </div>
       )}

       {/* Floating Action Bar for Endorser */}
       {isEndorser && (
          <div className="fixed bottom-8 right-8 flex gap-4 animate-in slide-in-from-bottom-10 duration-500">
             <button 
               onClick={() => onReturn && onReturn(generalFeedback, reviews, notes)} 
               className="bg-rose-600 text-white px-6 py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-rose-700 transition shadow-2xl transform active:scale-95 flex items-center gap-3"
             >
                <span>↩</span> Return to Reviewer
             </button>
             <button 
               onClick={() => onApprove && onApprove(generalFeedback, reviews, notes)} 
               className="bg-emerald-600 text-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-emerald-700 transition shadow-2xl transform active:scale-95 flex items-center gap-3"
             >
                <span>🔒</span> Endorse Assessment
             </button>
          </div>
       )}

       <button 
          onClick={onBack}
          className="fixed top-8 left-8 bg-slate-700 text-white px-4 py-2 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-slate-600 transition shadow-xl"
       >
          ← Back to Preview
       </button>
    </div>
  );
};
