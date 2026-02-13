
import { Question, AssessmentPaper, Course, InstitutionalBranding } from './types';

export const DEFAULT_BRANDING: InstitutionalBranding = {
  institutionName: "POLITEKNIK MALAYSIA KUCHING SARAWAK",
  logoUrl: "" // Uses default SVG if empty
};

export const SAMPLE_COURSES: Course[] = [
  {
    id: "course-1",
    code: "DJJ10243",
    name: "WORKSHOP TECHNOLOGY",
    deptId: "1",
    programmeId: "p1",
    clos: {
      "CLO 1": "Apply the knowledge of basic mechanical components and equipment, hand tools and measuring equipment in workshop technology (C3, PLO1)",
      "CLO 2": "Perform workshop operations...",
    },
    mqfs: {
      "DK3": "DK3 – A coherent procedural formulation of engineering fundamentals...",
      "DK4": "DK4 – Engineering specialist knowledge that provides the body of knowledge..."
    },
    jsuTemplate: [
      {
        task: "QUIZ",
        mqfCluster: "DK 3 – A coherent procedural formulation of engineering fundamentals required in an accepted sub-discipline",
        clos: ["CLO 1"],
        topicCode: "1.0 Hand Tools",
        construct: "1.1 Explain the types, parts and uses of:\n1.2 Apply of Measurement Hand Tools",
        itemTypes: ["Objective"],
        levels: {
          "C1": { count: "1", marks: 4 },
          "C2": { count: "1", marks: 0 } // Note: PDF matrix implies C2 presence, though marks might vary in actual Qs
        },
        domain: "Cognitive"
      },
      {
        task: "QUIZ",
        mqfCluster: "DK 4 – Engineering specialist knowledge that provides the body of knowledge for an accepted sub-discipline",
        clos: ["CLO 1"],
        topicCode: "2.0 Drilling",
        construct: "2.1.5 Method to measure the spindle speed revolution (rpm) and the feedrate including factors that influence the selection of the cutting speed.",
        itemTypes: ["Subjective"],
        levels: {
          "C1": { count: "1", marks: 4 },
          "C3": { count: "2", marks: 12 }
        },
        domain: "Cognitive"
      }
    ]
  }
];

export const QUESTION_BANK: Question[] = []; // Kept empty or minimal as we focus on the paper generation

export const INITIAL_PAPER_DATA: AssessmentPaper = {
  header: {
    department: "DEPARTMENT OF MECHANICAL",
    courseCode: "DJJ10243",
    courseName: "WORKSHOP TECHNOLOGY",
    session: "II: 2025/2026",
    assessmentType: "QUIZ",
    percentage: "5%",
    set: "A",
    logoUrl: ""
  },
  matrix: [
    {
      mqfCluster: "DK 3 – A coherent procedural formulation of engineering fundamentals required in an accepted sub-discipline",
      clos: ["CLO 1"],
      topicCode: "1.0 Hand Tools",
      construct: "1.1 Explain the types, parts and uses of:\n1.2 Apply of Measurement Hand Tools",
      itemTypes: ["Objective"],
      levels: { "C1": { count: "1", marks: 4 }, "C2": { count: "1", marks: 0 } },
      domain: "Cognitive"
    },
    {
      mqfCluster: "DK 4 – Engineering specialist knowledge that provides the body of knowledge for an accepted sub-discipline",
      clos: ["CLO 1"],
      topicCode: "2.0 Drilling",
      construct: "2.1.5 Method to measure the spindle speed revolution (rpm) and the feedrate including factors that influence the selection of the cutting speed.",
      itemTypes: ["Subjective"], // Inferred from context
      levels: { "C1": { count: "1", marks: 4 }, "C3": { count: "2", marks: 12 } }, // Q3 (6m) + Q4 (6m)? Mismatch in PDF matrix vs questions, using matrix text for display.
      domain: "Cognitive"
    }
  ],
  studentInfo: {
    duration: "1 HOUR",
    totalMarks: 20
  },
  instructions: [
    "Attempt all questions. Be sure to show your calculation steps clearly, as partial marks may be awarded for correct working.",
    "You are allowed to use a non-programmable scientific calculator."
  ],
  questions: [
    {
      id: "q1",
      number: "1.",
      sectionTitle: "(EXPLAIN THE USE OF THE LISTED TOOLS) (CLO 1)",
      text: "List Four (4) types of hand tools that are used in mechanical workshops. (C1)",
      marks: 4,
      taxonomy: "C1",
      cloKeys: ["CLO 1"],
      topic: "1.0 Hand Tools",
      type: "short-answer",
      answer: "a. Files (1 mark)\nb. Scriber (1 mark)\nc. Ball pen hammer (1 mark)\nd. Chisel (1 mark)\n**any hand tools related to mechanical workshop are accepted",
      mqfKeys: ["DK 3"]
    },
    {
      id: "q2",
      number: "2.",
      sectionTitle: "(CONDUCT THE DRILLING MACHINE OPERATION) (CLO 1)",
      text: "State Four (4) method to classify drill bit size. (C1)",
      marks: 4,
      taxonomy: "C1",
      cloKeys: ["CLO 1"],
      topic: "2.0 Drilling",
      type: "short-answer",
      answer: "• Metric (1 mark)\n• Fractional (1 mark)\n• Number (1 mark)\n• Letter (1 mark)",
      mqfKeys: ["DK 4"]
    },
    {
      id: "q3",
      number: "3.",
      sectionTitle: "(APPLY OF MEASUREMENT HAND TOOLS) (CLO 1)",
      text: "Based on Vernier caliper and micrometer in Figure 1 below, determine the correct reading (C3)",
      marks: 6,
      taxonomy: "C3",
      cloKeys: ["CLO 1"],
      topic: "1.0 Hand Tools",
      type: "structure",
      mqfKeys: ["DK 3"],
      subQuestions: [
        {
           label: "",
           text: "**Vernier Caliper Reading:**",
           imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/f/da/Vernier_caliper_scales.svg/1200px-Vernier_caliper_scales.svg.png", 
           figureLabel: "",
           marks: 3,
           mediaType: "figure",
           answer: "Main scale reading: 0.00 cm (1 mark)\nVernier scale reading: 0.06 cm (1 mark)\nMeasurement reading: 0.06 cm (1 mark)"
        },
        {
           label: "",
           text: "**Micrometer Reading:**",
           imageUrl: "https://upload.wikimedia.org/wikipedia/commons/1/1d/Micrometer_reading_2.jpg",
           figureLabel: "Figure 1",
           marks: 3,
           mediaType: "figure",
           answer: "First part of the measurement: 2.50 mm (1 mark)\nSecond part of the measurement: 0.38 mm (1 mark)\nFinal measurement: 2.88 mm (1 mark)"
        }
      ]
    },
    {
      id: "q4",
      number: "4.",
      sectionTitle: "(CONDUCT THE DRILLING MACHINE OPERATION) (CLO 1)",
      text: "Determine the feed rate, $V_f$ for drilling Low Carbon Steel using a 6.0 mm drill bit (2 flutes). Use a cutting speed, $V_s$ of 70 m/min and a chip load, $f_z$ of 0.025 mm/tooth. (C3)",
      marks: 6,
      taxonomy: "C3",
      cloKeys: ["CLO 1"],
      topic: "2.0 Drilling",
      type: "calculation",
      mqfKeys: ["DK 4"],
      answer: "Given: $V_c = 70$ m/min, $f_z = 0.025$ mm/tooth, $D = 6$ mm, $z = 2$\n\n1. Calculate Spindle Speed ($N$):\n$$ N = \\frac{V_c \\times 1000}{\\pi \\times D} = \\frac{70 \\times 1000}{3.142 \\times 6} = 3713.14 \\text{ rpm} $$ (3 marks)\n\n2. Calculate Feed Rate ($V_f$):\n$$ V_f = f_z \\times z \\times N = 0.025 \\times 2 \\times 3713.14 = 185.66 \\text{ mm/min} $$ (3 marks)"
    }
  ],
  footer: {
    preparedBy: "WILSON BIN INTAI\n(COURSE LECTURER)",
    reviewedBy: "PN. HAJAH\n(COURSE COORDINATOR)",
    endorsedBy: "TN. HJ. RAMLI\n(HEAD OF DEPARTMENT)",
    preparedDate: "12 FEB 2026",
    reviewedDate: "15 FEB 2026",
    endorsedDate: "18 FEB 2026"
  },
  status: 'draft'
};
