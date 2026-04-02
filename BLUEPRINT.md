# PolyGen: Assessment Paper Generator Blueprint

## 1. Project Overview
PolyGen is a centralized command hub for polytechnic assessment generation, CIST mapping, and institutional quality assurance. It leverages AI to streamline the creation of high-quality assessment papers while ensuring alignment with academic standards.

## 2. Core Features

### A. Authentication & User Management
- **Google SSO (Supabase Auth):** Secure staff-only access using institutional Google accounts.
- **Automated Profiles:** Real-time creation of staff profiles (Name, Position, Department) upon first login.
- **Role-Based Access:** (Future Expansion) Support for Lecturers, Course Coordinators, and Heads of Department.

### B. Dashboard (Command Hub)
- **Quick Stats:** Total questions in bank, papers generated, and active courses.
- **Recent Activity:** Feed of recently edited papers or newly added questions.
- **Action Center:** Primary buttons for "Generate New Paper" and "Add Question".

### C. Question Bank Management
- **Structured Storage:** Questions categorized by Subject, Topic, and Type (MCQ, Short Answer, Essay).
- **Metadata Mapping:** Every question is mapped to:
    - **CLO:** Course Learning Outcomes.
    - **Bloom's Taxonomy:** C1 (Knowledge) to C6 (Evaluation).
    - **Difficulty:** Easy, Medium, Hard.
- **Search & Filter:** Advanced filtering by metadata to find specific questions quickly.

### D. AI-Powered Paper Generator
- **Parameter Selection:** Define Subject, Assessment Type (Final, Mid-term, Quiz), and Total Marks.
- **Distribution Logic:** AI ensures a balanced distribution of difficulty and Bloom's levels.
- **Gemini Integration:** Uses Gemini 3.1 Pro to suggest new questions or select the best matches from the bank based on parameters.

### E. Live Paper Editor & Export
- **WYSIWYG Editor:** Reorder questions, adjust marks, and edit text in real-time.
- **Institutional Branding:** Automated header generation with Polytechnic logo and course details.
- **Export:** High-quality PDF generation ready for printing.

## 3. Technical Stack

| Layer | Technology |
| :--- | :--- |
| **Frontend** | React 19, Vite, TypeScript |
| **Styling** | Tailwind CSS (Enterprise/Technical Aesthetic) |
| **Icons** | Lucide React |
| **State Management** | React Hooks + Context API |
| **Backend/DB** | Supabase (PostgreSQL) |
| **Auth** | Supabase Auth (Google OAuth) |
| **AI Engine** | Google Gemini 3.1 Pro |
| **Charts** | Recharts |

## 4. Database Schema (Supabase)

The database is structured to maintain institutional integrity:
- `profiles`: User identity.
- `departments` / `programmes` / `courses`: Academic hierarchy.
- `question_bank`: The core repository of assessment items.
- `assessment_papers`: Metadata and configuration for generated papers.
- `paper_questions`: Junction table for specific paper compositions.

## 5. Visual Identity
- **Primary Color:** Cyan/Teal Gradient (`from-cyan-400 to-teal-400`).
- **Background:** Slate Dark (`#0f172a` for sidebar, `#f8fafc` for content).
- **Typography:** Inter (Sans) for UI, JetBrains Mono for technical data.
