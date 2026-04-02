import React, { useState, useEffect } from "react";
import { DashboardLayout } from "./components/DashboardLayout";
import { CourseManager } from "./components/CourseManager";
import { BankManagement } from "./components/bank/BankManagement";
import { LibraryView } from "./components/library/LibraryView";
import { HelpGuide } from "./components/help/HelpGuide";
import { UserManagement } from "./components/admin/UserManagement";
import { DepartmentManager } from "./components/admin/DepartmentManager";
import { ProgrammeManager } from "./components/admin/ProgrammeManager";
import { DublinAccordManager } from "./components/admin/DublinAccordManager";
import { SessionManager } from "./components/admin/SessionManager";
import { CISTTemplateManager } from "./components/admin/CISTTemplateManager";
import { TemplateManager } from "./components/admin/TemplateManager";
import {
  AssessmentPaper,
  Course,
  Question,
  User,
  Department,
  Programme,
  Session,
  FooterData,
  PaperVersion,
  LearningDomain,
  Taxonomy,
  ItemType,
  DublinAccord,
  AssessmentTemplate,
} from "./types";
import { INITIAL_PAPER_DATA, DEFAULT_TEMPLATE } from "./constants";
import { A4Page } from "./components/layout/A4Page";
import { HeaderTable } from "./components/header/HeaderTable";
import { MatrixTable } from "./components/matrix/MatrixTable";
import { StudentInfoTable } from "./components/student/StudentInfoTable";
import { QuestionItem } from "./components/questions/QuestionItem";
import { SignatureFooter } from "./components/footer/SignatureFooter";
import { AnswerSchemeTable } from "./components/scheme/AnswerSchemeTable";
import { InstructionsSection } from "./components/instructions/InstructionsSection";
import { SetupForm } from "./components/setup/SetupForm";
import { CISTManager } from "./components/cist/CISTManager";
import { DashboardStats } from "./components/dashboard/DashboardStats";
import { PreviewToolbar } from "./components/preview/PreviewToolbar";
import { VersionHistoryModal } from "./components/preview/VersionHistoryModal";
import { PreviewWindow } from "./components/preview/PreviewWindow";
import { AssessmentReviewForm } from "./components/review/AssessmentReviewForm";
import { AiAssistant } from "./components/chatbot/AiAssistant";
import { PublicLanding } from "./components/auth/PublicLanding";
import { UserProfileModal } from "./components/auth/UserProfileModal";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

import { api, isSupabaseConfigured } from "./services/api";

const Redirect = ({ to }: { to: () => void }) => {
  useEffect(() => {
    to();
  }, []); // Empty dependency array to run only once on mount
  return null;
};

type Step =
  | "dashboard"
  | "branding"
  | "courses"
  | "manage-bank"
  | "library"
  | "setup"
  | "cist"
  | "preview"
  | "review-checklist"
  | "help"
  | "users"
  | "departments"
  | "programmes"
  | "global-da"
  | "manage-cist"
  | "manage-templates"
  | "sessions";

const SortableQuestionItem = ({
  question,
  index,
  editMode,
  onUpdate,
  onRemove,
}: {
  question: Question;
  index: number;
  editMode: boolean;
  onUpdate: (q: Question) => void;
  onRemove: (id: string) => void;
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: question.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 10 : 1,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`sortable-item ${isDragging ? "sortable-item-dragging" : ""}`}
    >
      <div className="relative group">
        {editMode && (
          <div
            {...attributes}
            {...listeners}
            className="absolute -left-8 top-1/2 -translate-y-1/2 p-2 cursor-grab active:cursor-grabbing opacity-0 group-hover:opacity-100 transition-opacity text-slate-300 hover:text-blue-500 z-10"
            title="Drag to reorder"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="9" cy="5" r="1" />
              <circle cx="9" cy="12" r="1" />
              <circle cx="9" cy="19" r="1" />
              <circle cx="15" cy="5" r="1" />
              <circle cx="15" cy="12" r="1" />
              <circle cx="15" cy="19" r="1" />
            </svg>
          </div>
        )}
        <QuestionItem
          question={question}
          index={index}
          editMode={editMode}
          onUpdate={onUpdate}
          onRemove={onRemove}
        />
      </div>
    </div>
  );
};

function App() {
  console.log("App rendered");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [recoveryMode, setRecoveryMode] = useState(false);
  const [user, setUser] = useState<User | undefined>(undefined);
  const [step, setStep] = useState<Step>("dashboard");

  const [templates, setTemplates] = useState<AssessmentTemplate[]>([DEFAULT_TEMPLATE]);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [customBank, setCustomBank] = useState<Question[]>([]);
  const [toast, setToast] = useState<{ message: string; section: string; visible: boolean }>({ message: '', section: '', visible: false });

  const showToast = (message: string, section: string) => {
    setToast({ message, section, visible: true });
    setTimeout(() => setToast({ ...toast, visible: false }), 3000);
  };
  const [library, setLibrary] = useState<AssessmentPaper[]>([]);
  const [activePaper, setActivePaper] =
    useState<AssessmentPaper>(INITIAL_PAPER_DATA);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [previewVersion, setPreviewVersion] = useState<PaperVersion | null>(
    null,
  );
  const [activeCourseForCist, setActiveCourseForCist] = useState<Course | null>(
    null,
  );
  const [departments, setDepartments] = useState<Department[]>([]);
  const [programmes, setProgrammes] = useState<Programme[]>([]);
  const [learningDomains, setLearningDomains] = useState<LearningDomain[]>([]);
  const [taxonomies, setTaxonomies] = useState<Taxonomy[]>([]);
  const [itemTypes, setItemTypes] = useState<ItemType[]>([]);
  const [dublinAccords, setDublinAccords] = useState<DublinAccord[]>([]);
  const [branding] = useState<{ logoUrl: string; institutionName: string }>({ logoUrl: "", institutionName: "" });

  const [editMode, setEditMode] = useState(false);
  const [viewScheme, setViewScheme] = useState(false);
  const [livePreview, setLivePreview] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isTimedOut, setIsTimedOut] = useState(false);
  const [initError, setInitError] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setActivePaper((prev) => {
        const oldIndex = prev.questions.findIndex((q) => q.id === active.id);
        const newIndex = prev.questions.findIndex((q) => q.id === over.id);

        return {
          ...prev,
          questions: arrayMove(prev.questions, oldIndex, newIndex),
        };
      });
    }
  }

  const failsafeTimeoutRef = React.useRef<NodeJS.Timeout | null>(null);
  const isInitializingRef = React.useRef(false);

  useEffect(() => {
    console.log("App useEffect mounted, isSupabaseConfigured:", isSupabaseConfigured);

    const startFailsafe = () => {
      if (failsafeTimeoutRef.current) clearTimeout(failsafeTimeoutRef.current);
      failsafeTimeoutRef.current = setTimeout(() => {
        console.warn("Failsafe timeout triggered: forcing isLoading to false");
        setIsTimedOut(true);
      }, 35000); // Increased to 35s
    };

    startFailsafe();

    if (!isSupabaseConfigured) {
      console.error("Supabase is not configured! Check .env");
      setInitError("Supabase is not configured. Please check your environment variables.");
      setIsLoading(false);
      if (failsafeTimeoutRef.current) clearTimeout(failsafeTimeoutRef.current);
      return;
    }

    // Check active session with a timeout
    console.log("Checking session...");
    const sessionPromise = api.auth.getSession();
    const sessionTimeout = new Promise((_, reject) => 
      setTimeout(() => reject(new Error("SESSION_CHECK_TIMEOUT")), 20000)
    );

    Promise.race([sessionPromise, sessionTimeout])
      .then((result: unknown) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const session = result as any;
        console.log("Session check complete:", session ? "Found" : "Not found");
        if (session && session.user) {
          setIsAuthenticated(true);
          initData();
          // Load user profile
          console.log("Loading user profile for ID:", session.user.id);
          setUser({
            id: session.user.id,
            email: session.user.email || 'user@example.com',
            role: session.user.user_metadata?.role || 'admin',
            full_name: session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || 'User',
            position: session.user.user_metadata?.position || 'Lecturer',
          } as User);
        } else {
          console.log("No session, showing landing page");
          setIsLoading(false);
          if (failsafeTimeoutRef.current) clearTimeout(failsafeTimeoutRef.current);
        }
      })
      .catch((err: unknown) => {
        const error = err as Error;
        console.error("Error or timeout checking session:", error);
        setIsLoading(false);
        if (failsafeTimeoutRef.current) clearTimeout(failsafeTimeoutRef.current);
        if (error.message === "SESSION_CHECK_TIMEOUT") {
          setIsTimedOut(true);
        } else {
          setInitError("Failed to connect to authentication service.");
        }
      });

    // Mock auth state change listener since we don't have Supabase realtime
    const mockAuthListener = () => {
      // In a real app, this would listen to JWT changes or events
    };
    mockAuthListener();

    return () => {
      console.log("App useEffect unmounting");
      if (failsafeTimeoutRef.current) clearTimeout(failsafeTimeoutRef.current);
    };
  }, []);

  async function initData() {
    if (isInitializingRef.current) {
      console.log("initData already running, skipping");
      return;
    }
    isInitializingRef.current = true;
    console.log("initData called");
    setIsLoading(true);
    setIsTimedOut(false);
    setInitError(null);
    
    try {
      // Create a timeout promise that rejects after 30 seconds
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error("Initialization timed out")), 30000),
      );

      console.log("Starting parallel data fetch...");
      const loadPromise = Promise.all([
        api.sessions.list().then(d => { console.log("✅ Sessions loaded", d.length); return d; }).catch((err: unknown) => { console.error("❌ Sessions load error", err); return []; }),
        api.courses.list().then(d => { console.log("✅ Courses loaded", d.length); return d; }).catch((err: unknown) => { console.error("❌ Courses load error", err); return []; }),
        api.questions.list().then(d => { console.log("✅ Questions loaded", d.length); return d; }).catch((err: unknown) => { console.error("❌ Questions load error", err); return []; }),
        api.papers.list().then(d => { console.log("✅ Papers loaded", d.length); return d; }).catch((err: unknown) => { console.error("❌ Papers load error", err); return []; }),
        api.departments.list().then(d => { console.log("✅ Departments loaded", d.length); return d; }).catch((err: unknown) => { console.error("❌ Departments load error", err); return []; }),
        api.programmes.list().then(d => { console.log("✅ Programmes loaded", d.length); return d; }).catch((err: unknown) => { console.error("❌ Programmes load error", err); return []; }),
        api.lookup.learningDomains().then(d => { console.log("✅ Domains loaded", d.length); return d; }).catch((err: unknown) => { console.error("❌ Domains load error", err); return []; }),
        api.lookup.taxonomies().then(d => { console.log("✅ Taxonomies loaded", d.length); return d; }).catch((err: unknown) => { console.error("❌ Taxonomies load error", err); return []; }),
        api.lookup.itemTypes().then(d => { console.log("✅ ItemTypes loaded", d.length); return d; }).catch((err: unknown) => { console.error("❌ ItemTypes load error", err); return []; }),
        api.lookup.initializeDublinAccords().then(d => { console.log("✅ DublinAccords loaded", d.length); return d; }).catch((err: unknown) => { console.error("❌ DublinAccords load error", err); return []; }),
        api.templates.list().then(d => { console.log("✅ Templates loaded", d.length); return d; }).catch((err: unknown) => { console.error("❌ Templates load error", err); return [DEFAULT_TEMPLATE]; }),
      ]);

      // Race the load against the timeout
      const result = await Promise.race([loadPromise, timeoutPromise]);
      console.log("Initialization result received");
      const [
        sessionsData,
        coursesData,
        questionsData,
        libraryData,
        deptsData,
        progsData,
        domainsData,
        taxData,
        typesData,
        accordsData,
        templatesData,
      ] = result as [
        Session[],
        Course[],
        Question[],
        AssessmentPaper[],
        Department[],
        Programme[],
        LearningDomain[],
        Taxonomy[],
        ItemType[],
        DublinAccord[],
        AssessmentTemplate[],
      ];

      if (sessionsData) setSessions(sessionsData);
      if (coursesData) setCourses(coursesData);
      if (questionsData) setCustomBank(questionsData);
      if (libraryData) setLibrary(libraryData);
      if (deptsData) setDepartments(deptsData);
      if (progsData) setProgrammes(progsData);
      if (domainsData) setLearningDomains(domainsData);
      if (taxData) setTaxonomies(taxData);
      if (typesData) setItemTypes(typesData);
      setDublinAccords(accordsData);
      if (templatesData && templatesData.length > 0) {
        setTemplates(templatesData);
      } else {
        setTemplates([DEFAULT_TEMPLATE]);
      }
      
      console.log("initData complete, clearing timeouts");
      if (failsafeTimeoutRef.current) clearTimeout(failsafeTimeoutRef.current);
      setIsLoading(false);
      isInitializingRef.current = false;
    } catch (err) {
      console.error("Initialization error or timeout", err);
      if (err instanceof Error && err.message === "Initialization timed out") {
        setIsTimedOut(true);
      } else {
        setInitError(err instanceof Error ? err.message : "An unknown error occurred during initialization");
      }
      setIsLoading(false);
      isInitializingRef.current = false;
    }
  }


  const handleLogin = (user: User, token: string) => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const _token = token;
    setUser(user);
    setIsAuthenticated(true);
  };

  const handleLogout = async () => {
    try {
      await api.auth.logout();
    } catch (e) {
      console.error("Logout error", e);
    }
    setIsAuthenticated(false);
    setUser(undefined);
  };

  const activeSession = sessions.find((s) => s.isActive);

  const resolveSignatories = (): FooterData => {
    return {
      preparedBy: user?.full_name || "LECTURER",
      preparedDate: new Date()
        .toLocaleDateString("en-GB", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        })
        .toUpperCase(),
      reviewedBy: "SITI AMINAH (COORDINATOR)",
      reviewedDate: "",
      endorsedBy: "HEAD OF DEPARTMENT",
      endorsedDate: "",
    };
  };

  const saveWithHistory = async (paper: AssessmentPaper, action: string) => {
    const { history, ...paperData } = paper;
    const newVersion = {
      id: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
      savedBy: user?.full_name || user?.email || "System",
      action,
      data: paperData,
    };

    const updatedPaper = {
      ...paper,
      history: [newVersion, ...(history || [])],
    };

    await api.papers.save(updatedPaper);
    return updatedPaper;
  };

  const renderContent = () => {
    switch (step) {
      case "dashboard": {
        let pendingReviews: AssessmentPaper[] = [];
        let returnedPapers: AssessmentPaper[] = [];

        if (user?.role === "Reviewer") {
          // Reviewers see submitted drafts created by others (Creators)
          pendingReviews = library.filter(
            (p) => p.status === "submitted" && p.authorId !== user.id,
          );
          // Also see returned papers they authored
          returnedPapers = library.filter(
            (p) => p.status === "returned" && p.authorId === user.id,
          );
        } else if (user?.role === "Creator") {
          // Creators see submitted drafts where they are the assigned reviewer
          pendingReviews = library.filter(
            (p) =>
              p.status === "submitted" &&
              p.assignedReviewerId === user.id,
          );
          // Also see returned papers they authored
          returnedPapers = library.filter(
            (p) => p.status === "returned" && p.authorId === user.id,
          );
        } else if (user?.role === "Administrator") {
          // Admins see everything pending
          pendingReviews = library.filter((p) => p.status === "submitted");
          returnedPapers = library.filter((p) => p.status === "returned");
        }

        const isEndorser =
          user?.role === "Endorser" || user?.role === "Administrator";
        const pendingEndorsements = isEndorser
          ? library.filter((p) => p.status === "reviewed")
          : [];

        const actionItems = [
          ...pendingReviews,
          ...returnedPapers,
          ...pendingEndorsements,
        ];

        return (
          <div className="p-10 max-w-7xl mx-auto animate-in fade-in slide-in-from-bottom-6 duration-700">
            {activeSession && (
              <div className="mb-8 bg-blue-50 border border-blue-100 px-6 py-3 rounded-2xl flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
                  <span className="text-xs font-black text-blue-600 uppercase tracking-widest">
                    Active Academic Session: {activeSession.name}
                  </span>
                </div>
                <span className="text-[10px] font-bold text-blue-400 uppercase tracking-widest italic">Institutional Quality Control Active</span>
              </div>
            )}

            {actionItems.length > 0 ? (
              <div className="mb-12">
                <h3 className="text-lg font-black text-slate-800 uppercase tracking-widest mb-6 flex items-center gap-3">
                  <span className="text-2xl">⚡</span> Action Required
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {actionItems.map((paper, idx) => (
                    <div
                      key={idx}
                      onClick={() => {
                        setActivePaper(paper);
                        setStep("preview");
                      }}
                      className="bg-white p-6 rounded-[24px] shadow-sm border border-slate-100 hover:shadow-md hover:border-blue-200 transition cursor-pointer group relative overflow-hidden"
                    >
                      {paper.status === "returned" && (
                        <div className="absolute top-0 right-0 bg-rose-500 text-white text-[9px] font-black px-3 py-1 rounded-bl-xl uppercase tracking-widest">
                          Returned for Changes
                        </div>
                      )}
                      <div className="flex justify-between items-start mb-4">
                        <span
                          className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase ${
                            paper.status === "reviewed"
                              ? "bg-emerald-100 text-emerald-600"
                              : paper.status === "submitted"
                                ? "bg-purple-100 text-purple-600"
                                : paper.status === "returned"
                                  ? "bg-rose-100 text-rose-600"
                                  : "bg-blue-100 text-blue-600"
                          }`}
                        >
                          {paper.status === "reviewed"
                            ? "Ready for Endorsement"
                            : paper.status === "submitted"
                              ? "Ready for Review"
                              : paper.status === "returned"
                                ? "Changes Required"
                                : "Draft"}
                        </span>
                        <span className="text-[10px] font-bold text-slate-400">
                          {paper.header.courseCode}
                        </span>
                      </div>
                      <h4 className="text-base font-black text-slate-800 mb-1 group-hover:text-blue-600 transition-colors">
                        {paper.header.courseName}
                      </h4>
                      <p className="text-xs text-slate-500 font-medium mb-4">
                        {paper.header.assessmentType}
                      </p>
                      <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400">
                        <span>
                          Created by{" "}
                          {paper.footer?.preparedBy?.split("(")[0] ||
                            "Lecturer"}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="mb-12 bg-white p-12 rounded-[40px] border border-dashed border-slate-200 flex flex-col items-center justify-center text-center">
                <div className="text-4xl mb-4 opacity-20">☕</div>
                <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest">
                  All caught up
                </h3>
                <p className="text-xs text-slate-300 mt-1">
                  No assessments currently require your attention.
                </p>
              </div>
            )}

            <DashboardStats
              courseCount={courses.length}
              bankCount={customBank.length}
              libraryCount={library.length}
            />
          </div>
        );
      }
      case "departments":
        return (
          <DepartmentManager 
            departments={departments} 
            onUpdate={initData} 
            showToast={showToast}
          />
        );
      case "branding":
        return <div>Branding page removed.</div>;
      case "courses":
        return (
          <CourseManager
            user={user}
            courses={courses}
            departments={departments}
            programmes={programmes}
            dublinAccords={dublinAccords}
            learningDomains={learningDomains}
            taxonomies={taxonomies}
            onSave={(c) => api.courses.save(c).then(saved => { initData(); return saved; })}
            onDelete={(id) => api.courses.delete(id).then(initData)}
            onManageJsu={(c) => {
              setActiveCourseForCist(c);
              setStep("manage-cist");
            }}
            showToast={showToast}
          />
        );
      case "manage-cist":
        if (!activeCourseForCist) {
          return <Redirect to={() => setStep("courses")} />;
        }
        return (
          <CISTTemplateManager
            course={activeCourseForCist}
            learningDomains={learningDomains}
            taxonomies={taxonomies}
            itemTypes={itemTypes}
            dublinAccords={dublinAccords}
            onCancel={() => {
              setActiveCourseForCist(null);
              setStep("courses");
            }}
            onSave={(u) =>
              api.courses.save(u).then(() => {
                initData();
                setActiveCourseForCist(null);
                setStep("courses");
                showToast("CIST Blueprint saved successfully.", "Registry");
              })
            }
            showToast={showToast}
          />
        );
      case "manage-bank":
        return (
          <BankManagement
            onSave={(q) => api.questions.save(q).then(initData)}
            onBatchAdd={() => {}}
            currentBank={customBank}
            availableClos={[]}
            availableDa={[]}
            onAddCLO={() => {}}
            onAddDa={() => {}}
            availableCourses={courses}
            showToast={showToast}
          />
        );
      case "library":
        return (
          <LibraryView
            papers={library}
            onLoad={(p) => {
              setActivePaper(p);
              setStep("preview");
            }}
          />
        );
      case "setup":
        return (
          <div className="p-4 flex justify-center animate-in zoom-in duration-500 w-full">
            <SetupForm
              header={activePaper.header}
              student={activePaper.studentInfo}
              footer={activePaper.footer}
              instructions={activePaper.instructions}
              questions={activePaper.questions}
              cloDefinitions={activePaper.cloDefinitions || {}}
              onUpdateHeader={(h) =>
                setActivePaper({ ...activePaper, header: h })
              }
              onUpdateStudent={(s) =>
                setActivePaper({ ...activePaper, studentInfo: s })
              }
              onUpdateFooter={(f) =>
                setActivePaper({ ...activePaper, footer: f })
              }
              onUpdateInstructions={(ins) =>
                setActivePaper({ ...activePaper, instructions: ins })
              }
              onUpdateCLOs={(clos) =>
                setActivePaper({ ...activePaper, cloDefinitions: clos })
              }
              availableTemplates={templates}
              templateId={activePaper.templateId || DEFAULT_TEMPLATE.id}
              onUpdateTemplate={(tid) => setActivePaper({ ...activePaper, templateId: tid })}
              onUpdateAssignedReviewer={(id) =>
                setActivePaper({ ...activePaper, assignedReviewerId: id })
              }
              onNext={() => {
                const autoFooter = resolveSignatories();
                setActivePaper((prev) => ({ ...prev, footer: autoFooter }));
                setStep("cist");
              }}
              availableCourses={courses}
              currentUser={user}
              departments={departments}
              programmes={programmes}
              onCourseSelect={(id) => {
                const c = courses.find((item) => item.id === id);
                if (c) {
                  const dept = departments.find((d) => d.id === c.deptId);
                  setActivePaper({
                    ...activePaper,
                    courseId: c.id,
                    matrix: c.jsuTemplate || [],
                    cloDefinitions: c.clos,
                    daClusters: c.da,
                    header: {
                      ...activePaper.header,
                      courseCode: c.code,
                      courseName: c.name,
                      department: dept?.name || "JABATAN TEKNOLOGI MAKLUMAT & KOMUNIKASI",
                      session: activeSession?.name || "",
                      logoUrl: branding.logoUrl || "",
                    },
                  });
                }
              }}
            />
          </div>
        );
      case "cist":
        return (
          <CISTManager
            currentQuestions={activePaper.questions}
            onUpdateQuestions={(qs) =>
              setActivePaper({ ...activePaper, questions: qs })
            }
            availableCourses={courses}
            activeCourseId={activePaper.courseId}
            fullBank={customBank}
            onBack={() => setStep("setup")}
            onNext={() => setStep("preview")}
            assessmentType={activePaper.header.assessmentType}
          />
        );
      case "preview": {
        const totalMarks = activePaper.questions.reduce(
          (sum, q) => sum + q.marks,
          0,
        );
        const paperToDisplay = {
          ...activePaper,
          studentInfo: { ...activePaper.studentInfo, totalMarks },
        };

        const isAuthor = activePaper.authorId === user?.id;
        const isAssignedReviewer =
          activePaper.assignedReviewerId === user?.id;
        const canSubmit =
          isAuthor &&
          (activePaper.status === "draft" ||
            activePaper.status === "returned" ||
            !activePaper.status);
        const canReview =
          isAssignedReviewer && activePaper.status === "submitted";
        const isEndorser =
          user?.role === "Endorser" && activePaper.status === "reviewed";
        const canEndorse = isEndorser;

        const activeTemplate = templates.find(t => t.id === activePaper.templateId) || DEFAULT_TEMPLATE;

        return (
          <div className="bg-slate-800 min-h-screen py-20 flex flex-col items-center relative overflow-x-hidden custom-scrollbar">
            <PreviewToolbar
              editMode={editMode}
              viewScheme={viewScheme}
              onToggleEdit={isAuthor ? () => setEditMode(!editMode) : undefined}
              onToggleScheme={() => setViewScheme(!viewScheme)}
              onSave={
                isAuthor
                  ? async () => {
                      const paperToSave = {
                        ...activePaper,
                        authorId: activePaper.authorId || user?.id,
                      };
                      const saved = await saveWithHistory(
                        paperToSave,
                        "Saved Draft",
                      );
                      setActivePaper(saved);
                      showToast("Draft saved successfully!", "Assessment Setup");
                    }
                  : undefined
              }
              onPrint={isAuthor ? () => window.print() : undefined}
              onBack={() => setStep("dashboard")}
              onReviewChecklist={() => setStep("review-checklist")}
              onToggleLivePreview={() => setLivePreview(!livePreview)}
              onSubmitForReview={
                canSubmit
                  ? async () => {
                      const updated = {
                        ...activePaper,
                        status: "submitted" as const,
                      };
                      const saved = await saveWithHistory(
                        updated,
                        "Submitted for Review",
                      );
                      setActivePaper(saved);
                      setStep("library");
                    }
                  : undefined
              }
              onProcessReview={
                canReview || canEndorse
                  ? () => setStep("review-checklist")
                  : undefined
              }
              onViewHistory={() => setIsHistoryModalOpen(true)}
            />
            <VersionHistoryModal
              isOpen={isHistoryModalOpen}
              onClose={() => setIsHistoryModalOpen(false)}
              history={activePaper.history || []}
              onRevert={async (version) => {
                const revertedPaper = {
                  ...version.data,
                  history: activePaper.history,
                };
                const saved = await saveWithHistory(
                  revertedPaper,
                  `Reverted to version from ${new Date(version.timestamp).toLocaleString()}`,
                );
                setActivePaper(saved);
                setIsHistoryModalOpen(false);
              }}
              onView={(version) => setPreviewVersion(version)}
            />
            {previewVersion && (
              <PreviewWindow
                paper={previewVersion.data as AssessmentPaper}
                viewScheme={viewScheme}
                onClose={() => setPreviewVersion(null)}
                globalLogoUrl={branding.logoUrl}
              />
            )}
            <A4Page 
              className="shadow-[0_40px_100px_rgba(0,0,0,0.6)] print-exact rounded-sm transform origin-top scale-[1.02] transition-all duration-700"
              style={{
                fontFamily: activeTemplate.layout.fontFamily,
                fontSize: activeTemplate.layout.fontSize,
                paddingTop: activeTemplate.layout.margins?.top,
                paddingBottom: activeTemplate.layout.margins?.bottom,
                paddingLeft: activeTemplate.layout.margins?.left,
                paddingRight: activeTemplate.layout.margins?.right,
              }}
            >
              {activeTemplate.sections.filter(s => s.visible).map(section => {
                switch (section.type) {
                  case 'header':
                    return (
                      <HeaderTable
                        key={section.id}
                        data={paperToDisplay.header}
                        editMode={editMode}
                        onUpdate={(h) => setActivePaper({ ...activePaper, header: h })}
                        globalLogoUrl={branding.logoUrl}
                      />
                    );
                  case 'matrix':
                    return !viewScheme && (
                      <MatrixTable
                        key={section.id}
                        rows={paperToDisplay.matrix.filter(
                          (r) => r.task === paperToDisplay.header.assessmentType,
                        )}
                        editMode={editMode}
                      />
                    );
                  case 'student-info':
                    return !viewScheme && (
                      <StudentInfoTable
                        key={section.id}
                        data={paperToDisplay.studentInfo}
                        editMode={editMode}
                        onUpdate={(s) =>
                          setActivePaper({ ...activePaper, studentInfo: s })
                        }
                      />
                    );
                  case 'instructions':
                    return !viewScheme && (
                      <InstructionsSection
                        key={section.id}
                        instructions={paperToDisplay.instructions}
                        editMode={editMode}
                        onUpdate={(ins) =>
                          setActivePaper({ ...activePaper, instructions: ins })
                        }
                      />
                    );
                  case 'questions':
                    return viewScheme ? (
                      <AnswerSchemeTable
                        key={section.id}
                        paper={paperToDisplay}
                        editMode={editMode}
                        onUpdateQuestion={(q) =>
                          setActivePaper({
                            ...activePaper,
                            questions: activePaper.questions.map((item) =>
                              item.id === q.id ? q : item,
                            ),
                          })
                        }
                      />
                    ) : (
                      <div key={section.id}>
                        {editMode ? (
                          <DndContext
                            sensors={sensors}
                            collisionDetection={closestCenter}
                            onDragEnd={handleDragEnd}
                          >
                            <SortableContext
                              items={paperToDisplay.questions.map((q) => q.id)}
                              strategy={verticalListSortingStrategy}
                            >
                              {paperToDisplay.questions.map((q, index) => (
                                <SortableQuestionItem
                                  key={q.id}
                                  question={q}
                                  index={index}
                                  editMode={editMode}
                                  onUpdate={(u) =>
                                    setActivePaper({
                                      ...activePaper,
                                      questions: activePaper.questions.map((item) =>
                                        item.id === u.id ? u : item,
                                      ),
                                    })
                                  }
                                  onRemove={(id) =>
                                    setActivePaper((prev) => ({
                                      ...prev,
                                      questions: prev.questions.filter(
                                        (q) => q.id !== id,
                                      ),
                                    }))
                                  }
                                />
                              ))}
                            </SortableContext>
                          </DndContext>
                        ) : (
                          paperToDisplay.questions.map((q, index) => (
                            <QuestionItem
                              key={q.id}
                              question={q}
                              index={index}
                              editMode={editMode}
                              onUpdate={(u) =>
                                setActivePaper({
                                  ...activePaper,
                                  questions: activePaper.questions.map((item) =>
                                    item.id === u.id ? u : item,
                                  ),
                                })
                              }
                              onRemove={(id) =>
                                setActivePaper((prev) => ({
                                  ...prev,
                                  questions: prev.questions.filter(
                                    (q) => q.id !== id,
                                  ),
                                }))
                              }
                            />
                          ))
                        )}
                      </div>
                    );
                  case 'footer':
                    return (
                      <SignatureFooter
                        key={section.id}
                        data={paperToDisplay.footer}
                        editMode={editMode}
                        onUpdate={(f) => setActivePaper({ ...activePaper, footer: f })}
                      />
                    );
                  default:
                    return null;
                }
              })}
            </A4Page>
          </div>
        );
      }
      case "review-checklist": {
        // Resolve department name from ID if not present in header
        const course = courses.find((c) => c.id === activePaper.courseId);
        const dept = departments.find((d) => d.id === course?.deptId);
        const isReviewer =
          activePaper.assignedReviewerId === user?.id &&
          activePaper.status === "submitted";
        const isEndorser =
          user?.role === "Endorser" && activePaper.status === "reviewed";

        return (
          <AssessmentReviewForm
            key={activePaper.id}
            paper={activePaper}
            deptName={dept?.name}
            onBack={() => setStep("preview")}
            isReviewer={isReviewer}
            isEndorser={isEndorser}
            onApprove={async (feedback, checklist, checklistNotes) => {
              const newStatus = isEndorser ? "endorsed" : "reviewed";
              const updated = {
                ...activePaper,
                status: newStatus as AssessmentPaper["status"],
                feedback,
                checklist,
                checklistNotes,
              };
              const saved = await saveWithHistory(
                updated,
                isEndorser ? "Endorsed Assessment" : "Reviewed Assessment",
              );
              setActivePaper(saved);
              setStep("library");
            }}
            onReturn={async (feedback, checklist, checklistNotes) => {
              const updated = {
                ...activePaper,
                status: "returned" as const,
                feedback,
                checklist,
                checklistNotes,
              };
              const saved = await saveWithHistory(
                updated,
                "Returned for Changes",
              );
              setActivePaper(saved);
              setStep("library");
            }}
          />
        );
      }
      case "help":
        return <HelpGuide />;
      case "users":
        return <UserManagement showToast={showToast} />;
      case "programmes":
        return (
          <ProgrammeManager
            departments={departments}
            programmes={programmes}
            onUpdate={initData}
            showToast={showToast}
          />
        );
      case "global-da":
        return (
          <DublinAccordManager
            dublinAccords={dublinAccords}
            onUpdateDublin={async (newAccords) => {
              // Find deleted
              const deleted = dublinAccords.filter(
                (a) => !newAccords.find((n) => n.id === a.id),
              );
              // Find added
              const added = newAccords.filter(
                (n) => !dublinAccords.find((a) => a.id === n.id),
              );
              // Find updated
              const updated = newAccords.filter((n) => {
                const old = dublinAccords.find((a) => a.id === n.id);
                return (
                  old &&
                  (old.code !== n.code || old.description !== n.description)
                );
              });

              try {
                for (const d of deleted)
                  await api.lookup.deleteDublinAccord(d.id);
                for (const a of added) await api.lookup.saveDublinAccord(a);
                for (const u of updated) await api.lookup.saveDublinAccord(u);

                // Refresh from API to get actual IDs
                const refreshed = await api.lookup.dublinAccords();
                setDublinAccords(refreshed);
                showToast("Dublin Accords updated successfully!", "Dublin Accord Registry");
              } catch (error) {
                console.error("Failed to update Dublin Accords:", error);
                showToast("Failed to update Dublin Accords. Please try again.", "Dublin Accord Registry");
                setDublinAccords(newAccords); // Optimistic update fallback
              }
            }}
          />
        );
      case "sessions":
        return <SessionManager sessions={sessions} onUpdate={initData} showToast={showToast} />;
      case "manage-templates":
        return <TemplateManager onUpdate={initData} showToast={showToast} />;
      default:
        return <div>Step not implemented</div>;
    }
  };

  if (isLoading || isTimedOut)
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center text-white p-6">
        <div className={`w-16 h-16 border-4 ${isTimedOut ? 'border-rose-500/20 border-t-rose-500' : 'border-blue-600 border-t-transparent'} rounded-full ${isTimedOut ? '' : 'animate-spin'} mb-6`}></div>
        <div className="text-center max-w-md">
          <h2 className="text-xl font-bold mb-2">
            {isTimedOut ? "Connection Timeout" : "Accessing Command Hub..."}
          </h2>
          <p className="text-slate-400 text-sm mb-8">
            {isTimedOut 
              ? "We're having trouble connecting to the secure servers. This might be due to a slow connection or missing configuration."
              : "Synchronizing secure protocols and loading encrypted data modules."}
          </p>
          
          <div className="flex flex-col gap-3 items-center">
            {isTimedOut ? (
              <>
                <button 
                  onClick={() => initData()}
                  className="bg-blue-600 hover:bg-blue-500 text-white font-black uppercase tracking-widest text-[10px] py-3 px-12 rounded-xl transition-all shadow-xl shadow-blue-600/20"
                >
                  Retry Connection
                </button>
                <button 
                  onClick={() => window.location.reload()}
                  className="text-slate-500 hover:text-white text-[10px] font-black uppercase tracking-widest transition-all"
                >
                  Reload Application
                </button>
              </>
            ) : (
              <button 
                onClick={() => setIsLoading(false)}
                className="text-slate-600 hover:text-slate-400 text-[9px] font-black uppercase tracking-[0.2em] transition-all"
              >
                Force Start Dashboard
              </button>
            )}
          </div>
          
          {initError && !isTimedOut && (
            <div className="mt-4 p-4 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-400 text-xs font-mono">
              {initError}
            </div>
          )}
        </div>
      </div>
    );
  if (!isAuthenticated || recoveryMode)
    return (
      <PublicLanding
        onLogin={(u, t) => {
          setRecoveryMode(false);
          handleLogin(u, t);
        }}
        showToast={showToast}
        initialMode={recoveryMode ? 'update_password' : 'login'}
        onCancelRecovery={() => setRecoveryMode(false)}
      />
    );

  const isProfileIncomplete = user && (!user.position || !user.deptId);

  return (
    <DashboardLayout
      activeStep={step}
      onNavigate={(s) => {
        if (s === "setup") {
          setActivePaper({
            ...INITIAL_PAPER_DATA,
            header: {
              ...INITIAL_PAPER_DATA.header,
              logoUrl: branding.logoUrl || "",
            },
          });
        }
        setStep(s as Step);
      }}
      user={user}
      onLogout={handleLogout}
      onOpenProfile={() => setIsProfileModalOpen(true)}
    >
      {renderContent()}
      <AiAssistant />
      {(isProfileModalOpen || isProfileIncomplete) && user && (
        <UserProfileModal
          user={user}
          onClose={() => setIsProfileModalOpen(false)}
          onUpdate={(updatedUser) => setUser(updatedUser)}
          isMandatory={!!isProfileIncomplete}
          departments={departments}
        />
      )}

      {/* Notification Toast */}
      {toast.visible && (
        <div className="fixed bottom-8 right-8 z-[100] animate-in slide-in-from-right duration-300">
          <div className="bg-slate-900 text-white p-4 rounded-2xl shadow-2xl border border-slate-700 flex items-center gap-4 min-w-[320px]">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg ${toast.message.includes('Failed') ? 'bg-rose-500/20 text-rose-400' : 'bg-emerald-500/20 text-emerald-400'}`}>
              {toast.message.includes('Failed') ? '⚠️' : '✅'}
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{toast.section}</p>
              <p className="text-xs font-bold mt-0.5">{toast.message}</p>
            </div>
            <button 
              onClick={() => setToast({ ...toast, visible: false })}
              className="ml-auto text-slate-500 hover:text-white transition"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
            </button>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}

export default App;
