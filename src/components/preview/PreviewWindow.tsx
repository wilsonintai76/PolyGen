import React from 'react';
import { A4Page } from '../layout/A4Page';
import { HeaderTable } from '../header/HeaderTable';
import { MatrixTable } from '../matrix/MatrixTable';
import { StudentInfoTable } from '../student/StudentInfoTable';
import { QuestionItem } from '../questions/QuestionItem';
import { SignatureFooter } from '../footer/SignatureFooter';
import { AnswerSchemeTable } from '../scheme/AnswerSchemeTable';
import { InstructionsSection } from '../instructions/InstructionsSection';
import { AssessmentPaper } from '../../types';

interface PreviewWindowProps {
  paper: AssessmentPaper;
  viewScheme: boolean;
  onClose: () => void;
  globalLogoUrl?: string;
}

export function PreviewWindow({ paper, viewScheme, onClose, globalLogoUrl }: PreviewWindowProps) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-2xl overflow-hidden w-full max-w-4xl h-[90vh]">
        <div className="p-4 bg-slate-100 flex justify-between items-center">
          <h2 className="text-lg font-bold">Live Preview</h2>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-800">&times;</button>
        </div>
        <div className="p-8 overflow-y-auto h-full">
          <A4Page>
            <HeaderTable data={paper.header} editMode={false} onUpdate={() => {}} globalLogoUrl={globalLogoUrl} />
            {viewScheme ? (
              <AnswerSchemeTable paper={paper} editMode={false} onUpdateQuestion={() => {}} />
            ) : (
              <>
                <MatrixTable rows={paper.matrix.filter(r => r.task === paper.header.assessmentType)} editMode={false} />
                <StudentInfoTable data={paper.studentInfo} editMode={false} onUpdate={() => {}} />
                <InstructionsSection instructions={paper.instructions} editMode={false} onUpdate={() => {}} />
                {paper.questions.map((q, index) => (
                  <QuestionItem key={q.id} question={q} index={index} editMode={false} onUpdate={() => {}} onRemove={() => {}} />
                ))}
              </>
            )}
            <SignatureFooter data={paper.footer} editMode={false} onUpdate={() => {}} />
          </A4Page>
        </div>
      </div>
    </div>
  );
}
