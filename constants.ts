
import { Question, AssessmentPaper, Course, InstitutionalBranding } from './types';

export const DEFAULT_BRANDING: InstitutionalBranding = {
  institutionName: "POLITEKNIK MALAYSIA KUCHING SARAWAK",
  logoUrl: ""
};

export const SAMPLE_COURSES: Course[] = [
  {
    id: "course-1",
    code: "DJJ10243",
    name: "WORKSHOP TECHNOLOGY",
    // Fixed: replaced 'department' with 'deptId' and added required 'programmeId' to match Course interface in types.ts
    deptId: "1",
    programmeId: "p1",
    clos: {
      "CLO 1": "Explain the use of listed workshop tools correctly.",
      "CLO 2": "Perform workshop operations according to safety standards.",
      "CLO 3": "Apply measurements using precise hand tools."
    },
    mqfs: {
      "DK1": "Descriptive Knowledge",
      "DK3": "Specialist Knowledge",
      "DK4": "Specialist Knowledge: Measurements"
    }
  },
  {
    id: "course-2",
    code: "DJJ20063",
    name: "ENGINEERING MECHANICS",
    // Fixed: replaced 'department' with 'deptId' and added required 'programmeId' to match Course interface in types.ts
    deptId: "1",
    programmeId: "p2",
    clos: {
      "CLO 1": "Analyze static equilibrium for particles and rigid bodies.",
      "CLO 2": "Calculate moments of inertia and centroids for composite areas.",
      "CLO 3": "Apply kinematics principles to solve particle motion problems."
    },
    mqfs: {
      "DK2": "Research-based Knowledge",
      "DK4": "Engineering Problems",
      "DK5": "Engineering Design"
    }
  },
  {
    id: "course-3",
    code: "DEC10013",
    name: "COMPUTER SYSTEM & NETWORKS",
    // Fixed: replaced 'department' with 'deptId' and added required 'programmeId' to match Course interface in types.ts
    deptId: "2",
    programmeId: "p3",
    clos: {
      "CLO 1": "Identify the internal components of a computer system.",
      "CLO 2": "Configure basic local area network (LAN) settings.",
      "CLO 3": "Troubleshoot common operating system installation errors."
    },
    mqfs: {
      "DK1": "Computing Fundamentals",
      "DK2": "Network Architecture",
      "DK3": "System Security"
    }
  }
];

export const QUESTION_BANK: Question[] = [
  // --- WORKSHOP TECHNOLOGY (course-1) ---
  {
    id: "q-101",
    courseId: "course-1",
    topic: "1.0 Hand Tools",
    cloKeys: ["CLO 1"],
    sectionTitle: "PART A: IDENTIFICATION",
    number: "1.",
    text: "Identify the main components of a Vernier Caliper as shown in the diagram. Explain why zero error calibration is essential before measurement.",
    marks: 5,
    type: "diagram-label",
    mqfKeys: ["DK1"],
    imageUrl: "https://images.unsplash.com/photo-1581092160562-40aa08e78837?auto=format&fit=crop&q=80&w=400",
    taxonomy: "C1",
    construct: "SS",
    figureLabel: "Figure 1: Standard Metric Vernier Caliper",
    mediaType: "figure",
    answer: "1. Main Jaws (1 mark)\n2. Depth Probe (1 mark)\n3. Vernier Scale (1 mark)\nZero error calibration ensures accuracy by compensating for any offset in the closed jaw position. (2 marks)"
  },
  {
    id: "q-102",
    courseId: "course-1",
    topic: "2.0 Drilling",
    cloKeys: ["CLO 2"],
    sectionTitle: "PART B: CALCULATION",
    number: "2.",
    text: "A milling cutter has a diameter ($D$) of $50$ mm and rotates at $N$ RPM. Given the cutting speed $V_c$ formula: \n\n $$V_c = \\frac{\\pi \\times D \\times N}{1000}$$ \n\n Calculate the required spindle speed ($N$) if the cutting speed is $V_c = 30$ m/min.",
    marks: 10,
    type: "calculation",
    mqfKeys: ["DK3", "DK4"],
    taxonomy: "C3",
    construct: "SS",
    subQuestions: [
      { label: "a)", text: "Rearrange the formula to solve for $N$ in terms of $V_c$ and $D$.", marks: 3, answer: "$N = \\frac{1000 \\times V_c}{\\pi \\times D}$ (3 marks)" },
      { label: "b)", text: "Calculate the value of $N$ in RPM. Round to the nearest integer.", marks: 7, answer: "$N = \\frac{1000 \\times 30}{\\pi \\times 50} \\approx 191$ RPM (7 marks)" }
    ]
  },
  {
    id: "q-103",
    courseId: "course-1",
    topic: "1.0 Hand Tools",
    cloKeys: ["CLO 1"],
    number: "3.",
    text: "Which of the following is the standard angle for a center punch tip?",
    marks: 1,
    type: "mcq",
    options: ["30 degrees", "60 degrees", "90 degrees", "120 degrees"],
    mqfKeys: ["DK1"],
    taxonomy: "C1",
    construct: "GS",
    answer: "Option C: 90 degrees (1 mark)"
  },

  // --- ENGINEERING MECHANICS (course-2) ---
  {
    id: "q-201",
    courseId: "course-2",
    topic: "4.0 Equilibrium of Rigid Bodies",
    cloKeys: ["CLO 1"],
    sectionTitle: "PART C: STATICS",
    number: "4.",
    text: "The table below shows the forces acting on a 2D truss at nodes A, B, and C. Analyze the vertical equilibrium.",
    marks: 8,
    type: "short-answer",
    mqfKeys: ["DK4"],
    taxonomy: "C4",
    construct: "SS",
    mediaType: "table",
    tableData: {
      label: "Table 1: Applied Nodal Forces",
      headers: ["Node", "Force (kN)", "Direction", "Angle (°)"],
      rows: [
        ["A", "10", "Down", "90"],
        ["B", "15", "Left", "180"],
        ["C", "20", "Diagonal", "45"]
      ]
    },
    answer: "Sum of vertical forces: $-10 - 20 \\sin(45) = -24.14$ kN. (4 marks)\nTruss is not in vertical equilibrium. (4 marks)"
  },
  {
    id: "q-202",
    courseId: "course-2",
    topic: "1.0 Resultant Forces",
    cloKeys: ["CLO 1"],
    number: "5.",
    text: "Define 'Parallelogram Law of Forces' and illustrate how it is used to find a resultant force.",
    marks: 5,
    type: "essay",
    mqfKeys: ["DK2"],
    taxonomy: "C2",
    construct: "GS",
    answer: "The law states that if two forces acting at a point be represented in magnitude and direction by the two adjacent sides of a parallelogram... (3 marks)\nThe diagonal represents the resultant. (2 marks)"
  }
];

export const INITIAL_PAPER_DATA: AssessmentPaper = {
  header: {
    department: "DEPARTMENT OF MECHANICAL ENGINEERING",
    courseCode: "DJJ10243",
    courseName: "WORKSHOP TECHNOLOGY",
    session: "II: 2025/2026",
    assessmentType: "QUIZ 1",
    percentage: "5%",
    set: "A",
    logoUrl: ""
  },
  matrix: [],
  studentInfo: {
    duration: "45 MINUTES",
    totalMarks: 0
  },
  instructions: [
    "Answer all questions in the space provided.",
    "Calculations must show all steps and units clearly.",
    "Programmable calculators are strictly prohibited."
  ],
  questions: [],
  footer: {
    preparedBy: "MOHD AMIRUL (LECTURER)",
    reviewedBy: "HJH. SITI KHADIJAH (COURSE COORDINATOR)",
    endorsedBy: "TN. HJ. RAMLI (HEAD OF DEPARTMENT)",
    preparedDate: "12 FEB 2025",
    reviewedDate: "15 FEB 2025",
    endorsedDate: "18 FEB 2025"
  }
};
