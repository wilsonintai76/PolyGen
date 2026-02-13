
import React, { useState, useEffect } from 'react';
import { DashboardLayout } from './components/DashboardLayout';
import { BrandingManager } from './components/BrandingManager';
import { CourseManager } from './components/CourseManager';
import { BankManagement } from './components/bank/BankManagement';
import { LibraryView } from './components/library/LibraryView';
import { HelpGuide } from './components/help/HelpGuide';
import { UserManagement } from './components/admin/UserManagement';
import { DepartmentManager } from './components/admin/DepartmentManager';
import { ProgrammeManager } from './components/admin/ProgrammeManager';
import { GlobalMqfManager } from './components/admin/GlobalMqfManager';
import { SessionManager } from './components/admin/SessionManager';
import { CISTTemplateManager } from './components/admin/CISTTemplateManager';
import { AssessmentPaper, Course, InstitutionalBranding, Question, User, Department, Programme, GlobalMqf, MatrixRow, Session, FooterData } from './types';
import { DEFAULT_BRANDING, INITIAL_PAPER_DATA, SAMPLE_COURSES, QUESTION_BANK } from './constants';
import { A4Page } from './components/layout/A4Page';
import { HeaderTable } from './components/header/HeaderTable';
import { MatrixTable } from './components/matrix/MatrixTable';
import { StudentInfoTable } from './components/student/StudentInfoTable';
import { QuestionItem } from './components/questions/QuestionItem';
import { SignatureFooter } from './components/footer/SignatureFooter';
import { AnswerSchemeTable } from './components/scheme/AnswerSchemeTable';
import { InstructionsSection } from './components/instructions/InstructionsSection';
import { SetupForm } from './components/setup/SetupForm';
import { CISTManager } from './components/cist/CISTManager';
import { DashboardStats } from './components/dashboard/DashboardStats';
import { PreviewToolbar } from './components/preview/PreviewToolbar';
import { AssessmentReviewForm } from './components/review/AssessmentReviewForm';
import { AiAssistant } from './components/chatbot/AiAssistant';
import { LoginPage } from './components/auth/LoginPage';
import { api } from './services/api';

type Step = 'dashboard' | 'branding' | 'courses' | 'manage-bank' | 'library' | 'setup' | 'cist' | 'preview' | 'review-checklist' | 'help' | 'users' | 'departments' | 'programmes' | 'global-mqf' | 'manage-cist' | 'sessions';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<User | undefined>(undefined);
  const [step, setStep] = useState<Step>('dashboard');
  
  const [branding, setBranding] = useState<InstitutionalBranding>(DEFAULT_BRANDING);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [customBank, setCustomBank] = useState<Question[]>([]);
  const [library, setLibrary] = useState<AssessmentPaper[]>([]);
  const [activePaper, setActivePaper] = useState<AssessmentPaper>(INITIAL_PAPER_DATA);
  const [activeCourseForCist, setActiveCourseForCist] = useState<Course | null>(null);
  const [departments, setDepartments] = useState<Department[]>([]);

  const [programmes, setProgrammes] = useState<Programme[]>([
    { id: 'p1', deptId: '1', name: 'DIPLOMA IN MECHANICAL ENGINEERING', code: 'DKM' },
    { id: 'p2', deptId: '1', name: 'DIPLOMA IN MECHATRONICS ENGINEERING', code: 'DEM' },
    { id: 'p3', deptId: '2', name: 'DIPLOMA IN INFORMATION TECHNOLOGY (DIGITAL TECHNOLOGY)', code: 'DDT' }
  ]);

  const [globalMqfs, setGlobalMqfs] = useState<GlobalMqf[]>([
    { id: '1', code: 'DK1', description: 'Descriptive Understanding' },
    { id: '2', code: 'DK2', description: 'Concept-based Knowledge' },
    { id: '3', code: 'DK3', description: 'Fundamentals formulation' },
    { id: '4', code: 'DK4', description: 'Engineering Specialist Knowledge' }
  ]);

  const [editMode, setEditMode] = useState(false);
  const [viewScheme, setViewScheme] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('poly_auth_token');
    const savedUser = localStorage.getItem('poly_user');
    if (token && savedUser) {
        setIsAuthenticated(true);
        setUser(JSON.parse(savedUser));
    }
    initData();
  }, []);

  async function initData() {
      try {
        const [brandingData, sessionsData, coursesData, questionsData, libraryData, deptsData] = await Promise.all([
          api.branding.get().catch(() => DEFAULT_BRANDING),
          api.sessions.list(),
          api.courses.list().then(res => res.length ? res : (SAMPLE_COURSES as unknown as Course[])),
          api.questions.list().then(res => res.length ? res : QUESTION_BANK),
          api.papers.list(),
          api.departments.list()
        ]);
        if (brandingData) setBranding(brandingData);
        setSessions(sessionsData);
        setCourses(coursesData as Course[]);
        setCustomBank(questionsData);
        setLibrary(libraryData);
        setDepartments(deptsData);
      } catch (err) {
        console.error("Initialization error", err);
      } finally {
        setIsLoading(false);
      }
  }

  const handleLogin = (user: User, token: string) => {
      localStorage.setItem('poly_auth_token', token);
      localStorage.setItem('poly_user', JSON.stringify(user));
      setUser(user);
      setIsAuthenticated(true);
  };

  const handleLogout = () => {
      localStorage.clear();
      setIsAuthenticated(false);
      setUser(undefined);
  };

  const activeSession = sessions.find(s => s.isActive);

  const resolveSignatories = (courseId?: string): FooterData => {
    const course = courses.find(c => c.id === courseId);
    const dept = departments.find(d => d.id === course?.deptId);
    
    return {
      preparedBy: user?.full_name || "LECTURER",
      preparedDate: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).toUpperCase(),
      reviewedBy: "SITI AMINAH (COORDINATOR)",
      reviewedDate: "",
      endorsedBy: dept?.headOfDept || "HEAD OF DEPARTMENT",
      endorsedDate: ""
    };
  };

  const renderContent = () => {
    switch (step) {
      case 'dashboard':
        const pendingReviews = user?.role === 'reviewer' ? library.filter(p => p.status === 'draft' || !p.status) : [];
        const pendingEndorsements = user?.role === 'endorser' ? library.filter(p => p.status === 'reviewed') : [];
        
        return (
          <div className="p-10 max-w-7xl mx-auto animate-in fade-in slide-in-from-bottom-6 duration-700">
            <header className="mb-12 flex justify-between items-end">
              <div>
                <h2 className="text-5xl font-black text-slate-900 tracking-tighter uppercase">Academic Command Hub</h2>
                <p className="text-slate-500 font-bold uppercase text-[11px] tracking-[0.3em] mt-2 italic border-l-4 border-blue-600 pl-4">Institutional Quality Control Active</p>
                {activeSession && (
                  <div className="mt-4 bg-blue-50 border border-blue-100 px-4 py-1.5 rounded-full inline-flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
                    <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest">Active Session: {activeSession.name}</span>
                  </div>
                )}
              </div>
            </header>

            {(pendingReviews.length > 0 || pendingEndorsements.length > 0) && (
               <div className="mb-12">
                  <h3 className="text-lg font-black text-slate-800 uppercase tracking-widest mb-6 flex items-center gap-3">
                    <span className="text-2xl">⚡</span> Pending Tasks
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                     {[...pendingReviews, ...pendingEndorsements].map((paper, idx) => (
                        <div key={idx} onClick={() => { setActivePaper(paper); setStep('preview'); }} className="bg-white p-6 rounded-[24px] shadow-sm border border-slate-100 hover:shadow-md hover:border-blue-200 transition cursor-pointer group">
                           <div className="flex justify-between items-start mb-4">
                              <span className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase ${paper.status === 'reviewed' ? 'bg-emerald-100 text-emerald-600' : 'bg-purple-100 text-purple-600'}`}>
                                 {paper.status === 'reviewed' ? 'Ready for Endorsement' : 'Ready for Review'}
                              </span>
                              <span className="text-[10px] font-bold text-slate-400">{paper.header.courseCode}</span>
                           </div>
                           <h4 className="text-base font-black text-slate-800 mb-1 group-hover:text-blue-600 transition-colors">{paper.header.courseName}</h4>
                           <p className="text-xs text-slate-500 font-medium mb-4">{paper.header.assessmentType}</p>
                           <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400">
                              <span>Created by {paper.footer?.preparedBy?.split('(')[0] || 'Lecturer'}</span>
                           </div>
                        </div>
                     ))}
                  </div>
               </div>
            )}

            <DashboardStats courseCount={courses.length} bankCount={customBank.length} libraryCount={library.length} />
          </div>
        );
      case 'departments':
        return <DepartmentManager departments={departments} onUpdate={initData} />;
      case 'branding':
        return <BrandingManager branding={branding} onUpdate={setBranding} />;
      case 'courses':
        return <CourseManager user={user} courses={courses} departments={departments} programmes={programmes} globalMqfs={globalMqfs} onSave={c => api.courses.save(c).then(initData)} onDelete={id => api.courses.delete(id).then(initData)} onManageJsu={c => { setActiveCourseForCist(c); setStep('manage-cist'); }} />;
      case 'manage-cist':
        if (!activeCourseForCist) { setStep('courses'); return null; }
        return <CISTTemplateManager course={activeCourseForCist} onCancel={() => { setActiveCourseForCist(null); setStep('courses'); }} onSave={u => api.courses.save(u).then(() => { initData(); setActiveCourseForCist(null); setStep('courses'); })} />;
      case 'manage-bank':
        return <BankManagement onBack={() => setStep('dashboard')} onSave={q => api.questions.save(q).then(initData)} onBatchAdd={() => {}} currentBank={customBank} availableClos={[]} availableMqf={[]} onAddCLO={() => {}} onAddMQF={() => {}} availableCourses={courses} />;
      case 'library':
        return <LibraryView onBack={() => setStep('dashboard')} papers={library} onLoad={p => { setActivePaper(p); setStep('preview'); }} />;
      case 'setup':
        return (
          <div className="p-4 flex justify-center animate-in zoom-in duration-500 w-full">
            <SetupForm 
              header={activePaper.header}
              student={activePaper.studentInfo} footer={activePaper.footer} instructions={activePaper.instructions} questions={activePaper.questions} cloDefinitions={activePaper.cloDefinitions || {}} mqfClusters={activePaper.mqfClusters || {}}
              onUpdateHeader={h => setActivePaper({...activePaper, header: h})}
              onUpdateStudent={s => setActivePaper({...activePaper, studentInfo: s})}
              onUpdateFooter={f => setActivePaper({...activePaper, footer: f})}
              onUpdateInstructions={ins => setActivePaper({...activePaper, instructions: ins})}
              onUpdateCLOs={clos => setActivePaper({...activePaper, cloDefinitions: clos})}
              onUpdateMQF={mqf => setActivePaper({...activePaper, mqfClusters: mqf})}
              onNext={() => {
                const autoFooter = resolveSignatories(activePaper.courseId);
                setActivePaper(prev => ({ ...prev, footer: autoFooter }));
                setStep('cist');
              }}
              availableCourses={courses}
              currentUser={user}
              departments={departments}
              onCourseSelect={(id) => {
                 const c = courses.find(item => item.id === id);
                 if (c) {
                   const dept = departments.find(d => d.id === c.deptId);
                   setActivePaper({
                     ...activePaper, 
                     courseId: c.id, 
                     matrix: c.jsuTemplate || [],
                     cloDefinitions: c.clos,
                     mqfClusters: c.mqfs,
                     header: {
                       ...activePaper.header, 
                       courseCode: c.code, 
                       courseName: c.name, 
                       department: dept?.name || '',
                       session: activeSession?.name || ''
                     }
                   });
                 }
              }}
            />
          </div>
        );
      case 'cist':
        return (
          <CISTManager 
            currentQuestions={activePaper.questions}
            onUpdateQuestions={qs => setActivePaper({...activePaper, questions: qs})}
            availableCourses={courses} activeCourseId={activePaper.courseId}
            fullBank={customBank} onBack={() => setStep('setup')} onNext={() => setStep('preview')}
            assessmentType={activePaper.header.assessmentType}
          />
        );
      case 'preview':
        const totalMarks = activePaper.questions.reduce((sum, q) => sum + q.marks, 0);
        const paperToDisplay = { ...activePaper, studentInfo: { ...activePaper.studentInfo, totalMarks } };
        return (
          <div className="bg-slate-800 min-h-screen py-20 flex flex-col items-center relative overflow-x-hidden custom-scrollbar">
            <PreviewToolbar 
                editMode={editMode} 
                viewScheme={viewScheme} 
                onToggleEdit={() => setEditMode(!editMode)} 
                onToggleScheme={() => setViewScheme(!viewScheme)} 
                onSave={async () => { await api.papers.save(activePaper); setStep('library'); }} 
                onPrint={() => window.print()} 
                onBack={() => setStep('dashboard')}
                onReviewChecklist={() => setStep('review-checklist')}
            />
            <A4Page className="shadow-[0_40px_100px_rgba(0,0,0,0.6)] print-exact rounded-sm transform origin-top scale-[1.02] transition-all duration-700">
               <HeaderTable data={paperToDisplay.header} editMode={editMode} onUpdate={h => setActivePaper({...activePaper, header: h})} />
               {viewScheme ? (
                 <AnswerSchemeTable paper={paperToDisplay} editMode={editMode} onUpdateQuestion={q => setActivePaper({...activePaper, questions: activePaper.questions.map(item => item.id === q.id ? q : item)})} />
               ) : (
                 <>
                   <MatrixTable rows={paperToDisplay.matrix.filter(r => r.task === paperToDisplay.header.assessmentType)} editMode={editMode} />
                   <StudentInfoTable data={paperToDisplay.studentInfo} editMode={editMode} onUpdate={s => setActivePaper({...activePaper, studentInfo: s})} />
                   <InstructionsSection instructions={paperToDisplay.instructions} editMode={editMode} onUpdate={ins => setActivePaper({...activePaper, instructions: ins})} />
                   {paperToDisplay.questions.map((q, index) => (
                     <QuestionItem key={q.id} question={q} index={index} editMode={editMode} onUpdate={u => setActivePaper({...activePaper, questions: activePaper.questions.map(item => item.id === u.id ? u : item)})} onRemove={id => setActivePaper(prev => ({ ...prev, questions: prev.questions.filter(q => q.id !== id)}))} />
                   ))}
                 </>
               )}
               <SignatureFooter data={paperToDisplay.footer} editMode={editMode} onUpdate={f => setActivePaper({...activePaper, footer: f})} />
            </A4Page>
          </div>
        );
      case 'review-checklist':
         // Resolve department name from ID if not present in header
         const course = courses.find(c => c.id === activePaper.courseId);
         const dept = departments.find(d => d.id === course?.deptId);
         return (
            <div className="relative">
               <div className="fixed top-4 left-4 z-50 no-print">
                  <button onClick={() => setStep('preview')} className="bg-slate-900 text-white px-6 py-3 rounded-full shadow-xl font-bold text-xs uppercase hover:bg-slate-800 transition">
                     ← Return to Paper
                  </button>
               </div>
               <div className="fixed top-4 right-4 z-50 no-print">
                  <button onClick={() => window.print()} className="bg-blue-600 text-white px-6 py-3 rounded-full shadow-xl font-bold text-xs uppercase hover:bg-blue-700 transition">
                     Print Checklist
                  </button>
               </div>
               <AssessmentReviewForm paper={activePaper} deptName={dept?.name} />
            </div>
         );
      case 'help':
        return <HelpGuide />;
      case 'users':
        return <UserManagement currentUser={user} />;
      case 'programmes':
        return <ProgrammeManager departments={departments} />;
      case 'global-mqf':
        return <GlobalMqfManager attributes={globalMqfs} onUpdate={setGlobalMqfs} />;
      case 'sessions':
        return <SessionManager sessions={sessions} onUpdate={initData} />;
      default:
        return <div>Step not implemented</div>;
    }
  };

  if (isLoading) return <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center text-white"><div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-6"></div><p className="font-black uppercase tracking-[0.3em] text-xs">Accessing Command Hub...</p></div>;
  if (!isAuthenticated) return <LoginPage onLogin={handleLogin} departments={departments} />;

  return (
    <DashboardLayout activeStep={step} onNavigate={setStep} user={user} onLogout={handleLogout}>
      {renderContent()}
      <AiAssistant />
    </DashboardLayout>
  );
}

export default App;
