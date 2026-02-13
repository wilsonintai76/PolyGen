
export interface User {
  username: string;
  role: 'creator' | 'reviewer' | 'endorser' | 'admin';
  full_name: string;
  position: string;
  deptId?: string;
}

export interface Session {
  id: string;
  name: string;
  isActive: boolean;
  isArchived: boolean;
}

export interface Department {
  id: string;
  name: string;
  headOfDept?: string;
}

export interface Programme {
  id: string;
  deptId: string;
  name: string;
  code: string;
}

export interface GlobalMqf {
  id: string;
  code: string;
  description: string;
}

export interface CISTCognitiveLevel {
  count: string;
  marks: number;
}

export type AssessmentDomain = 'Cognitive' | 'Psychomotor' | 'Affective';

export interface MatrixRow {
  task?: string;
  clos?: string[]; 
  topicCode?: string; 
  domain?: AssessmentDomain;
  // Levels are stored as a map of level key (e.g., C1, P1, A1) to count and marks
  levels?: Record<string, CISTCognitiveLevel>; 
  totalMark?: number;
  construct?: string; 
  itemTypes?: string[]; 
  
  // Legacy fields for backward compatibility with existing components
  mqfCluster?: string;
  clo?: string;
  topic?: string;
  itemType?: string;
  taxonomy?: string;
  marks?: number;
  cognitiveLevels?: Record<string, CISTCognitiveLevel>; 
}

export interface HeaderData {
  department: string;
  courseCode: string;
  courseName: string;
  session: string;
  assessmentType: string;
  percentage: string;
  set: string;
  logoUrl?: string;
}

export interface StudentSectionData {
  duration: string;
  totalMarks: number;
}

export interface QuestionPart {
  label?: string;
  text: string;
  answer?: string;
  marks?: number;
  subParts?: QuestionPart[];
  mediaType?: 'figure' | 'table' | 'table-figure';
  imageUrl?: string;
  figureLabel?: string;
  tableData?: {
    headers: string[];
    rows: string[][];
    label?: string;
  };
}

export interface Question {
  id: string;
  courseId?: string;
  sectionTitle?: string;
  cloRef?: string;
  number: string;
  text: string;
  answer?: string;
  marks: number;
  taxonomy?: string;
  construct?: string; 
  domain?: AssessmentDomain;
  type: 'mcq' | 'short-answer' | 'essay' | 'calculation' | 'diagram-label' | 'measurement' | 'structure';
  options?: string[];
  imageUrl?: string;
  figureLabel?: string;
  mediaType?: 'figure' | 'table' | 'table-figure';
  tableData?: {
    headers: string[];
    rows: string[][];
    label?: string;
  };
  subQuestions?: QuestionPart[];
  topic?: string;
  cloKey?: string;
  cloKeys?: string[];
  mqfCluster?: string;
  mqfKeys?: string[];
}

export interface FooterData {
  preparedBy: string;
  reviewedBy: string;
  endorsedBy: string;
  preparedDate: string;
  reviewedDate: string;
  endorsedDate: string;
}

export interface AssessmentPaper {
  id?: string;
  courseId?: string;
  header: HeaderData;
  matrix: MatrixRow[];
  studentInfo: StudentSectionData;
  instructions: string[];
  questions: Question[];
  footer: FooterData;
  cloDefinitions?: Record<string, string>;
  mqfClusters?: Record<string, string>;
  createdAt?: string;
}

export interface Course {
  id: string;
  code: string;
  name: string;
  deptId: string;
  programmeId: string;
  clos: Record<string, string>;
  mqfs: Record<string, string>;
  topics?: string[];
  jsuTemplate?: MatrixRow[];
}

export interface InstitutionalBranding {
  logoUrl?: string;
  institutionName: string;
}
