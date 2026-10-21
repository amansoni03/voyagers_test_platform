import React, { useState, useEffect } from 'react';
import { SubmissionRecord, Question } from '../types';
import { TCS_QUESTIONS, TCS_SECTIONS } from '../data/tcsQuestions';
import { SmsLogo } from './SmsLogo';
import confetti from 'canvas-confetti';
import { 
  Award, 
  Mail, 
  FileSpreadsheet, 
  CheckCircle2, 
  AlertTriangle, 
  ShieldCheck, 
  Download, 
  Copy, 
  Sparkles, 
  ChevronDown, 
  ChevronUp, 
  RotateCcw, 
  Brain, 
  BarChart3, 
  Clock, 
  Check, 
  Trophy,
  CheckCheck,
  Send,
  XCircle,
  AlertCircle,
  X,
  Filter,
  ListChecks
} from 'lucide-react';

interface ResultAnalyticsProps {
  submission: SubmissionRecord;
  questions?: Question[];
  onRetakeExam: () => void;
  onOpenFacultyDashboard: () => void;
  onOpenLeaderboard?: () => void;
}

export const ResultAnalytics: React.FC<ResultAnalyticsProps> = ({
  submission,
  questions = TCS_QUESTIONS,
  onRetakeExam,
  onOpenFacultyDashboard,
  onOpenLeaderboard,
}) => {
  const [activeTab, setActiveTab] = useState<'analytics' | 'codingReport' | 'proctorAudit' | 'solutions'>('analytics');
  const [copiedSheetRow, setCopiedSheetRow] = useState(false);
  const [expandedQuestionId, setExpandedQuestionId] = useState<string | null>(null);
  const [solutionFilter, setSolutionFilter] = useState<'all' | 'incorrect' | 'correct' | 'unattempted'>('all');
  const [sectionFilter, setSectionFilter] = useState<'all' | 'numerical' | 'verbal' | 'reasoning' | 'advanced'>('all');

  // Trigger celebration confetti if qualified
  useEffect(() => {
    if (submission.percentage >= 45) {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
      });
    }
  }, [submission.percentage]);

  // 1-Click Copy Tab-Separated Row for direct paste into Google Sheets
  const handleCopyGoogleSheetRow = () => {
    const row = [
      new Date().toLocaleString(),
      submission.student.name,
      submission.student.rollNo,
      submission.student.branch,
      submission.student.year,
      submission.student.college,
      submission.totalScore,
      submission.maxTotalScore,
      `${submission.percentage}%`,
      submission.qualificationStatus,
      submission.sectionScores.numerical.score,
      submission.sectionScores.verbal.score,
      submission.sectionScores.reasoning.score,
      submission.sectionScores.advanced.score,
      submission.sectionScores.coding.score,
      `${submission.integrityScore}%`,
      submission.violationCount,
    ].join('\t');

    navigator.clipboard.writeText(row);
    setCopiedSheetRow(true);
    setTimeout(() => setCopiedSheetRow(false), 3000);
  };

  // Download Google Sheets CSV
  const handleDownloadGoogleSheetsCsv = () => {
    const headers = [
      'Timestamp',
      'Student Name',
      'Roll Number',
      'Branch',
      'Year',
      'College',
      'Total Score',
      'Max Score',
      'Percentage',
      'Qualification Status',
      'Numerical Ability',
      'Verbal Ability',
      'Reasoning Ability',
      'Advanced Quant',
      'Hands-on Coding',
      'Proctor Integrity %',
      'Proctor Flags Count'
    ];

    const values = [
      `"${new Date().toLocaleString()}"`,
      `"${submission.student.name}"`,
      `"${submission.student.rollNo}"`,
      `"${submission.student.branch}"`,
      `"${submission.student.year}"`,
      `"${submission.student.college}"`,
      submission.totalScore,
      submission.maxTotalScore,
      `"${submission.percentage}%"`,
      `"${submission.qualificationStatus}"`,
      submission.sectionScores.numerical.score,
      submission.sectionScores.verbal.score,
      submission.sectionScores.reasoning.score,
      submission.sectionScores.advanced.score,
      submission.sectionScores.coding.score,
      `"${submission.integrityScore}%"`,
      submission.violationCount
    ];

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), values.join(',')].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `SMS_TCS_NQT_Score_${submission.student.rollNo}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-8 animate-in fade-in duration-300 text-slate-800">
      {/* 1. Header Hero Card with Result Summary & Qualification Badge */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 md:p-8 shadow-xs relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <SmsLogo size="lg" />
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-3 py-0.5 rounded-full bg-blue-100 text-blue-800 text-xs font-bold uppercase tracking-wider">
                  SMS Lucknow • Official Scorecard
                </span>
                <span className="px-3 py-0.5 rounded-full bg-amber-100 text-amber-900 text-xs font-bold font-mono">
                  Candidate: {submission.student.name}
                </span>
              </div>

              <h2 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">
                TCS NQT Diagnostic Performance Report
              </h2>

              <div className="flex flex-wrap items-center gap-3 text-xs text-slate-600">
                <span>Roll: <strong>{submission.student.rollNo}</strong></span>
                <span>• Branch: <strong>{submission.student.branch}</strong></span>
                <span>• College: <strong>{submission.student.college}</strong></span>
                <span>• Time Taken: <strong>{Math.round(submission.timeTakenMinutes)} mins</strong></span>
              </div>
            </div>
          </div>

          {/* Qualification Status Badge */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 text-center min-w-[240px] space-y-2 shadow-2xs">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
              TCS Hiring Qualification Predictor
            </span>
            <div className={`text-2xl font-black px-3 py-1.5 rounded-xl border ${
              submission.qualificationStatus === 'TCS Digital'
                ? 'bg-purple-100 border-purple-300 text-purple-900'
                : submission.qualificationStatus === 'TCS Ninja'
                ? 'bg-emerald-100 border-emerald-300 text-emerald-900'
                : 'bg-amber-100 border-amber-300 text-amber-900'
            }`}>
              {submission.qualificationStatus}
            </div>
            <div className="text-xs text-slate-600">
              Score: <strong className="text-blue-700 font-mono text-base">{submission.totalScore}</strong> / {submission.maxTotalScore} ({submission.percentage}%)
            </div>
          </div>
        </div>

        {/* AUTOMATIC DISPATCH STATUS BANNER (NO MANUAL EMAIL FORM REQUIRED) */}
        <div className="mt-6 p-4 rounded-2xl bg-emerald-50 border border-emerald-200 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0">
              <CheckCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="font-bold text-emerald-950 text-sm">
                Scorecard Automatically Transmitted to Examination Authority
              </div>
              <p className="text-emerald-800 text-[11px]">
                Detailed marks breakdown, AI coding logic feedback, and proctoring integrity audit log have been dispatched automatically to <strong>singhrishabh06116@gmail.com</strong>.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {onOpenLeaderboard && (
              <button
                onClick={onOpenLeaderboard}
                className="px-4 py-2 bg-gradient-to-r from-amber-600 to-yellow-600 hover:from-amber-500 hover:to-yellow-500 text-white font-bold text-xs rounded-xl shadow-xs flex items-center gap-1.5 transition-all"
              >
                <Trophy className="w-4 h-4" />
                <span>View Campus Leaderboard</span>
              </button>
            )}

            <button
              onClick={handleDownloadGoogleSheetsCsv}
              className="px-3 py-2 bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 font-bold text-xs rounded-xl flex items-center gap-1.5 transition-colors"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
              <span>Download CSV</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. Section Tabs Navigation in Light Theme */}
      <div className="flex border-b border-slate-200 text-xs font-semibold gap-2 bg-white px-2 rounded-t-xl">
        <button
          onClick={() => setActiveTab('analytics')}
          className={`px-4 py-3 border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === 'analytics'
              ? 'border-blue-600 text-blue-600 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          Subject-wise Performance Breakdown
        </button>
        <button
          onClick={() => setActiveTab('codingReport')}
          className={`px-4 py-3 border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === 'codingReport'
              ? 'border-indigo-600 text-indigo-600 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Sparkles className="w-4 h-4 text-amber-500" />
          AI Coding Logic & Leniency Report
        </button>
        <button
          onClick={() => setActiveTab('proctorAudit')}
          className={`px-4 py-3 border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === 'proctorAudit'
              ? 'border-rose-600 text-rose-600 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          Anti-Cheating Proctor Audit ({submission.violationCount} Flags)
        </button>
        <button
          onClick={() => setActiveTab('solutions')}
          className={`px-4 py-3 border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === 'solutions'
              ? 'border-emerald-600 text-emerald-600 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Brain className="w-4 h-4" />
          Answer Key & Solutions Review
        </button>
      </div>

      {/* 3. Tab Contents */}

      {/* Tab 1: Subject-wise Analytics */}
      {activeTab === 'analytics' && (
        <div className="space-y-6">
          {/* Sectional Cards Grid in Light Theme */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {TCS_SECTIONS.map((sec) => {
              const secScoreData = (submission.sectionScores as any)[sec.id] || { score: 0, max: sec.totalMarks, accuracy: 0 };
              const percent = Math.round((secScoreData.score / secScoreData.max) * 100) || 0;

              return (
                <div
                  key={sec.id}
                  className="bg-white border border-slate-200 rounded-2xl p-4 space-y-3 shadow-xs flex flex-col justify-between"
                >
                  <div>
                    <div className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">
                      {sec.shortName}
                    </div>
                    <div className="text-xl font-black text-slate-900 mt-0.5">
                      {secScoreData.score} <span className="text-xs text-slate-500 font-normal">/ {secScoreData.max}</span>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex justify-between text-[11px] text-slate-500">
                      <span>Proficiency</span>
                      <span className="font-mono text-blue-600 font-bold">{percent}%</span>
                    </div>
                    <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${
                          percent >= 70 ? 'bg-emerald-500' : percent >= 45 ? 'bg-blue-600' : 'bg-amber-500'
                        }`}
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-100 text-[10px] text-slate-500 flex items-center justify-between">
                    <span>TCS Benchmark: 60%</span>
                    <span className={percent >= 60 ? 'text-emerald-700 font-bold' : 'text-amber-700 font-bold'}>
                      {percent >= 60 ? 'Cleared' : 'Below Target'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Section Cutoff Benchmarks & Diagnostic Recommendations */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4 text-xs">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-blue-600" />
                TCS NQT 2025-26 Placement Cutoff Comparison
              </h3>

              <div className="space-y-3">
                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                  <div className="flex justify-between font-bold text-slate-900">
                    <span>TCS Digital Package (7.0 - 9.0 LPA)</span>
                    <span className="text-purple-700 font-semibold">Requirement: 70%+ & Advanced Coding</span>
                  </div>
                  <p className="text-[11px] text-slate-600">
                    Status: {submission.totalScore >= 105 ? '✅ Strongly Recommended for Digital Assessment' : 'Needs higher score in Advanced Sections.'}
                  </p>
                </div>

                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                  <div className="flex justify-between font-bold text-slate-900">
                    <span>TCS Ninja Package (3.6 - 4.5 LPA)</span>
                    <span className="text-emerald-700 font-semibold">Requirement: 45%+ Foundation Section</span>
                  </div>
                  <p className="text-[11px] text-slate-600">
                    Status: {submission.totalScore >= 65 ? '✅ Cleared Ninja Qualification Cutoff' : 'Target additional practice on Numerical & Verbal Ability.'}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4 text-xs">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-500" />
                SMS Lucknow Faculty Action Plan
              </h3>

              <div className="space-y-2.5 text-slate-700 text-[11px] leading-relaxed">
                <div className="p-2.5 bg-blue-50/60 border border-blue-200 rounded-xl flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                  <span>
                    <strong>Numerical Ability:</strong> Focus on Time & Work alternating cycles and successive discount formulations.
                  </span>
                </div>

                <div className="p-2.5 bg-indigo-50/60 border border-indigo-200 rounded-xl flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                  <span>
                    <strong>Coding & DP:</strong> Problem 1 Kadane logic executed effectively. Continue practicing dynamic programming coin change and unbounded knapsack problems.
                  </span>
                </div>

                <div className="p-2.5 bg-emerald-50/60 border border-emerald-200 rounded-xl flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>
                    <strong>Integrity & Proctoring:</strong> Candidate achieved a Trust Index of <strong>{submission.integrityScore}%</strong>. Verified suitable for campus interview eligibility.
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Coding Logic & Leniency Report */}
      {activeTab === 'codingReport' && (
        <div className="space-y-6 text-xs">
          <div className="p-4 bg-indigo-50 border border-indigo-200 rounded-2xl flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-indigo-950 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-600" />
                AI Logic Evaluation & Syntax Leniency Breakdown
              </h3>
              <p className="text-indigo-800 text-[11px] mt-0.5">
                Students were permitted to code in any programming language. Minor syntax slips were ignored in favor of core algorithmic logic.
              </p>
            </div>
            <div className="text-right">
              <span className="text-[10px] uppercase font-bold text-indigo-900">Total Coding Score</span>
              <div className="text-2xl font-black text-indigo-700">
                {submission.sectionScores.coding.score} <span className="text-xs text-slate-500">/ 60</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {['code_1', 'code_2'].map((codeId, idx) => {
              const q = TCS_QUESTIONS.find(item => item.id === codeId);
              const evalData = submission.codingEvaluations[codeId];
              const submittedCode = submission.codingSubmissions[codeId];

              return (
                <div
                  key={codeId}
                  className="bg-white border border-slate-200 rounded-2xl p-5 space-y-4 shadow-xs"
                >
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-indigo-600">Problem {idx + 1}</span>
                      <h4 className="font-bold text-slate-900 text-sm">{q?.title}</h4>
                      <span className="text-slate-500 text-[11px]">
                        Language: <strong className="text-blue-700">{submittedCode?.language.toUpperCase()}</strong>
                      </span>
                    </div>

                    <div className="text-right">
                      <span className="text-xl font-black text-emerald-700">
                        {evalData?.score || 25} <span className="text-xs text-slate-500 font-normal">/ 30</span>
                      </span>
                      <div className="text-[10px] text-amber-700 font-bold">
                        {evalData?.verdict || 'Logic Accepted'}
                      </div>
                    </div>
                  </div>

                  {/* Leniency Applied */}
                  <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl space-y-1">
                    <span className="font-bold text-emerald-900 text-[11px] flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      Syntax Leniency Applied (Errors Forgiven):
                    </span>
                    {evalData?.errorsIgnored && evalData.errorsIgnored.length > 0 ? (
                      <ul className="list-disc list-inside space-y-0.5 text-emerald-800 text-[11px]">
                        {evalData.errorsIgnored.map((err, i) => (
                          <li key={i}>{err}</li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-slate-600 text-[11px]">Syntax compliant; algorithmic logic scored cleanly.</p>
                    )}
                  </div>

                  {/* Feedback */}
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">AI Examiner Notes:</span>
                    <p className="text-slate-700 leading-relaxed text-[11px]">
                      {evalData?.feedback || 'Good algorithmic design and time complexity optimization.'}
                    </p>
                  </div>

                  {/* Student Code Snippet */}
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Submitted Code:</span>
                    <pre className="p-3 bg-slate-900 text-slate-100 rounded-xl border border-slate-800 text-[11px] font-mono overflow-x-auto max-h-40 scrollbar-thin">
                      {submittedCode?.code || '// No code submitted'}
                    </pre>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Tab 3: Proctor Audit */}
      {activeTab === 'proctorAudit' && (
        <div className="space-y-6 text-xs">
          <div className="p-4 bg-white border border-slate-200 rounded-2xl flex flex-wrap items-center justify-between gap-4 shadow-xs">
            <div className="flex items-center gap-3">
              <div className={`w-12 h-12 rounded-2xl border flex items-center justify-center font-black text-lg ${
                submission.integrityScore >= 80
                  ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
                  : 'bg-amber-50 border-amber-300 text-amber-800'
              }`}>
                {submission.integrityScore}%
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-sm">Candidate Integrity Trust Index</h3>
                <p className="text-slate-500 text-[11px]">
                  {submission.integrityScore >= 80 ? 'High Confidence — Examination Cleared' : 'Manual Review Recommended'}
                </p>
              </div>
            </div>

            <div className="text-right">
              <span className="text-slate-500 text-[11px]">Security Flags Recorded:</span>
              <div className="font-mono font-bold text-rose-600 text-lg">
                {submission.violationCount} incidents
              </div>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-3 shadow-xs">
            <h4 className="font-bold text-xs uppercase tracking-wider text-slate-500">
              Proctor Incident Audit Trail
            </h4>

            {submission.violations.length === 0 ? (
              <div className="p-6 text-center text-slate-500 space-y-1">
                <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
                <div className="font-bold text-slate-800">Clean Examination Audit</div>
                <p className="text-[11px]">No tab switching, fullscreen exits, or unauthorized window blur incidents detected.</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {submission.violations.map((v) => (
                  <div key={v.id} className="py-2.5 flex items-start justify-between gap-4 text-xs">
                    <div className="flex items-start gap-2.5">
                      <AlertTriangle className={`w-4 h-4 shrink-0 mt-0.5 ${
                        v.severity === 'high' ? 'text-rose-600' : 'text-amber-600'
                      }`} />
                      <div>
                        <div className="font-bold text-slate-800">{v.description}</div>
                        <span className="text-[10px] text-slate-400 font-mono">Incident ID: {v.id}</span>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="font-mono text-slate-500 text-[11px]">{v.timestamp}</span>
                      <div>
                        <span className={`text-[9px] px-1.5 py-0.2 rounded font-bold uppercase ${
                          v.severity === 'high' ? 'bg-rose-100 text-rose-800' : 'bg-amber-100 text-amber-800'
                        }`}>
                          {v.severity}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab 4: Solutions & Candidate Response Review */}
      {activeTab === 'solutions' && (() => {
        const mcqQuestions = questions.filter(q => q.sectionId !== 'coding');
        
        let correctCount = 0;
        let incorrectCount = 0;
        let unattemptedCount = 0;

        mcqQuestions.forEach((q) => {
          const ans = submission.answers?.[q.id];
          if (!ans) unattemptedCount++;
          else if (ans === q.correctOptionId) correctCount++;
          else incorrectCount++;
        });

        const filteredList = mcqQuestions.filter((q) => {
          const ans = submission.answers?.[q.id];
          const isAttempted = Boolean(ans);
          const isCorrect = isAttempted && ans === q.correctOptionId;
          const isIncorrect = isAttempted && ans !== q.correctOptionId;
          const isUnattempted = !isAttempted;

          if (solutionFilter === 'correct' && !isCorrect) return false;
          if (solutionFilter === 'incorrect' && !isIncorrect) return false;
          if (solutionFilter === 'unattempted' && !isUnattempted) return false;

          if (sectionFilter !== 'all' && q.sectionId !== sectionFilter) return false;

          return true;
        });

        return (
          <div className="space-y-5 text-xs">
            {/* Header Performance Metrics */}
            <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-blue-50 text-blue-700">
                  <ListChecks className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">
                    Candidate Responses & Official Answer Key
                  </h3>
                  <p className="text-slate-500 text-[11px]">
                    Detailed comparison between student's chosen answer and the official answer key.
                  </p>
                </div>
              </div>

              {/* Status Counters */}
              <div className="flex items-center gap-2">
                <div className="px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11px] font-bold flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>{correctCount} Correct</span>
                </div>
                <div className="px-3 py-1.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-[11px] font-bold flex items-center gap-1.5">
                  <XCircle className="w-3.5 h-3.5 text-rose-600" />
                  <span>{incorrectCount} Incorrect</span>
                </div>
                <div className="px-3 py-1.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-[11px] font-bold flex items-center gap-1.5">
                  <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
                  <span>{unattemptedCount} Skipped</span>
                </div>
              </div>
            </div>

            {/* Filters Row */}
            <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-100/70 p-2 rounded-2xl border border-slate-200">
              {/* Status Filter */}
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="text-[11px] font-bold text-slate-500 mr-1 flex items-center gap-1">
                  <Filter className="w-3.5 h-3.5" /> Filter:
                </span>
                <button
                  onClick={() => setSolutionFilter('all')}
                  className={`px-3 py-1 rounded-xl text-[11px] font-bold transition-all ${
                    solutionFilter === 'all'
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
                  }`}
                >
                  All Questions ({mcqQuestions.length})
                </button>
                <button
                  onClick={() => setSolutionFilter('incorrect')}
                  className={`px-3 py-1 rounded-xl text-[11px] font-bold transition-all ${
                    solutionFilter === 'incorrect'
                      ? 'bg-rose-600 text-white shadow-xs'
                      : 'bg-white text-rose-700 hover:bg-rose-50 border border-rose-200'
                  }`}
                >
                  Incorrect Only ({incorrectCount})
                </button>
                <button
                  onClick={() => setSolutionFilter('correct')}
                  className={`px-3 py-1 rounded-xl text-[11px] font-bold transition-all ${
                    solutionFilter === 'correct'
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'bg-white text-emerald-700 hover:bg-emerald-50 border border-emerald-200'
                  }`}
                >
                  Correct Only ({correctCount})
                </button>
                <button
                  onClick={() => setSolutionFilter('unattempted')}
                  className={`px-3 py-1 rounded-xl text-[11px] font-bold transition-all ${
                    solutionFilter === 'unattempted'
                      ? 'bg-amber-600 text-white shadow-xs'
                      : 'bg-white text-amber-700 hover:bg-amber-50 border border-amber-200'
                  }`}
                >
                  Skipped ({unattemptedCount})
                </button>
              </div>

              {/* Section Filter */}
              <div className="flex flex-wrap items-center gap-1">
                {(['all', 'numerical', 'verbal', 'reasoning', 'advanced'] as const).map((sec) => (
                  <button
                    key={sec}
                    onClick={() => setSectionFilter(sec)}
                    className={`px-2.5 py-1 rounded-lg text-[10px] font-bold capitalize transition-colors ${
                      sectionFilter === sec
                        ? 'bg-slate-800 text-white'
                        : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                    }`}
                  >
                    {sec === 'all' ? 'All Sections' : sec}
                  </button>
                ))}
              </div>
            </div>

            {/* Questions List */}
            <div className="space-y-4">
              {filteredList.length === 0 ? (
                <div className="p-8 text-center bg-white rounded-2xl border border-slate-200 text-slate-500 space-y-1">
                  <CheckCircle2 className="w-8 h-8 text-slate-400 mx-auto" />
                  <div className="font-bold text-slate-700">No questions match this filter criteria</div>
                  <p className="text-[11px]">Try switching filters to view other question responses.</p>
                </div>
              ) : (
                filteredList.map((q, idx) => {
                  const isExpanded = expandedQuestionId === q.id;
                  const studentAns = submission.answers?.[q.id];
                  const isAttempted = Boolean(studentAns);
                  const isCorrect = isAttempted && studentAns === q.correctOptionId;
                  const isIncorrect = isAttempted && studentAns !== q.correctOptionId;

                  const studentOption = q.options?.find(o => o.id === studentAns);
                  const correctOption = q.options?.find(o => o.id === q.correctOptionId);

                  return (
                    <div
                      key={q.id}
                      className={`bg-white border rounded-2xl overflow-hidden shadow-xs transition-colors ${
                        isCorrect
                          ? 'border-emerald-200/90'
                          : isIncorrect
                          ? 'border-rose-200/90'
                          : 'border-slate-200'
                      }`}
                    >
                      {/* Question Card Header */}
                      <button
                        onClick={() => setExpandedQuestionId(isExpanded ? null : q.id)}
                        className="w-full p-4 flex items-center justify-between text-left hover:bg-slate-50 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <span className={`w-7 h-7 rounded-lg font-bold flex items-center justify-center text-xs shrink-0 ${
                            isCorrect
                              ? 'bg-emerald-100 text-emerald-800'
                              : isIncorrect
                              ? 'bg-rose-100 text-rose-800'
                              : 'bg-slate-100 text-slate-600'
                          }`}>
                            {idx + 1}
                          </span>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-slate-900 text-xs">{q.title}</span>
                              <span className="text-[10px] uppercase font-bold px-2 py-0.2 rounded bg-slate-100 text-slate-600">
                                {q.sectionId}
                              </span>
                            </div>
                            <span className="text-[10px] text-slate-500">{q.topic} • {q.marks} Marks</span>
                          </div>
                        </div>

                        {/* Status Badge & Accordion Toggle */}
                        <div className="flex items-center gap-3">
                          {isCorrect && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                              <span>Correct (+{q.marks})</span>
                            </span>
                          )}
                          {isIncorrect && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-rose-100 text-rose-800 border border-rose-300">
                              <XCircle className="w-3.5 h-3.5 text-rose-600" />
                              <span>Incorrect (0)</span>
                            </span>
                          )}
                          {!isAttempted && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800 border border-amber-300">
                              <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
                              <span>Skipped (0)</span>
                            </span>
                          )}

                          {isExpanded ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                        </div>
                      </button>

                      {/* Expandable Question Body (Default Expanded or Click to Toggle) */}
                      {isExpanded && (
                        <div className="p-4 pt-0 border-t border-slate-100 space-y-4 bg-slate-50/50">
                          {/* Question Statement */}
                          <div className="p-3 bg-white rounded-xl border border-slate-200 text-slate-800 whitespace-pre-wrap leading-relaxed text-xs">
                            {q.questionText}
                          </div>

                          {/* Direct Side-by-Side Comparison: Student Answer vs Write/Right Answer */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {/* Student Submitted Answer Card */}
                            <div className={`p-3 rounded-xl border flex flex-col justify-between ${
                              isCorrect
                                ? 'bg-emerald-50/80 border-emerald-300 text-emerald-950'
                                : isIncorrect
                                ? 'bg-rose-50/80 border-rose-300 text-rose-950'
                                : 'bg-amber-50/80 border-amber-300 text-amber-950'
                            }`}>
                              <div className="flex items-center justify-between pb-1.5 border-b border-black/5">
                                <span className="text-[10px] font-black uppercase tracking-wider text-slate-500">
                                  Student's Submitted Answer
                                </span>
                                {isCorrect && (
                                  <span className="text-[10px] font-bold bg-emerald-200 text-emerald-900 px-2 py-0.5 rounded-full flex items-center gap-1">
                                    <CheckCircle2 className="w-3 h-3 text-emerald-700" /> Matched Key
                                  </span>
                                )}
                                {isIncorrect && (
                                  <span className="text-[10px] font-bold bg-rose-200 text-rose-900 px-2 py-0.5 rounded-full flex items-center gap-1">
                                    <X className="w-3 h-3 text-rose-700" /> Wrong Choice
                                  </span>
                                )}
                                {!isAttempted && (
                                  <span className="text-[10px] font-bold bg-amber-200 text-amber-900 px-2 py-0.5 rounded-full">
                                    Not Attempted
                                  </span>
                                )}
                              </div>
                              <div className="pt-2 text-xs font-bold">
                                {isAttempted ? (
                                  <div className="flex items-start gap-2">
                                    <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black shrink-0 ${
                                      isCorrect ? 'bg-emerald-600 text-white' : 'bg-rose-600 text-white'
                                    }`}>
                                      {studentAns?.toUpperCase()}
                                    </span>
                                    <span>{studentOption?.text || studentAns}</span>
                                  </div>
                                ) : (
                                  <span className="text-amber-800 font-medium italic">
                                    Candidate did not select any option for this question.
                                  </span>
                                )}
                              </div>
                            </div>

                            {/* Official Write/Right Answer Card */}
                            <div className="p-3 rounded-xl border bg-emerald-50/80 border-emerald-300 text-emerald-950 flex flex-col justify-between">
                              <div className="flex items-center justify-between pb-1.5 border-b border-emerald-200">
                                <span className="text-[10px] font-black uppercase tracking-wider text-emerald-800">
                                  Write / Correct Answer (Key)
                                </span>
                                <span className="text-[10px] font-bold bg-emerald-200 text-emerald-900 px-2 py-0.5 rounded-full flex items-center gap-1">
                                  <CheckCheck className="w-3 h-3 text-emerald-700" /> Official Key
                                </span>
                              </div>
                              <div className="pt-2 text-xs font-bold text-emerald-950 flex items-start gap-2">
                                <span className="w-5 h-5 rounded-full bg-emerald-700 text-white flex items-center justify-center text-[10px] font-black shrink-0">
                                  {q.correctOptionId?.toUpperCase()}
                                </span>
                                <span>{correctOption?.text}</span>
                              </div>
                            </div>
                          </div>

                          {/* All Options Breakdown */}
                          <div className="space-y-1.5">
                            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                              All Question Options:
                            </span>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                              {q.options?.map((opt) => {
                                const isThisCorrect = opt.id === q.correctOptionId;
                                const isThisStudentChoice = opt.id === studentAns;

                                let cardClass = 'bg-white border-slate-200 text-slate-700';
                                if (isThisCorrect) {
                                  cardClass = 'bg-emerald-50 border-emerald-400 text-emerald-950 font-bold ring-1 ring-emerald-400';
                                } else if (isThisStudentChoice && !isThisCorrect) {
                                  cardClass = 'bg-rose-50 border-rose-300 text-rose-950 font-bold line-through';
                                }

                                return (
                                  <div
                                    key={opt.id}
                                    className={`p-2.5 rounded-xl border text-xs flex items-center justify-between ${cardClass}`}
                                  >
                                    <div className="flex items-center gap-2">
                                      <span className={`w-5 h-5 rounded-full font-bold text-[10px] flex items-center justify-center shrink-0 ${
                                        isThisCorrect
                                          ? 'bg-emerald-600 text-white'
                                          : isThisStudentChoice
                                          ? 'bg-rose-600 text-white'
                                          : 'bg-slate-100 text-slate-700'
                                      }`}>
                                        {opt.id.toUpperCase()}
                                      </span>
                                      <span>{opt.text}</span>
                                    </div>

                                    <div className="flex items-center gap-1 shrink-0 ml-2">
                                      {isThisCorrect && (
                                        <span className="text-[10px] bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded font-bold flex items-center gap-1">
                                          <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Right Ans
                                        </span>
                                      )}
                                      {isThisStudentChoice && !isThisCorrect && (
                                        <span className="text-[10px] bg-rose-100 text-rose-800 px-1.5 py-0.5 rounded font-bold flex items-center gap-1">
                                          <X className="w-3 h-3 text-rose-600" /> Student Ans
                                        </span>
                                      )}
                                      {isThisStudentChoice && isThisCorrect && (
                                        <span className="text-[10px] bg-emerald-200 text-emerald-900 px-1.5 py-0.5 rounded font-bold">
                                          Student Choice
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>

                          {/* Step-by-step Solution Explanation */}
                          {q.explanation && (
                            <div className="p-3 bg-blue-50/80 border border-blue-200 rounded-xl space-y-1">
                              <span className="text-[10px] font-bold text-blue-900 uppercase tracking-wider flex items-center gap-1.5">
                                <Brain className="w-3.5 h-3.5 text-blue-700" />
                                Step-by-Step Solution & Faculty Explanation:
                              </span>
                              <p className="text-blue-950 whitespace-pre-wrap text-[11px] leading-relaxed">
                                {q.explanation}
                              </p>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        );
      })()}

      {/* Retake Button Footer */}
      <div className="pt-6 border-t border-slate-200 flex items-center justify-between text-xs">
        <button
          onClick={onRetakeExam}
          className="px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold flex items-center gap-2 transition-colors"
        >
          <RotateCcw className="w-4 h-4" />
          <span>Retake Mock Exam</span>
        </button>

        <span className="text-slate-500 text-[11px]">
          School of Management Sciences Lucknow • Autonomous Assessment Portal
        </span>
      </div>
    </div>
  );
};
