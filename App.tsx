
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
import { AssessmentPaper, Course, InstitutionalBranding, Question, User, Department, Programme, GlobalMqf, MatrixRow, Session } from './types';
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
import { AiAssistant } from './components/chatbot/AiAssistant';
import { LoginPage } from './components/auth/LoginPage';
import { api } from './services/api';

type Step = 'dashboard' | 'branding' | 'courses' | 'manage-bank' | 'library' | 'setup' | 'cist' | 'preview' | 'help' | 'users' | 'departments' | 'programmes' | 'global-mqf' | 'manage-cist' | 'sessions';

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
  
  // Enterprise State
  const [departments, setDepartments] = useState<Department[]>([]);

  const [programmes, setProgrammes] = useState<Programme[]>([
    { id: 'p1', deptId: '1', name: 'DIPLOMA IN MECHANICAL ENGINEERING', code: 'DKM' },
    { id: 'p2', deptId: '1', name: 'DIPLOMA IN MECHATRONICS ENGINEERING', code: 'DEM' },
    { id: 'p3', deptId: '2', name: 'DIPLOMA IN INFORMATION TECHNOLOGY (DIGITAL TECHNOLOGY)', code: 'DDT' }
  ]);

  const [globalMqfs, setGlobalMqfs] = useState<GlobalMqf[]>([
    { id: '1', code: 'DK1', description: 'A descriptive, systematic, theory-based understanding of the natural sciences applicable to the discipline' },
    { id: '2', code: 'DK2', description: 'Concept-based theoretical exposure to disciplines, the use of which support correct and thorough conceptualization' },
    { id: '3', code: 'DK3', description: 'A systematic, theory-based formulation of engineering fundamentals required in the discipline' },
    { id: '4', code: 'DK4', description: 'Engineering specialist knowledge that provides theoretical frameworks and bodies of knowledge for the accepted practice areas' }
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

  const renderContent = () => {
    switch (step) {
      case 'dashboard':
        return (
          <div className="p-10 max-w-7xl mx-auto animate-in fade-in slide-in-from-bottom-6 duration-700">
            <header className="mb-12 flex justify-between items-end">
              <div>
                <h2 className="text-5xl font-black text-slate-900 tracking-tighter uppercase">Academic Command Hub</h2>
                <p className="text-slate-500 font-bold uppercase text-[11px] tracking-[0.3em] mt-2 italic border-l-4 border-blue-600 pl-4">Enterprise Production System V3.5</p>
                {activeSession && (
                  <div className="mt-4 bg-blue-50 border border-blue-100 px-4 py-1.5 rounded-full inline-flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
                    <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest">Active: {activeSession.name}</span>
                  </div>
                )}
              </div>
              <button onClick={() => setStep('setup')} className="bg-blue-600 text-white px-10 py-5 rounded-[24px] font-black shadow-2xl hover:bg-blue-700 transition transform active:scale-95 text-xs tracking-widest uppercase">
                + New Assessment Paper
              </button>
            </header>
            <DashboardStats courseCount={courses.length} bankCount={customBank.length} libraryCount={library.length} />
          </div>
        );
      case 'departments':
        return <DepartmentManager departments={departments} onUpdate={initData} />;
      case 'programmes':
        return <ProgrammeManager departments={departments} />;
      case 'global-mqf':
        return <GlobalMqfManager attributes={globalMqfs} onUpdate={setGlobalMqfs} />;
      case 'sessions':
        return <SessionManager sessions={sessions} onUpdate={initData} />;
      case 'users':
        return <UserManagement currentUser={user} />;
      case 'branding':
        return <BrandingManager branding={branding} onUpdate={setBranding} />;
      case 'courses':
        return (
          <CourseManager 
            user={user} 
            courses={courses} 
            departments={departments} 
            programmes={programmes} 
            globalMqfs={globalMqfs}
            onSave={c => api.courses.save(c).then(initData)} 
            onDelete={id => api.courses.delete(id).then(initData)}
            onManageJsu={(course) => {
              setActiveCourseForCist(course);
              setStep('manage-cist');
            }}
          />
        );
      case 'manage-cist':
        if (!activeCourseForCist) { setStep('courses'); return null; }
        return (
          <CISTTemplateManager 
            course={activeCourseForCist} 
            onCancel={() => { setActiveCourseForCist(null); setStep('courses'); }}
            onSave={(updated) => {
              api.courses.save(updated).then(() => {
                initData();
                setActiveCourseForCist(null);
                setStep('courses');
              });
            }}
          />
        );
      case 'manage-bank':
        return <BankManagement onBack={() => setStep('dashboard')} onSave={q => api.questions.save(q).then(initData)} onBatchAdd={() => {}} currentBank={customBank} availableClos={[]} availableMqf={[]} onAddCLO={() => {}} onAddMQF={() => {}} availableCourses={courses} />;
      case 'library':
        return <LibraryView onBack={() => setStep('dashboard')} papers={library} onLoad={p => { setActivePaper(p); setStep('preview'); }} />;
      case 'setup':
        return (
          <div className="p-10 flex justify-center animate-in zoom-in duration-500">
            <SetupForm 
              header={{ ...activePaper.header, session: activeSession?.name || activePaper.header.session }}
              student={activePaper.studentInfo} footer={activePaper.footer} instructions={activePaper.instructions} questions={activePaper.questions} cloDefinitions={activePaper.cloDefinitions || {}} mqfClusters={activePaper.mqfClusters || {}}
              onUpdateHeader={h => setActivePaper({...activePaper, header: h})}
              onUpdateStudent={s => setActivePaper({...activePaper, studentInfo: s})}
              onUpdateFooter={f => setActivePaper({...activePaper, footer: f})}
              onUpdateInstructions={ins => setActivePaper({...activePaper, instructions: ins})}
              onUpdateCLOs={clos => setActivePaper({...activePaper, cloDefinitions: clos})}
              onUpdateMQF={mqf => setActivePaper({...activePaper, mqfClusters: mqf})}
              onNext={() => setStep('cist')}
              availableCourses={courses}
              onCourseSelect={(id) => {
                 const c = courses.find(item => item.id === id);
                 if (c) {
                   const dept = departments.find(d => d.id === c.deptId);
                   const jsuSlots: MatrixRow[] = c.jsuTemplate ? c.jsuTemplate.map(slot => ({ ...slot })) : [];
                   
                   setActivePaper({
                     ...activePaper, 
                     courseId: c.id, 
                     matrix: jsuSlots,
                     cloDefinitions: c.clos,
                     mqfClusters: c.mqfs,
                     header: {
                       ...activePaper.header, 
                       courseCode: c.code, 
                       courseName: c.name, 
                       department: dept?.name || '',
                       session: activeSession?.name || activePaper.header.session
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
            cloList={Object.keys(activePaper.cloDefinitions || {})}
            mqfList={Object.keys(activePaper.mqfClusters || {})}
            fullBank={customBank} onBack={() => setStep('setup')} onNext={() => setStep('preview')}
          />
        );
      case 'preview':
        const totalMarks = activePaper.questions.reduce((sum, q) => sum + q.marks, 0);
        const paperToDisplay = { ...activePaper, studentInfo: { ...activePaper.studentInfo, totalMarks } };
        return (
          <div className="bg-slate-800 min-h-screen py-20 flex flex-col items-center relative custom-scrollbar overflow-x-hidden">
            <PreviewToolbar editMode={editMode} viewScheme={viewScheme} onToggleEdit={() => setEditMode(!editMode)} onToggleScheme={() => setViewScheme(!viewScheme)} onSave={async () => { await api.papers.save(activePaper); setStep('library'); }} onPrint={() => window.print()} onBack={() => setStep('dashboard')} />
            <A4Page className="shadow-[0_40px_100px_rgba(0,0,0,0.6)] print-exact rounded-sm transform origin-top scale-[1.05] transition-all duration-700">
               <HeaderTable data={paperToDisplay.header} editMode={editMode} onUpdate={h => setActivePaper({...activePaper, header: h})} />
               {viewScheme ? (
                 <AnswerSchemeTable paper={paperToDisplay} editMode={editMode} onUpdateQuestion={q => setActivePaper({...activePaper, questions: activePaper.questions.map(item => item.id === q.id ? q : item)})} />
               ) : (
                 <>
                   <MatrixTable rows={paperToDisplay.matrix} editMode={editMode} onUpdate={rows => setActivePaper({...activePaper, matrix: rows})} />
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
      case 'help':
        return <HelpGuide />;
      default:
        return <div>Step not implemented</div>;
    }
  };

  if (isLoading) return <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center text-white"><div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-6"></div><p className="font-black uppercase tracking-[0.3em] text-xs">Initializing Enterprise Environment...</p></div>;
  if (!isAuthenticated) return <LoginPage onLogin={handleLogin} departments={departments} />;

  return (
    <DashboardLayout activeStep={step} onNavigate={setStep} user={user} onLogout={handleLogout}>
      {renderContent()}
      <AiAssistant />
    </DashboardLayout>
  );
}

export default App;
