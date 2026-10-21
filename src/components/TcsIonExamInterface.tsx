import React, { useState, useEffect, useRef } from 'react';
import { Question, QuestionStatus, SectionId, StudentProfile, ProctorViolation, CodeEvaluationResult } from '../types';
import { TCS_SECTIONS } from '../data/tcsQuestions';
import { CodeEditorSection } from './CodeEditorSection';
import { ProctoringBar } from './ProctoringBar';
import { TcsCalculator } from './TcsCalculator';
import { formatTimeRemaining } from '../utils/proctoring';
import { SmsLogo } from './SmsLogo';
import { 
  ShieldAlert, 
  ShieldCheck,
  Clock, 
  ChevronLeft, 
  ChevronRight, 
  Bookmark, 
  RotateCcw, 
  AlertTriangle, 
  Send, 
  Calculator, 
  UserCheck, 
  Maximize2,
  Lock
} from 'lucide-react';

interface TcsIonExamInterfaceProps {
  student: StudentProfile;
  acceleratedTime: boolean;
  questions: Question[];
  onFinishExam: (answers: Record<string, string>, codingSubmissions: Record<string, { language: string; code: string }>, codingEvaluations: Record<string, CodeEvaluationResult>, violations: ProctorViolation[], integrityScore: number, timeSpentSec: number) => void;
}

export const TcsIonExamInterface: React.FC<TcsIonExamInterfaceProps> = ({
  student,
  acceleratedTime,
  questions,
  onFinishExam,
}) => {
  const [currentSectionId, setCurrentSectionId] = useState<SectionId>('numerical');
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

  // Responses & Statuses
  const [userAnswers, setUserAnswers] = useState<Record<string, string>>({});
  const [questionStatuses, setQuestionStatuses] = useState<Record<string, QuestionStatus>>({});
  
  // Coding states
  const [codingSubmissions, setCodingSubmissions] = useState<Record<string, { language: string; code: string }>>({
    code_1: { language: 'python', code: questions.find(q => q.id === 'code_1')?.starterTemplates?.python || '' },
    code_2: { language: 'python', code: questions.find(q => q.id === 'code_2')?.starterTemplates?.python || '' },
  });
  const [codingEvaluations, setCodingEvaluations] = useState<Record<string, CodeEvaluationResult>>({});

  // Proctoring states
  const [violations, setViolations] = useState<ProctorViolation[]>([]);
  const [integrityScore, setIntegrityScore] = useState(100);
  const [showCalculator, setShowCalculator] = useState(false);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [fullscreenExited, setFullscreenExited] = useState(false);
  const [fullscreenCountdown, setFullscreenCountdown] = useState(10);

  // Integrity-based forced submission state
  const [integrityForcedOut, setIntegrityForcedOut] = useState(false);
  const [integrityForceCountdown, setIntegrityForceCountdown] = useState(5);
  const integritySubmittedRef = useRef(false);
  // Always holds the latest submitExam so setInterval closures never go stale
  const submitExamRef = useRef<() => void>(() => {});

  // Overall Timer: 120 mins (or 20 mins if accelerated)
  const totalSeconds = acceleratedTime ? 20 * 60 : 120 * 60;
  const [secondsRemaining, setSecondsRemaining] = useState(totalSeconds);
  const timerRef = useRef<any>(null);

  // Filter questions for the active section from dynamic questions prop
  const sectionQuestions = questions.filter(q => q.sectionId === currentSectionId);
  const currentQuestion = sectionQuestions[currentQuestionIndex] || sectionQuestions[0];

  // Request Fullscreen on mount
  useEffect(() => {
    const enterFullscreen = async () => {
      try {
        if (!document.fullscreenElement) {
          await document.documentElement.requestFullscreen();
        }
      } catch (e) {
        console.warn('Fullscreen request blocked by browser policy:', e);
      }
    };
    enterFullscreen();

    // Timer countdown
    timerRef.current = setInterval(() => {
      setSecondsRemaining(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          handleAutoSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  // Browser Lockdown Listeners (Visibility change, Window blur, Fullscreen change, Clipboard block, Devtools)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        addViolation({
          type: 'tab_switch',
          severity: 'high',
          description: 'Candidate navigated away from the exam tab or minimized browser window',
        });
      }
    };

    const handleWindowBlur = () => {
      addViolation({
        type: 'tab_switch',
        severity: 'medium',
        description: 'Window focus lost. Candidate switched focus to another application',
      });
    };

    const handleFullscreenChange = () => {
      if (!document.fullscreenElement) {
        setFullscreenExited(true);
        setFullscreenCountdown(10);
        addViolation({
          type: 'fullscreen_exit',
          severity: 'high',
          description: 'Candidate exited Fullscreen Lockdown mode',
        });
      } else {
        setFullscreenExited(false);
      }
    };

    const handleCopy = (e: ClipboardEvent) => {
      // Allow copy/paste INSIDE the code editor textarea or any input
      const target = e.target as HTMLElement;
      if (target?.tagName === 'TEXTAREA' || target?.tagName === 'INPUT') return;
      e.preventDefault();
      addViolation({
        type: 'clipboard_blocked',
        severity: 'low',
        description: 'Copy command intercepted and blocked by exam lock',
      });
    };

    const handleContextMenu = (e: MouseEvent) => {
      // Allow right-click INSIDE code editor textarea (needed for paste)
      const target = e.target as HTMLElement;
      if (target?.tagName === 'TEXTAREA' || target?.tagName === 'INPUT') return;
      e.preventDefault();
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      // Block F12, Ctrl+Shift+I, Ctrl+Shift+J, Ctrl+U
      if (
        e.key === 'F12' ||
        (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'J' || e.key === 'C')) ||
        (e.ctrlKey && e.key === 'u')
      ) {
        e.preventDefault();
        addViolation({
          type: 'devtools_attempt',
          severity: 'high',
          description: 'Blocked unauthorized inspection shortcut / developer tools attempt',
        });
      }
    };

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = 'Examination is active in lockdown mode. Leaving without submission is recorded.';
      return 'Examination is active in lockdown mode. Leaving without submission is recorded.';
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('blur', handleWindowBlur);
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('copy', handleCopy);
    document.addEventListener('contextmenu', handleContextMenu);
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', handleWindowBlur);
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('copy', handleCopy);
      document.removeEventListener('contextmenu', handleContextMenu);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, []);

  // Countdown timer for fullscreen exit
  useEffect(() => {
    let interval: any = null;
    if (fullscreenExited) {
      interval = setInterval(() => {
        setFullscreenCountdown(prev => {
          if (prev <= 1) {
            clearInterval(interval);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [fullscreenExited]);



  const addViolation = (violation: Omit<ProctorViolation, 'id' | 'timestamp'>) => {
    const newViolation: ProctorViolation = {
      id: 'VIOL-' + Date.now().toString(36),
      timestamp: new Date().toLocaleTimeString(),
      ...violation,
    };
    setViolations(prev => [newViolation, ...prev]);

    // Recalculate integrity score
    setIntegrityScore(prev => {
      const penalty = violation.severity === 'high' ? 12 : violation.severity === 'medium' ? 6 : 3;
      return Math.max(10, prev - penalty);
    });
  };

  const reEnterFullscreen = async () => {
    try {
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen();
      }
      setFullscreenExited(false);
    } catch (e) {
      console.warn('Re-enter fullscreen failed:', e);
    }
  };

  // While fullscreen is exited, enforce re-entry on click or keypress
  useEffect(() => {
    if (!fullscreenExited) return;

    const handleReEnter = (e: MouseEvent | KeyboardEvent) => {
      // Allow clicking the emergency submit button without immediately triggering reEnterFullscreen
      const target = e.target as HTMLElement;
      if (target?.closest('[data-action="emergency-submit"]') || target?.closest('[data-action="submit-modal"]')) {
        return;
      }
      reEnterFullscreen();
    };

    window.addEventListener('click', handleReEnter);
    window.addEventListener('keydown', handleReEnter);
    return () => {
      window.removeEventListener('click', handleReEnter);
      window.removeEventListener('keydown', handleReEnter);
    };
  }, [fullscreenExited]);

  // Section Switcher
  const handleSelectSection = (secId: SectionId) => {
    setCurrentSectionId(secId);
    setCurrentQuestionIndex(0);
  };

  // Save answer & advance to next question
  const handleSaveAndNext = () => {
    if (currentQuestion) {
      const hasAnswer = currentQuestion.sectionId === 'coding' 
        ? Boolean(codingSubmissions[currentQuestion.id]?.code.trim())
        : Boolean(userAnswers[currentQuestion.id]);

      setQuestionStatuses(prev => ({
        ...prev,
        [currentQuestion.id]: hasAnswer ? 'answered' : 'not_answered',
      }));
    }

    if (currentQuestionIndex < sectionQuestions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      const secIdx = TCS_SECTIONS.findIndex(s => s.id === currentSectionId);
      if (secIdx < TCS_SECTIONS.length - 1) {
        handleSelectSection(TCS_SECTIONS[secIdx + 1].id);
      }
    }
  };

  // Mark for review & next
  const handleMarkForReview = () => {
    if (currentQuestion) {
      const hasAnswer = Boolean(userAnswers[currentQuestion.id]);
      setQuestionStatuses(prev => ({
        ...prev,
        [currentQuestion.id]: hasAnswer ? 'answered_marked_for_review' : 'marked_for_review',
      }));
    }

    if (currentQuestionIndex < sectionQuestions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };

  // Clear response
  const handleClearResponse = () => {
    if (currentQuestion) {
      setUserAnswers(prev => {
        const copy = { ...prev };
        delete copy[currentQuestion.id];
        return copy;
      });
      setQuestionStatuses(prev => ({
        ...prev,
        [currentQuestion.id]: 'not_answered',
      }));
    }
  };

  // Option selection
  const handleSelectOption = (optId: string) => {
    if (!currentQuestion) return;
    setUserAnswers(prev => ({
      ...prev,
      [currentQuestion.id]: optId,
    }));
  };

  // Coding handlers
  const handleCodeChange = (newCode: string) => {
    if (!currentQuestion) return;
    setCodingSubmissions(prev => ({
      ...prev,
      [currentQuestion.id]: {
        language: prev[currentQuestion.id]?.language || 'python',
        code: newCode,
      },
    }));
  };

  const handleLanguageChange = (lang: string) => {
    if (!currentQuestion) return;
    setCodingSubmissions(prev => ({
      ...prev,
      [currentQuestion.id]: {
        language: lang,
        code: prev[currentQuestion.id]?.code || '',
      },
    }));
  };

  const handleEvaluationComplete = (result: CodeEvaluationResult) => {
    if (!currentQuestion) return;
    setCodingEvaluations(prev => ({
      ...prev,
      [currentQuestion.id]: result,
    }));
  };

  // Auto submit when timer runs out
  const handleAutoSubmit = () => {
    submitExam();
  };

  const submitExam = () => {
    // Release beforeunload alert and fullscreen lock upon final submission
    window.onbeforeunload = null;
    if (document.fullscreenElement) {
      document.exitFullscreen().catch(() => {});
    }

    const timeSpent = totalSeconds - secondsRemaining;
    onFinishExam(
      userAnswers,
      codingSubmissions,
      codingEvaluations,
      violations,
      integrityScore,
      timeSpent
    );
  };

  // Keep submitExamRef always pointing to the freshest submitExam
  // (must be updated every render — BEFORE any effect that uses it)
  submitExamRef.current = submitExam;

  // ── INTEGRITY FORCE-SUBMIT: when score hits the floor of 10, auto-eject ──
  // This useEffect is placed AFTER submitExam so submitExamRef is always current.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (integrityScore > 10) return;          // guard: ignore mount (starts at 100)
    if (integritySubmittedRef.current) return; // guard: only fire once

    integritySubmittedRef.current = true;
    setIntegrityForcedOut(true);
    setIntegrityForceCountdown(5);

    // Freeze the exam timer
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    // 5-second countdown, then submit via ref (always fresh state)
    const cd = setInterval(() => {
      setIntegrityForceCountdown(prev => {
        const next = prev - 1;
        if (next <= 0) {
          clearInterval(cd);
          // Use ref so we always call the latest submitExam with current answers
          submitExamRef.current();
        }
        return next;
      });
    }, 1000);

    return () => clearInterval(cd);
  }, [integrityScore]);

  // Calculate status counts across all questions
  const getStatusCount = (status: QuestionStatus) => {
    return questions.filter(q => (questionStatuses[q.id] || 'not_visited') === status).length;
  };

  return (
    <div className="flex flex-col h-screen bg-slate-100 text-slate-800 overflow-hidden">
      {/* 1. TCS iON Top Status Header in Crisp Light Theme */}
      <div className="bg-white border-b border-slate-200 px-4 py-2 flex items-center justify-between text-xs shrink-0 shadow-xs">
        <div className="flex items-center gap-3">
          <SmsLogo size="sm" />
          <div>
            <div className="font-bold text-slate-900 text-xs md:text-sm">
              School of Management Sciences Lucknow • TCS NQT Mock Test
            </div>
            <div className="text-[11px] text-slate-500 flex items-center gap-2">
              <span>Candidate: <strong className="text-slate-800">{student.name}</strong></span>
              <span className="hidden sm:inline">• Roll: {student.rollNo}</span>
              <span className="hidden md:inline">• {student.branch}</span>
            </div>
          </div>
        </div>

        {/* Timer & Controls */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowCalculator(!showCalculator)}
            className={`px-3 py-1.5 rounded-lg border text-xs font-semibold flex items-center gap-1.5 transition-colors ${
              showCalculator
                ? 'bg-amber-100 text-amber-900 border-amber-300'
                : 'bg-slate-50 text-slate-700 border-slate-300 hover:bg-slate-100'
            }`}
          >
            <Calculator className="w-3.5 h-3.5 text-amber-600" />
            <span className="hidden sm:inline">Calculator</span>
          </button>

          {/* Time Remaining Badge in Clean Light High Contrast */}
          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border font-mono font-bold text-xs md:text-sm ${
            secondsRemaining < 300
              ? 'bg-rose-50 border-rose-400 text-rose-700 animate-pulse'
              : secondsRemaining < 900
              ? 'bg-amber-50 border-amber-400 text-amber-800'
              : 'bg-blue-50 border-blue-200 text-blue-700'
          }`}>
            <Clock className="w-4 h-4 shrink-0" />
            <span>Time Left: {formatTimeRemaining(secondsRemaining)}</span>
          </div>

          <button
            onClick={() => setShowSubmitModal(true)}
            className="px-3.5 py-1.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-lg shadow-sm transition-colors flex items-center gap-1"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Submit Test</span>
          </button>
        </div>
      </div>

      {/* 2. TCS NQT Section Tabs Bar in Light Theme */}
      <div className="bg-slate-50 border-b border-slate-200 px-3 py-1.5 flex items-center gap-1.5 overflow-x-auto scrollbar-none shrink-0 text-xs font-medium">
        {TCS_SECTIONS.map((sec) => {
          const isActive = sec.id === currentSectionId;
          const answeredCount = questions.filter(
            q => q.sectionId === sec.id && (questionStatuses[q.id] === 'answered' || questionStatuses[q.id] === 'answered_marked_for_review')
          ).length;
          const totalInSec = questions.filter(q => q.sectionId === sec.id).length;

          return (
            <button
              key={sec.id}
              onClick={() => handleSelectSection(sec.id)}
              className={`px-3 py-1.5 rounded-lg border whitespace-nowrap transition-all flex items-center gap-2 ${
                isActive
                  ? 'bg-blue-600 text-white border-blue-600 shadow-xs font-bold'
                  : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
              }`}
            >
              <span>{sec.shortName}</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                isActive ? 'bg-blue-800 text-white' : 'bg-slate-100 text-slate-600'
              }`}>
                {answeredCount}/{totalInSec}
              </span>
            </button>
          );
        })}
      </div>

      {/* 3. Main Workspace Grid in Clean Light Mode */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left: Question Content & Action Area */}
        <div className="flex-1 flex flex-col overflow-hidden bg-white">
          {/* Question Header Bar */}
          <div className="px-5 py-2.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between text-xs shrink-0">
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-900 text-sm">
                Question {currentQuestionIndex + 1} of {sectionQuestions.length}
              </span>
              <span className="text-slate-500">• Topic: {currentQuestion?.topic}</span>
            </div>

            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200 font-bold">
                +{currentQuestion?.marks} Marks
              </span>
              <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-600 font-medium">
                0 Negative Marks
              </span>
            </div>
          </div>

          {/* Question Body Scrollable Area */}
          <div className="flex-1 p-6 overflow-y-auto space-y-6">
            {currentQuestion?.sectionId === 'coding' ? (
              /* Coding Challenge Layout in Light Styling */
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-full min-h-[500px]">
                {/* Left Description Pane */}
                <div className="lg:col-span-5 space-y-4 bg-slate-50 p-5 rounded-2xl border border-slate-200 overflow-y-auto text-xs">
                  <h3 className="text-base font-black text-slate-900">{currentQuestion.title}</h3>
                  <div className="text-slate-700 whitespace-pre-wrap leading-relaxed">
                    {currentQuestion.questionText}
                  </div>

                  {currentQuestion.constraints && (
                    <div className="pt-2 border-t border-slate-200 space-y-1">
                      <span className="font-bold text-slate-500 uppercase tracking-wider text-[10px]">Constraints:</span>
                      <ul className="list-disc list-inside space-y-0.5 text-slate-600 font-mono text-[11px]">
                        {currentQuestion.constraints.map((c, i) => (
                          <li key={i}>{c}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                {/* Right Interactive Code Editor */}
                <div className="lg:col-span-7 h-full">
                  <CodeEditorSection
                    question={currentQuestion}
                    studentCode={codingSubmissions[currentQuestion.id]?.code || ''}
                    selectedLanguage={codingSubmissions[currentQuestion.id]?.language || 'python'}
                    onCodeChange={handleCodeChange}
                    onLanguageChange={handleLanguageChange}
                    evaluationResult={codingEvaluations[currentQuestion.id]}
                    onEvaluationComplete={handleEvaluationComplete}
                  />
                </div>
              </div>
            ) : (
              /* Standard MCQ Question Layout in Light Theme */
              <div className="max-w-3xl space-y-6">
                <div className="text-slate-900 text-sm md:text-base font-medium leading-relaxed whitespace-pre-wrap">
                  {currentQuestion?.questionText}
                </div>

                {/* Options List */}
                <div className="space-y-3 pt-2">
                  {currentQuestion?.options?.map((option) => {
                    const isSelected = userAnswers[currentQuestion.id] === option.id;
                    return (
                      <button
                        key={option.id}
                        type="button"
                        onClick={() => handleSelectOption(option.id)}
                        className={`w-full p-4 rounded-xl border text-left transition-all flex items-start gap-3 text-xs md:text-sm ${
                          isSelected
                            ? 'bg-blue-50 border-blue-600 text-blue-950 ring-2 ring-blue-500/30 shadow-xs'
                            : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300'
                        }`}
                      >
                        <div className={`w-6 h-6 rounded-full border flex items-center justify-center shrink-0 mt-0.5 text-xs font-bold ${
                          isSelected
                            ? 'bg-blue-600 border-blue-600 text-white'
                            : 'border-slate-300 text-slate-500 bg-slate-50'
                        }`}>
                          {option.id.toUpperCase()}
                        </div>
                        <span className="leading-snug pt-0.5 font-medium">{option.text}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Bottom Action Footer (TCS iON Controls in Light Theme) */}
          <div className="px-5 py-3 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs shrink-0">
            <div className="flex items-center gap-2">
              <button
                onClick={handleMarkForReview}
                className="px-3.5 py-2 rounded-xl bg-purple-50 hover:bg-purple-100 border border-purple-200 text-purple-700 font-bold transition-colors flex items-center gap-1.5"
              >
                <Bookmark className="w-3.5 h-3.5 text-purple-600" />
                <span>Mark for Review & Next</span>
              </button>

              <button
                onClick={handleClearResponse}
                className="px-3.5 py-2 rounded-xl bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 font-semibold transition-colors flex items-center gap-1.5"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Clear Response</span>
              </button>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentQuestionIndex(prev => Math.max(0, prev - 1))}
                disabled={currentQuestionIndex === 0}
                className="px-3 py-2 rounded-xl bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 font-semibold transition-colors disabled:opacity-40 flex items-center gap-1"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Previous</span>
              </button>

              <button
                onClick={handleSaveAndNext}
                className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-bold shadow-xs transition-all flex items-center gap-1.5"
              >
                <span>Save & Next</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Right Sidebar: TCS Question Palette in Light Mode */}
        <div className="w-80 border-l border-slate-200 bg-slate-50 flex flex-col shrink-0">
          {/* Candidate Profile Widget */}
          <div className="p-3 bg-white border-b border-slate-200 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-50 border border-blue-200 flex items-center justify-center font-bold text-blue-700">
              <UserCheck className="w-5 h-5 text-blue-600" />
            </div>
            <div className="text-xs">
              <div className="font-bold text-slate-900 truncate w-56">{student.name}</div>
              <div className="text-[11px] text-slate-500 font-mono">{student.rollNo}</div>
              <div className="text-[10px] text-emerald-700 font-semibold">Proctor: Active Lockdown</div>
            </div>
          </div>

          {/* Question Status Legend in Light Theme */}
          <div className="p-3 border-b border-slate-200 text-[10px] grid grid-cols-2 gap-2 bg-white">
            <div className="flex items-center gap-1.5">
              <span className="w-3.5 h-3.5 rounded bg-emerald-600 text-white font-bold flex items-center justify-center text-[8px]">
                {getStatusCount('answered')}
              </span>
              <span className="text-slate-700">Answered</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3.5 h-3.5 rounded bg-rose-600 text-white font-bold flex items-center justify-center text-[8px]">
                {getStatusCount('not_answered')}
              </span>
              <span className="text-slate-700">Not Answered</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3.5 h-3.5 rounded bg-purple-600 text-white font-bold flex items-center justify-center text-[8px]">
                {getStatusCount('marked_for_review')}
              </span>
              <span className="text-slate-700">Marked Review</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3.5 h-3.5 rounded bg-slate-200 text-slate-700 font-bold flex items-center justify-center text-[8px]">
                {getStatusCount('not_visited')}
              </span>
              <span className="text-slate-500">Not Visited</span>
            </div>
          </div>

          {/* Question Palette Number Grid */}
          <div className="flex-1 p-3 overflow-y-auto space-y-2">
            <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              {TCS_SECTIONS.find(s => s.id === currentSectionId)?.title}
            </div>

            <div className="grid grid-cols-5 gap-2">
              {sectionQuestions.map((q, idx) => {
                const isCurrent = idx === currentQuestionIndex;
                const status = questionStatuses[q.id] || 'not_visited';

                let bgClass = 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100';
                if (status === 'answered') bgClass = 'bg-emerald-600 text-white font-bold border-emerald-600';
                else if (status === 'not_answered') bgClass = 'bg-rose-600 text-white font-bold border-rose-600';
                else if (status === 'marked_for_review') bgClass = 'bg-purple-600 text-white font-bold border-purple-600';
                else if (status === 'answered_marked_for_review') bgClass = 'bg-purple-600 text-white font-bold ring-2 ring-emerald-500';

                return (
                  <button
                    key={q.id}
                    onClick={() => setCurrentQuestionIndex(idx)}
                    className={`h-9 rounded-lg text-xs font-mono transition-all flex items-center justify-center relative shadow-2xs ${bgClass} ${
                      isCurrent ? 'ring-2 ring-blue-600 scale-105 z-10' : ''
                    }`}
                  >
                    {idx + 1}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Submit Test Button */}
          <div className="p-3 border-t border-slate-200 bg-white">
            <button
              onClick={() => setShowSubmitModal(true)}
              className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs transition-all"
            >
              Submit Full Test
            </button>
          </div>
        </div>
      </div>

      {/* Embedded TCS Scientific Calculator */}
      {showCalculator && (
        <TcsCalculator onClose={() => setShowCalculator(false)} />
      )}

      {/* Live AI Proctoring Bar (Floating webcam & acoustic decibel tracker) */}
      <ProctoringBar
        integrityScore={integrityScore}
        violations={violations}
        onAddViolation={addViolation}
        isExamActive={true}
      />

      {/* ── INTEGRITY FLOOR REACHED: Forced Termination Overlay (cannot be dismissed) ── */}
      {integrityForcedOut && (
        <div className="fixed inset-0 z-[60] bg-slate-950/98 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white border-2 border-rose-600 rounded-3xl max-w-lg w-full p-8 text-center space-y-6 shadow-2xl">
            {/* Icon */}
            <div className="w-20 h-20 bg-rose-100 rounded-full flex items-center justify-center mx-auto border-4 border-rose-300">
              <ShieldAlert className="w-10 h-10 text-rose-600" />
            </div>

            {/* Title */}
            <div className="space-y-2">
              <span className="px-3 py-1 rounded-full bg-rose-100 text-rose-800 font-mono text-xs font-bold uppercase tracking-wider">
                Proctor Trust Index — Critical Threshold Reached
              </span>
              <h3 className="text-2xl font-black text-slate-900 tracking-tight mt-2">
                EXAM TERMINATED
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed max-w-md mx-auto">
                Your <strong>Proctor Trust Index has dropped to the minimum limit (10%)</strong> due to repeated integrity violations. As per SMS Lucknow examination rules, your test session is being automatically submitted.
              </p>
            </div>

            {/* Countdown */}
            <div className="p-5 bg-rose-50 border border-rose-200 rounded-2xl space-y-2">
              <div className="text-rose-700 text-xs font-bold uppercase tracking-wider">Auto-Submitting in</div>
              <div className="text-6xl font-black text-rose-600 font-mono tabular-nums">
                {integrityForceCountdown}
              </div>
              <div className="text-rose-500 text-xs">seconds — your answers are being recorded</div>
            </div>

            {/* Violation notice */}
            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs text-slate-700 text-left flex items-start gap-2.5">
              <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-slate-900">This incident has been recorded.</span>
                <p className="text-slate-600 mt-0.5">
                  All violations, timestamps, and your final scorecard will be automatically dispatched to the faculty invigilator.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Enforced Fullscreen Lockdown Overlay: Screen Locked until Fullscreen or Final Submission */}
      {fullscreenExited && (
        <div 
          className="fixed inset-0 z-50 bg-slate-950/95 backdrop-blur-md flex items-center justify-center p-4 text-slate-800"
        >
          <div className="bg-white border-2 border-rose-500 rounded-3xl max-w-lg w-full p-8 text-center space-y-6 shadow-2xl animate-in zoom-in-95 duration-150">
            <div className="w-16 h-16 bg-rose-100 rounded-2xl flex items-center justify-center mx-auto text-rose-600 border border-rose-200 shadow-inner">
              <Lock className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <span className="px-3 py-1 rounded-full bg-rose-100 text-rose-800 font-mono text-xs font-bold uppercase tracking-wider">
                Screen Locked • Fullscreen Lockdown Active
              </span>
              <h3 className="text-2xl font-black text-slate-900 tracking-tight">
                SCREEN LOCKED! RETURN TO FULLSCREEN
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed max-w-md mx-auto">
                By order of the <strong>School of Management Sciences Lucknow</strong> examination security rules, your test screen is locked. You are <strong>not allowed to exit fullscreen</strong> before final submission.
              </p>
            </div>

            <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-2xl text-xs text-rose-800 text-left flex items-start gap-2.5">
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold">Security Violation Logged:</span>
                <p className="text-[11px] text-rose-700 mt-0.5">
                  An incident has been stamped to your scorecard. Click anywhere or press the button below to re-lock into fullscreen and continue your exam.
                </p>
              </div>
            </div>

            <div className="space-y-3 pt-2">
              <button
                onClick={reEnterFullscreen}
                className="w-full py-4 bg-blue-600 hover:bg-blue-700 active:scale-98 text-white font-black text-sm rounded-xl shadow-lg flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <Maximize2 className="w-4 h-4" />
                <span>Re-enter Fullscreen & Unlock Exam</span>
              </button>

              <div className="flex items-center justify-center gap-2 text-xs text-slate-500 pt-1">
                <span>Wish to finish test now?</span>
                <button
                  data-action="emergency-submit"
                  onClick={() => setShowSubmitModal(true)}
                  className="text-rose-600 hover:text-rose-700 font-bold underline cursor-pointer"
                >
                  Final Submit Exam & Exit
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Submit Confirmation Modal */}
      {showSubmitModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 max-w-lg w-full rounded-2xl p-6 text-slate-800 space-y-4 shadow-2xl">
            <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
              <Send className="w-5 h-5 text-blue-600" />
              Confirm TCS NQT Exam Submission
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Are you sure you want to finish the exam? Once submitted, your answers and code solutions will be graded by the AI engine, and your full scorecard will be <strong>automatically transmitted to {student.instructorEmail}</strong>.
            </p>

            <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50 rounded-xl text-xs border border-slate-200">
              <div>
                <span className="text-slate-500 block">Answered Questions:</span>
                <span className="text-emerald-700 font-bold text-base">{getStatusCount('answered')}</span>
              </div>
              <div>
                <span className="text-slate-500 block">Proctor Trust Index:</span>
                <span className="text-blue-700 font-bold text-base">{integrityScore}%</span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setShowSubmitModal(false)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs"
              >
                Continue Exam
              </button>
              <button
                onClick={() => {
                  setShowSubmitModal(false);
                  submitExam();
                }}
                className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-md"
              >
                Yes, Submit Now
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
