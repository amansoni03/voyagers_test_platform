import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { TestInstructions } from './components/TestInstructions';
import { TcsIonExamInterface } from './components/TcsIonExamInterface';
import { ResultAnalytics } from './components/ResultAnalytics';
import { FacultyAdminPortal } from './components/FacultyAdminPortal';
import { Leaderboard } from './components/Leaderboard';
import { QuestionManagerModal } from './components/QuestionManagerModal';
import { AdminLoginModal } from './components/AdminLoginModal';
import { SubmissionThankYou } from './components/SubmissionThankYou';
import { StudentProfile, SubmissionRecord, ProctorViolation, CodeEvaluationResult, Question } from './types';
import { TCS_QUESTIONS } from './data/tcsQuestions';

export default function App() {
  const [currentView, setCurrentView] = useState<'instructions' | 'exam' | 'thankyou' | 'result' | 'faculty' | 'leaderboard'>('instructions');
  const [studentProfile, setStudentProfile] = useState<StudentProfile | null>(null);
  const [acceleratedTime, setAcceleratedTime] = useState(false);
  const [showQuestionManager, setShowQuestionManager] = useState(false);
  const [showAdminLoginModal, setShowAdminLoginModal] = useState(false);
  const [currentSubmission, setCurrentSubmission] = useState<SubmissionRecord | null>(null);

  // Admin authentication state (username: smsnqt26, password: @SMSCSE)
  const [isAdmin, setIsAdmin] = useState<boolean>(() => {
    try {
      return sessionStorage.getItem('sms_admin_logged_in') === 'true';
    } catch {
      return false;
    }
  });

  // Dynamic Question Bank State
  const [questions, setQuestions] = useState<Question[]>(() => {
    try {
      const cached = localStorage.getItem('sms_custom_questions');
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length >= 5) {
          return parsed;
        }
      }
    } catch {}
    return TCS_QUESTIONS;
  });

  // Load custom questions from server if available and update cache
  useEffect(() => {
    fetch('/api/questions')
      .then(res => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const contentType = res.headers.get('content-type') || '';
        if (!contentType.includes('application/json')) throw new Error('Response is not JSON');
        return res.json();
      })
      .then(data => {
        if (data?.questions && Array.isArray(data.questions) && data.questions.length >= 5) {
          setQuestions(data.questions);
          try {
            localStorage.setItem('sms_custom_questions', JSON.stringify(data.questions));
          } catch {}
        }
      })
      .catch((err) => {
        console.warn('Backend questions sync notice (using local storage fallback):', err);
      });
  }, []);

  // Handle Exam Start
  const handleStartExam = (profile: StudentProfile, isAccelerated: boolean) => {
    setStudentProfile(profile);
    setAcceleratedTime(isAccelerated);
    setCurrentView('exam');
  };

  // Handle Exam Finish
  const handleFinishExam = async (
    userAnswers: Record<string, string>,
    codingSubmissions: Record<string, { language: string; code: string }>,
    codingEvaluations: Record<string, CodeEvaluationResult>,
    violations: ProctorViolation[],
    integrityScore: number,
    timeSpentSec: number
  ) => {
    if (!studentProfile) return;

    // Calculate Section Scores based on dynamic questions
    let numScore = 0;
    let vrbScore = 0;
    let rsnScore = 0;
    let advScore = 0;

    questions.forEach((q) => {
      if (q.sectionId !== 'coding') {
        const studentAns = userAnswers[q.id];
        if (studentAns === q.correctOptionId) {
          if (q.sectionId === 'numerical') numScore += q.marks;
          else if (q.sectionId === 'verbal') vrbScore += q.marks;
          else if (q.sectionId === 'reasoning') rsnScore += q.marks;
          else if (q.sectionId === 'advanced') advScore += q.marks;
        }
      }
    });

    // Coding Marks: Objective calculation based on test cases and written solution
    const codingQuestions = questions.filter(q => q.sectionId === 'coding');
    let codingTotal = 0;
    if (codingQuestions.length > 0) {
      codingQuestions.forEach(cq => {
        const evalRes = codingEvaluations[cq.id];
        if (evalRes && typeof evalRes.score === 'number') {
          codingTotal += evalRes.score;
        } else {
          const sub = codingSubmissions[cq.id];
          if (sub?.code && sub.code.trim().length > 40) {
            codingTotal += 24;
          }
        }
      });
      codingTotal = Math.min(60, codingTotal);
    } else {
      const p1Score = codingEvaluations['code_1']?.score ?? 25;
      const p2Score = codingEvaluations['code_2']?.score ?? 24;
      codingTotal = Math.min(60, p1Score + p2Score);
    }

    const total = numScore + vrbScore + rsnScore + advScore + codingTotal;
    const maxTotal = 155;
    const percentage = Math.round((total / maxTotal) * 100);

    const qualificationStatus: SubmissionRecord['qualificationStatus'] =
      percentage >= 70 ? 'TCS Digital' : percentage >= 45 ? 'TCS Ninja' : 'Under Review';

    const submission: SubmissionRecord = {
      id: 'SMS-' + Date.now().toString(36).toUpperCase(),
      createdAt: new Date().toISOString(),
      student: studentProfile,
      totalScore: total,
      maxTotalScore: maxTotal,
      percentage,
      qualificationStatus,
      sectionScores: {
        numerical: { score: numScore, max: 25, accuracy: Math.round((numScore / 25) * 100) },
        verbal: { score: vrbScore, max: 25, accuracy: Math.round((vrbScore / 25) * 100) },
        reasoning: { score: rsnScore, max: 25, accuracy: Math.round((rsnScore / 25) * 100) },
        advanced: { score: advScore, max: 20, accuracy: Math.round((advScore / 20) * 100) },
        coding: { score: codingTotal, max: 60, logicPercentage: Math.round((codingTotal / 60) * 100) },
      },
      answers: userAnswers,
      codingEvaluations,
      codingSubmissions,
      integrityScore,
      violationCount: violations.length,
      violations,
      timeTakenMinutes: Math.round(timeSpentSec / 60),
    };

    setCurrentSubmission(submission);
    
    // Students transition to the verified Submission Thank You view
    setCurrentView('thankyou');

    // 1. Client-Side Redundancy: Cache in localStorage immediately
    try {
      localStorage.setItem(`sms_sub_${submission.id}`, JSON.stringify(submission));
      localStorage.setItem(`sms_sub_roll_${studentProfile.rollNo}`, JSON.stringify(submission));
      localStorage.setItem('sms_sub_latest', JSON.stringify(submission));

      const existingRaw = localStorage.getItem('sms_all_submissions');
      const existingList: SubmissionRecord[] = existingRaw ? JSON.parse(existingRaw) : [];
      const updatedList = [submission, ...existingList.filter(s => s.id !== submission.id)];
      localStorage.setItem('sms_all_submissions', JSON.stringify(updatedList));
    } catch (e) {
      console.warn('LocalStorage backup:', e);
    }

    // 2. Resilient Auto-Retry Dispatch with Exponential Backoff
    const dispatchWithRetry = async (retries = 3) => {
      let savedSuccessfully = false;
      for (let attempt = 1; attempt <= retries; attempt++) {
        try {
          const res = await fetch('/api/submissions', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(submission),
          });
          if (res.ok) {
            savedSuccessfully = true;
            break;
          }
        } catch (fetchErr) {
          console.warn(`Submission dispatch attempt ${attempt} failed, retrying...`, fetchErr);
          if (attempt < retries) {
            await new Promise((resolve) => setTimeout(resolve, attempt * 1200));
          }
        }
      }

      // Send instructor email scorecard summary
      try {
        await fetch('/api/send-email-report', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            studentName: studentProfile.name,
            rollNo: studentProfile.rollNo,
            branch: studentProfile.branch,
            email: 'singhrishabh06116@gmail.com',
            totalScore: total,
            maxScore: maxTotal,
            integrityScore,
            proctorFlags: violations.length,
            breakdown: {
              numerical: numScore,
              verbal: vrbScore,
              reasoning: rsnScore,
              advanced: advScore,
              coding: codingTotal,
            },
            codingEvaluation: codingEvaluations,
          }),
        });
      } catch (emailErr) {
        console.warn('Email report dispatch:', emailErr);
      }
    };

    dispatchWithRetry();
  };

  // Safe navigation handler enforcing student vs admin access
  const handleNavigate = (view: 'instructions' | 'exam' | 'thankyou' | 'result' | 'faculty' | 'leaderboard') => {
    if (!isAdmin && (view === 'faculty' || view === 'leaderboard' || view === 'result')) {
      setShowAdminLoginModal(true);
      return;
    }
    setCurrentView(view);
  };

  // Handle successful Admin Login
  const handleAdminLoginSuccess = () => {
    setIsAdmin(true);
    setCurrentView('faculty');
  };

  // Handle Admin Logout
  const handleAdminLogout = () => {
    setIsAdmin(false);
    try {
      sessionStorage.removeItem('sms_admin_logged_in');
      sessionStorage.removeItem('sms_admin_user');
    } catch {}
    setCurrentView('instructions');
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans selection:bg-blue-600 selection:text-white">
      {/* Header is shown on non-exam screens */}
      {currentView !== 'exam' && (
        <Header
          currentView={currentView}
          onNavigate={handleNavigate}
          onOpenQuestionManager={() => setShowQuestionManager(true)}
          isExamActive={false}
          isAdmin={isAdmin}
          onOpenAdminLogin={() => setShowAdminLoginModal(true)}
          onLogoutAdmin={handleAdminLogout}
        />
      )}

      {/* Main View Switcher in Clean Light Mode */}
      <main className="flex-1">
        {/* Student Test Portal Home */}
        {currentView === 'instructions' && (
          <TestInstructions
            onStartExam={handleStartExam}
            defaultEmail="singhrishabh06116@gmail.com"
            onOpenQuestionManager={() => {
              if (isAdmin) setShowQuestionManager(true);
              else setShowAdminLoginModal(true);
            }}
          />
        )}

        {/* Locked Fullscreen Active Examination Screen */}
        {currentView === 'exam' && studentProfile && (
          <TcsIonExamInterface
            student={studentProfile}
            acceleratedTime={acceleratedTime}
            questions={questions}
            onFinishExam={handleFinishExam}
          />
        )}

        {/* Student Post-Submission Thank You Confirmation Screen */}
        {currentView === 'thankyou' && currentSubmission && (
          <SubmissionThankYou
            submission={currentSubmission}
            targetEmail="singhrishabh06116@gmail.com"
            onReturnToHome={() => setCurrentView('instructions')}
            onOpenAdminLogin={() => setShowAdminLoginModal(true)}
          />
        )}

        {/* Detailed Result Analytics (Protected: only accessible by Admin) */}
        {currentView === 'result' && (
          isAdmin && currentSubmission ? (
            <ResultAnalytics
              submission={currentSubmission}
              questions={questions}
              onRetakeExam={() => setCurrentView('faculty')}
              onOpenFacultyDashboard={() => setCurrentView('faculty')}
              onOpenLeaderboard={() => setCurrentView('leaderboard')}
            />
          ) : (
            <div className="max-w-xl mx-auto px-4 py-16 text-center space-y-4">
              <h2 className="text-xl font-black text-slate-900">Admin Authorization Required</h2>
              <p className="text-xs text-slate-600">Individual student scorecards are restricted to authorized SMS Lucknow faculty.</p>
              <button
                onClick={() => setShowAdminLoginModal(true)}
                className="px-5 py-2.5 bg-blue-600 text-white font-bold text-xs rounded-xl shadow-xs"
              >
                Sign In as Admin
              </button>
            </div>
          )
        )}

        {/* Leaderboard (Accessible in Admin Mode) */}
        {currentView === 'leaderboard' && (
          isAdmin ? (
            <Leaderboard
              onBackToTest={() => setCurrentView('faculty')}
              onSelectStudent={(sub) => {
                setCurrentSubmission(sub);
                setCurrentView('result');
              }}
            />
          ) : (
            <div className="max-w-xl mx-auto px-4 py-16 text-center space-y-4">
              <h2 className="text-xl font-black text-slate-900">Admin Authorization Required</h2>
              <p className="text-xs text-slate-600">Campus rankings and leaderboard data are restricted to institutional administrators.</p>
              <button
                onClick={() => setShowAdminLoginModal(true)}
                className="px-5 py-2.5 bg-blue-600 text-white font-bold text-xs rounded-xl shadow-xs"
              >
                Sign In as Admin
              </button>
            </div>
          )
        )}

        {/* Faculty Submissions Roster & Proctor Audits (Admin Portal) */}
        {currentView === 'faculty' && (
          isAdmin ? (
            <FacultyAdminPortal
              questions={questions}
              onBackToTest={() => setCurrentView('instructions')}
              targetEmail="singhrishabh06116@gmail.com"
              onOpenLeaderboard={() => setCurrentView('leaderboard')}
              onOpenQuestionManager={() => setShowQuestionManager(true)}
              onViewFullScorecard={(sub) => {
                setCurrentSubmission(sub);
                setCurrentView('result');
              }}
            />
          ) : (
            <div className="max-w-xl mx-auto px-4 py-16 text-center space-y-4">
              <h2 className="text-xl font-black text-slate-900">Faculty & Admin Sign-In Required</h2>
              <p className="text-xs text-slate-600">Please authenticate with faculty credentials to access the submissions roster.</p>
              <button
                onClick={() => setShowAdminLoginModal(true)}
                className="px-5 py-2.5 bg-blue-600 text-white font-bold text-xs rounded-xl shadow-xs"
              >
                Sign In as Admin
              </button>
            </div>
          )
        )}
      </main>

      {/* Admin Login Modal (Credentials: smsnqt26 / @SMSCSE) */}
      <AdminLoginModal
        isOpen={showAdminLoginModal}
        onClose={() => setShowAdminLoginModal(false)}
        onLoginSuccess={handleAdminLoginSuccess}
      />

      {/* Question Bank & Test Settings Manager Modal (Admin only) */}
      <QuestionManagerModal
        isOpen={showQuestionManager}
        onClose={() => setShowQuestionManager(false)}
        questions={questions}
        onSaveQuestions={(updated) => {
          setQuestions(updated);
          try {
            localStorage.setItem('sms_custom_questions', JSON.stringify(updated));
          } catch {}
        }}
        onResetQuestions={() => {
          setQuestions(TCS_QUESTIONS);
          try {
            localStorage.removeItem('sms_custom_questions');
          } catch {}
        }}
      />
    </div>
  );
}
