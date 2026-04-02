export interface LearningDomain {
  id: string;
  name: string;
}

export interface Taxonomy {
  id: string;
  domain_id: string;
  level: string;
  description?: string;
}

export interface ItemType {
  id: string;
  code: string;
  name: string;
}

export interface DublinAccord {
  id: string;
  profile_type: "DK" | "DP" | "NA";
  code: string;
  title: string;
  description: string;
}

export interface CLO {
  id: string;
  course_id: string;
  code: string;
  description: string;
}

export interface Topic {
  id: string;
  course_id: string;
  code: string;
  name: string;
  syllabus?: string;
  constructs?: Construct[];
}

export interface Construct {
  id: string;
  topic_id: string;
  code: string;
  description: string;
}

export interface CistRow {
  id: string;
  blueprint_id: string;
  topic_id: string;
  topicCode?: string; // For backend resolution
  construct_id: string;
  domain_id: string | null;
  dublin_accord_id: string | null;
  total_mark: number;
  clo_ids: string[];
  cloCodes?: string[]; // For backend resolution
  item_type_ids: string[];
  taxonomies: {
    taxonomy_id: string;
    count: number;
    marks: number;
  }[];
}

export interface CistBlueprint {
  id: string;
  course_id: string;
  task: string;
  rows: CistRow[];
}

export interface CistRowSupabase {
  id: string;
  topic_id: string;
  construct_id: string;
  domain_id: string | null;
  learning_domains: { name: string };
  dublin_accord_id: string | null;
  dublin_accords: { code: string };
  total_mark: number;
  cist_row_clos: { clo_id: string; clos: { code: string } }[];
  cist_row_item_types: { item_type_id: string; item_types: { code: string } }[];
  cist_row_taxonomies: {
    taxonomy_id: string;
    count: number;
    marks: number;
    taxonomies: { level: string };
  }[];
}

export interface CistBlueprintSupabase {
  id: string;
  task: string;
  cist_rows: CistRowSupabase[];
}

export interface User {
  id: string;
  email: string;
  role: "Administrator" | "Creator" | "Reviewer" | "Endorser" | "Contributor";
  full_name: string;
  position: string;
  deptId?: string;
  programmeId?: string;
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
  code: string;
}

export interface Programme {
  id: string;
  deptId: string;
  name: string;
  code: string;
  headOfProgramme?: string;
}

export interface CISTCognitiveLevel {
  count: string;
  marks: number;
}

export type AssessmentDomain = "Cognitive" | "Psychomotor" | "Affective";

export interface AssessmentTaskPolicy {
  id: string;
  name: string;
  weightage: number;
  duration: string;
  maxTaxonomy: string;
  linkedTopics: string[];
  linkedClos: string[];
}

export interface MatrixRow {
  task?: string;
  clos?: string[];
  topicCode?: string;
  domain?: AssessmentDomain;
  levels?: Record<string, CISTCognitiveLevel>;
  totalMark?: number;
  construct?: string;
  itemTypes?: string[];
  daCluster?: string;
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
  answerImageUrl?: string;
  answerFigureLabel?: string;
  marks?: number;
  subParts?: QuestionPart[];
  mediaType?: "figure" | "table" | "table-figure";
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
  answerImageUrl?: string;
  answerFigureLabel?: string;
  marks: number;
  taxonomy?: string;
  construct?: string;
  domain?: AssessmentDomain;
  type:
    | "mcq"
    | "short-answer"
    | "essay"
    | "calculation"
    | "diagram-label"
    | "measurement"
    | "structure";
  options?: string[];
  imageUrl?: string;
  figureLabel?: string;
  mediaType?: "figure" | "table" | "table-figure";
  tableData?: {
    headers: string[];
    rows: string[][];
    label?: string;
  };
  subQuestions?: QuestionPart[];
  topic?: string;
  cloKey?: string;
  cloKeys?: string[];
  daCluster?: string;
  daKeys?: string[];
}

export interface FooterData {
  preparedBy: string;
  reviewedBy: string;
  endorsedBy: string;
  preparedDate: string;
  reviewedDate: string;
  endorsedDate: string;
}

export interface PaperVersion {
  id: string;
  timestamp: string;
  savedBy: string;
  action: string;
  data: Omit<AssessmentPaper, "history">;
}

export interface TemplateSection {
  id: string;
  type: "header" | "matrix" | "student-info" | "instructions" | "questions" | "footer" | "custom-text";
  title?: string;
  visible: boolean;
  config?: Record<string, unknown>;
}

export interface AssessmentTemplate {
  id: string;
  name: string;
  description?: string;
  sections: TemplateSection[];
  layout: {
    fontFamily?: string;
    fontSize?: string;
    margins?: { top: string; right: string; bottom: string; left: string };
  };
  isDefault?: boolean;
}

export interface AssessmentPaper {
  id?: string;
  templateId?: string;
  courseId?: string;
  header: HeaderData;
  matrix: MatrixRow[];
  studentInfo: StudentSectionData;
  instructions: string[];
  questions: Question[];
  footer: FooterData;
  cloDefinitions?: Record<string, string>;
  daClusters?: Record<string, string>;
  createdAt?: string;
  status?: "draft" | "submitted" | "returned" | "reviewed" | "endorsed";
  authorId?: string;
  assignedReviewerId?: string;
  feedback?: string;
  checklist?: string[];
  checklistNotes?: string[];
  history?: PaperVersion[];
}

export interface Course {
  id: string;
  code: string;
  name: string;
  deptId: string;
  programmeId: string;
  clos: Record<string, string>;
  da: Record<string, string>;
  daMappings?: Record<string, string[]>;
  topics?: Topic[];
  assessmentPolicies?: AssessmentTaskPolicy[];
  jsuTemplate?: MatrixRow[];
  blueprints?: CistBlueprint[];
  syllabus?: string;
}

