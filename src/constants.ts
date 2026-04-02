
import { AssessmentPaper, AssessmentTemplate } from './types';

export const DEFAULT_TEMPLATE: AssessmentTemplate = {
  id: 'default-poly-template',
  name: 'Standard Polytechnic Template',
  description: 'The standard layout for polytechnic assessment papers.',
  sections: [
    { id: 'header-1', type: 'header', visible: true },
    { id: 'matrix-1', type: 'matrix', visible: true },
    { id: 'student-info-1', type: 'student-info', visible: true },
    { id: 'instructions-1', type: 'instructions', visible: true },
    { id: 'questions-1', type: 'questions', visible: true },
    { id: 'footer-1', type: 'footer', visible: true },
  ],
  layout: {
    fontFamily: 'Arimo, Arial, sans-serif',
    fontSize: '12pt',
    margins: { top: '15mm', right: '15mm', bottom: '15mm', left: '15mm' }
  },
  isDefault: true
};

export const INITIAL_PAPER_DATA: AssessmentPaper = {
  header: {
    department: "JABATAN TEKNOLOGI MAKLUMAT & KOMUNIKASI",
    courseCode: "DEC10013",
    courseName: "COMPUTER SYSTEM ARCHITECTURE",
    session: "SESSION 1 2024/2025",
    assessmentType: "CONTINUOUS ASSESSMENT (QUIZ)",
    percentage: "10%",
    set: "A",
    logoUrl: ""
  },
  matrix: [],
  studentInfo: {
    duration: "1 HOUR",
    totalMarks: 15
  },
  instructions: [
    "Attempt all questions.",
    "Write your answers in the space provided.",
  ],
  questions: [],
  footer: {
    preparedBy: "AHMAD FAIZAL (LECTURER)",
    reviewedBy: "SITI AMINAH (COORDINATOR)",
    endorsedBy: "DR. WAN AZLAN (HOD)",
    preparedDate: "01 JAN 2024",
    reviewedDate: "",
    endorsedDate: ""
  },
  status: 'draft'
};
