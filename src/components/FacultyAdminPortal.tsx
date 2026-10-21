import React, { useState, useEffect } from 'react';
import { SubmissionRecord, Question } from '../types';
import { TCS_QUESTIONS } from '../data/tcsQuestions';
import { SmsLogo } from './SmsLogo';
import { 
  FileSpreadsheet, 
  Mail, 
  Download, 
  Search, 
  Filter, 
  ShieldCheck, 
  Award, 
  Eye, 
  RefreshCw, 
  CheckCircle2, 
  User, 
  ChevronRight, 
  Copy, 
  Trophy,
  Sliders,
  Check,
  XCircle,
  AlertCircle,
  X,
  CheckCheck,
  Code2,
  Brain,
  ListChecks,
  ChevronUp,
  ChevronDown,
  Terminal
} from 'lucide-react';

interface FacultyAdminPortalProps {
  onBackToTest: () => void;
  targetEmail?: string;
  onOpenLeaderboard?: () => void;
  onOpenQuestionManager?: () => void;
  onViewFullScorecard?: (submission: SubmissionRecord) => void;
  questions?: Question[];
}

export const FacultyAdminPortal: React.FC<FacultyAdminPortalProps> = ({
  onBackToTest,
  targetEmail = 'singhrishabh06116@gmail.com',
  onOpenLeaderboard,
  onOpenQuestionManager,
  onViewFullScorecard,
  questions = TCS_QUESTIONS,
}) => {
  const [submissions, setSubmissions] = useState<SubmissionRecord[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBranch, setSelectedBranch] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [selectedSubmission, setSelectedSubmission] = useState<SubmissionRecord | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [copiedAllRows, setCopiedAllRows] = useState(false);

  // Inspector Modal Tab & Filter State
  const [inspectorTab, setInspectorTab] = useState<'responses' | 'coding' | 'proctor'>('responses');
  const [inspectorFilter, setInspectorFilter] = useState<'all' | 'incorrect' | 'correct' | 'unattempted'>('all');
  const [inspectorSection, setInspectorSection] = useState<'all' | 'numerical' | 'verbal' | 'reasoning' | 'advanced'>('all');
  const [expandedQuestionId, setExpandedQuestionId] = useState<string | null>(null);

  // Fetch submissions from server
  const fetchSubmissions = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/submissions');
      const data = await res.json();
      if (Array.isArray(data)) {
        setSubmissions(data);
      }
    } catch (err) {
      console.warn('Failed to load submissions:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSubmissions();
  }, []);

  // Filtered list
  const filteredSubmissions = submissions.filter((sub) => {
    const matchesSearch =
      sub.student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sub.student.rollNo.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesBranch = selectedBranch === 'ALL' || sub.student.branch.includes(selectedBranch);
    const matchesStatus = selectedStatus === 'ALL' || sub.qualificationStatus === selectedStatus;
    return matchesSearch && matchesBranch && matchesStatus;
  });

  // Export All Submissions to Google Sheets CSV
  const handleExportAllToGoogleSheets = () => {
    const headers = [
      'Timestamp',
      'Student Name',
      'Roll Number',
      'Branch',
      'College',
      'Total Score',
      'Percentage',
      'Qualification Status',
      'Numerical Ability',
      'Verbal Ability',
      'Reasoning Ability',
      'Adv Quant',
      'Hands-on Coding',
      'Proctor Integrity %',
      'Violations Count'
    ];

    const rows = filteredSubmissions.map((s) => [
      `"${new Date(s.createdAt).toLocaleString()}"`,
      `"${s.student.name}"`,
      `"${s.student.rollNo}"`,
      `"${s.student.branch}"`,
      `"${s.student.college}"`,
      s.totalScore,
      `"${s.percentage}%"`,
      `"${s.qualificationStatus}"`,
      s.sectionScores.numerical.score,
      s.sectionScores.verbal.score,
      s.sectionScores.reasoning.score,
      s.sectionScores.advanced.score,
      s.sectionScores.coding.score,
      `"${s.integrityScore}%"`,
      s.violationCount
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `SMS_Lucknow_TCS_NQT_Master_Records_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // 1-Click Copy All for Google Sheets
  const handleCopyAllForSheets = () => {
    const rows = filteredSubmissions.map((s) => [
      new Date(s.createdAt).toLocaleString(),
      s.student.name,
      s.student.rollNo,
      s.student.branch,
      s.totalScore,
      `${s.percentage}%`,
      s.qualificationStatus,
      s.sectionScores.numerical.score,
      s.sectionScores.verbal.score,
      s.sectionScores.reasoning.score,
      s.sectionScores.advanced.score,
      s.sectionScores.coding.score,
      `${s.integrityScore}%`,
      s.violationCount
    ].join('\t')).join('\n');

    navigator.clipboard.writeText(rows);
    setCopiedAllRows(true);
    setTimeout(() => setCopiedAllRows(false), 3000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8 animate-in fade-in duration-300 text-slate-800">
      {/* Top Banner in Light Mode */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 md:p-8 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-start gap-4">
          <SmsLogo size="lg" />
          <div>
            <div className="flex items-center gap-2">
              <span className="px-3 py-0.5 rounded-full bg-blue-100 text-blue-800 text-xs font-bold uppercase tracking-wider">
                Faculty Administration & Records
              </span>
              <span className="text-xs text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                Auto-Dispatched to {targetEmail}
              </span>
            </div>
            <h2 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight mt-1">
              SMS Lucknow TCS NQT Submissions Roster
            </h2>
            <p className="text-xs md:text-sm text-slate-600 mt-0.5">
              Real-time candidate scorecards, AI proctoring audits, multi-language coding submissions, and automated delivery to <strong>{targetEmail}</strong>.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {onOpenQuestionManager && (
            <button
              onClick={onOpenQuestionManager}
              className="px-3.5 py-2 bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-700 font-bold text-xs rounded-xl shadow-2xs flex items-center gap-2 transition-all active:scale-95"
            >
              <Sliders className="w-4 h-4 text-blue-600" />
              <span>Edit Test Questions</span>
            </button>
          )}

          <button
            onClick={handleExportAllToGoogleSheets}
            className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs flex items-center gap-2 transition-all active:scale-95"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Export to Google Sheets</span>
          </button>

          <button
            onClick={handleCopyAllForSheets}
            className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-700 font-bold text-xs rounded-xl shadow-2xs flex items-center gap-2 transition-all active:scale-95"
          >
            {copiedAllRows ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
            <span>{copiedAllRows ? 'Copied All!' : 'Copy for Sheets'}</span>
          </button>

          {onOpenLeaderboard && (
            <button
              onClick={onOpenLeaderboard}
              className="px-3.5 py-2 bg-amber-50 hover:bg-amber-100 border border-amber-300 text-amber-800 font-bold text-xs rounded-xl shadow-2xs flex items-center gap-2 transition-all active:scale-95"
            >
              <Trophy className="w-4 h-4 text-amber-600" />
              <span>Campus Leaderboard</span>
            </button>
          )}

          <button
            onClick={onBackToTest}
            className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs"
          >
            Take Test / Candidate View
          </button>
        </div>
      </div>

      {/* Filter and Search Bar in Light Mode */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-4 text-xs shadow-xs">
        <div className="flex items-center gap-3 flex-1 min-w-[260px]">
          <Search className="w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by student name or roll number..."
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1.5">
            <span className="text-slate-600">Branch:</span>
            <select
              value={selectedBranch}
              onChange={(e) => setSelectedBranch(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-800"
            >
              <option value="ALL">All Branches</option>
              <option value="CSE">CSE</option>
              <option value="IT">IT</option>
              <option value="ECE">ECE</option>
              <option value="ME">ME</option>
              <option value="Civil">Civil</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-slate-600">Status:</span>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-800"
            >
              <option value="ALL">All Statuses</option>
              <option value="TCS Digital">TCS Digital</option>
              <option value="TCS Ninja">TCS Ninja</option>
              <option value="Under Review">Under Review</option>
            </select>
          </div>

          <button
            onClick={fetchSubmissions}
            className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700"
            title="Refresh submissions"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Google Sheet Data Grid View in Light Mode */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
        <div className="px-5 py-3.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            <span className="font-bold text-slate-900">Live Student Registry (Google Sheets Grid)</span>
            <span className="px-2 py-0.5 rounded bg-slate-200 text-slate-700 text-[10px] font-mono">
              {filteredSubmissions.length} records found
            </span>
          </div>
          <span className="text-[11px] text-slate-500">
            Click any row to inspect candidate AI coding logic & webcam proctor logs
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 text-[11px] uppercase tracking-wider text-slate-600 border-b border-slate-200 font-bold">
              <tr>
                <th className="p-3">Candidate</th>
                <th className="p-3">Roll No</th>
                <th className="p-3">Branch</th>
                <th className="p-3">Total Score</th>
                <th className="p-3">Numerical</th>
                <th className="p-3">Verbal</th>
                <th className="p-3">Reasoning</th>
                <th className="p-3">Coding (AI)</th>
                <th className="p-3">Trust %</th>
                <th className="p-3">Flags</th>
                <th className="p-3">Status</th>
                <th className="p-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredSubmissions.length === 0 ? (
                <tr>
                  <td colSpan={12} className="p-8 text-center text-slate-500">
                    No submissions recorded yet. Take the test or adjust filter criteria.
                  </td>
                </tr>
              ) : (
                filteredSubmissions.map((sub) => (
                  <tr
                    key={sub.id}
                    onClick={() => setSelectedSubmission(sub)}
                    className="hover:bg-slate-50 cursor-pointer transition-colors"
                  >
                    <td className="p-3 font-bold text-slate-900 flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-blue-100 text-blue-800 font-bold flex items-center justify-center text-[10px]">
                        {sub.student.name.charAt(0)}
                      </div>
                      <span>{sub.student.name}</span>
                    </td>
                    <td className="p-3 font-mono text-slate-600">{sub.student.rollNo}</td>
                    <td className="p-3">{sub.student.branch.split('(')[0]}</td>
                    <td className="p-3 font-mono font-black text-blue-700">
                      {sub.totalScore} <span className="text-[10px] text-slate-400 font-normal">/ 155</span>
                    </td>
                    <td className="p-3 font-mono">{sub.sectionScores.numerical.score}</td>
                    <td className="p-3 font-mono">{sub.sectionScores.verbal.score}</td>
                    <td className="p-3 font-mono">{sub.sectionScores.reasoning.score}</td>
                    <td className="p-3 font-mono font-bold text-indigo-700">{sub.sectionScores.coding.score}</td>
                    <td className="p-3">
                      <span className={`font-mono font-bold ${
                        sub.integrityScore >= 80 ? 'text-emerald-700' : 'text-amber-700'
                      }`}>
                        {sub.integrityScore}%
                      </span>
                    </td>
                    <td className="p-3">
                      <span className={`px-1.5 py-0.2 rounded font-mono text-[10px] font-bold ${
                        sub.violationCount > 0 ? 'bg-rose-100 text-rose-800' : 'bg-emerald-100 text-emerald-800'
                      }`}>
                        {sub.violationCount}
                      </span>
                    </td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        sub.qualificationStatus === 'TCS Digital'
                          ? 'bg-purple-100 text-purple-900 border border-purple-200'
                          : sub.qualificationStatus === 'TCS Ninja'
                          ? 'bg-emerald-100 text-emerald-900 border border-emerald-200'
                          : 'bg-amber-100 text-amber-900 border border-amber-200'
                      }`}>
                        {sub.qualificationStatus}
                      </span>
                    </td>
                    <td className="p-3 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedSubmission(sub);
                        }}
                        className="p-1 rounded hover:bg-slate-200 text-slate-400 hover:text-slate-800"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Individual Candidate Inspector Modal in Executive Light Theme */}
      {selectedSubmission && (() => {
        const mcqQuestions = questions.filter(q => q.sectionId !== 'coding');
        
        let correctCount = 0;
        let incorrectCount = 0;
        let unattemptedCount = 0;

        mcqQuestions.forEach((q) => {
          const ans = selectedSubmission.answers?.[q.id];
          if (!ans) unattemptedCount++;
          else if (ans === q.correctOptionId) correctCount++;
          else incorrectCount++;
        });

        const filteredQuestions = mcqQuestions.filter((q) => {
          const ans = selectedSubmission.answers?.[q.id];
          const isAttempted = Boolean(ans);
          const isCorrect = isAttempted && ans === q.correctOptionId;
          const isIncorrect = isAttempted && ans !== q.correctOptionId;
          const isUnattempted = !isAttempted;

          if (inspectorFilter === 'correct' && !isCorrect) return false;
          if (inspectorFilter === 'incorrect' && !isIncorrect) return false;
          if (inspectorFilter === 'unattempted' && !isUnattempted) return false;

          if (inspectorSection !== 'all' && q.sectionId !== inspectorSection) return false;

          return true;
        });

        return (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 md:p-6">
            <div className="bg-white border border-slate-200 max-w-5xl w-full rounded-3xl shadow-2xl p-5 md:p-7 text-slate-800 space-y-5 max-h-[92vh] overflow-y-auto">
              {/* Modal Top Bar */}
              <div className="flex flex-wrap items-center justify-between border-b border-slate-200 pb-4 gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-800 font-black text-lg flex items-center justify-center shadow-xs">
                    {selectedSubmission.student.name.charAt(0)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-xl font-black text-slate-900">{selectedSubmission.student.name}</h3>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 font-mono">
                        {selectedSubmission.id}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Roll No: <strong className="text-slate-800 font-mono">{selectedSubmission.student.rollNo}</strong> • {selectedSubmission.student.branch} • {selectedSubmission.student.college}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setSelectedSubmission(null)}
                    className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 rounded-xl text-xs font-bold text-slate-700 transition-colors"
                  >
                    Close
                  </button>
                </div>
              </div>

              {/* Scorecard Quick Metrics */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center text-xs">
                <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">Total Marks</span>
                  <span className="text-xl font-black text-blue-700 mt-0.5 block">{selectedSubmission.totalScore} / 155</span>
                </div>
                <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">Overall Score</span>
                  <span className="text-xl font-black text-indigo-700 mt-0.5 block">{selectedSubmission.percentage}%</span>
                </div>
                <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">Proctor Trust Index</span>
                  <span className="text-xl font-black text-emerald-700 mt-0.5 block">{selectedSubmission.integrityScore}%</span>
                </div>
                <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">Status</span>
                  <span className="text-sm font-black text-purple-800 mt-1 block">{selectedSubmission.qualificationStatus}</span>
                </div>
              </div>

              {/* Inspector View Navigation Tabs */}
              <div className="flex items-center border-b border-slate-200 gap-2 overflow-x-auto text-xs">
                <button
                  onClick={() => setInspectorTab('responses')}
                  className={`px-4 py-2.5 border-b-2 font-bold transition-all flex items-center gap-2 shrink-0 ${
                    inspectorTab === 'responses'
                      ? 'border-blue-600 text-blue-700'
                      : 'border-transparent text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <ListChecks className="w-4 h-4" />
                  <span>Question Responses & Right Answers</span>
                  <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-blue-100 text-blue-800">
                    {correctCount}/{mcqQuestions.length}
                  </span>
                </button>

                <button
                  onClick={() => setInspectorTab('coding')}
                  className={`px-4 py-2.5 border-b-2 font-bold transition-all flex items-center gap-2 shrink-0 ${
                    inspectorTab === 'coding'
                      ? 'border-indigo-600 text-indigo-700'
                      : 'border-transparent text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <Code2 className="w-4 h-4 text-indigo-600" />
                  <span>AI Coding Logic & Solutions</span>
                  <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-indigo-100 text-indigo-800">
                    {selectedSubmission.sectionScores.coding.score}/60
                  </span>
                </button>

                <button
                  onClick={() => setInspectorTab('proctor')}
                  className={`px-4 py-2.5 border-b-2 font-bold transition-all flex items-center gap-2 shrink-0 ${
                    inspectorTab === 'proctor'
                      ? 'border-rose-600 text-rose-700'
                      : 'border-transparent text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <ShieldCheck className="w-4 h-4 text-rose-600" />
                  <span>Anti-Cheating Proctor Logs</span>
                  <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-rose-100 text-rose-800">
                    {selectedSubmission.violations.length} Flags
                  </span>
                </button>
              </div>

              {/* Tab 1: Question Responses & Right Answers */}
              {inspectorTab === 'responses' && (
                <div className="space-y-4 text-xs">
                  {/* Summary Bar & Counters */}
                  <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3.5 flex flex-wrap items-center justify-between gap-3">
                    <div className="text-slate-700 font-medium">
                      Showing detailed answer key comparison for candidate <strong>{selectedSubmission.student.name}</strong>:
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-1 rounded-xl bg-emerald-100 text-emerald-800 font-bold text-[11px] flex items-center gap-1 border border-emerald-200">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> {correctCount} Correct
                      </span>
                      <span className="px-2.5 py-1 rounded-xl bg-rose-100 text-rose-800 font-bold text-[11px] flex items-center gap-1 border border-rose-200">
                        <XCircle className="w-3.5 h-3.5 text-rose-600" /> {incorrectCount} Incorrect
                      </span>
                      <span className="px-2.5 py-1 rounded-xl bg-amber-100 text-amber-800 font-bold text-[11px] flex items-center gap-1 border border-amber-200">
                        <AlertCircle className="w-3.5 h-3.5 text-amber-600" /> {unattemptedCount} Skipped
                      </span>
                    </div>
                  </div>

                  {/* Filter Toolbar */}
                  <div className="flex flex-wrap items-center justify-between gap-2.5 bg-slate-100/70 p-2 rounded-2xl border border-slate-200">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="text-[11px] font-bold text-slate-500 mr-1 flex items-center gap-1">
                        <Filter className="w-3.5 h-3.5" /> Filter Answers:
                      </span>
                      <button
                        onClick={() => setInspectorFilter('all')}
                        className={`px-3 py-1 rounded-xl text-[11px] font-bold transition-all ${
                          inspectorFilter === 'all'
                            ? 'bg-blue-600 text-white shadow-xs'
                            : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
                        }`}
                      >
                        All Questions ({mcqQuestions.length})
                      </button>
                      <button
                        onClick={() => setInspectorFilter('incorrect')}
                        className={`px-3 py-1 rounded-xl text-[11px] font-bold transition-all ${
                          inspectorFilter === 'incorrect'
                            ? 'bg-rose-600 text-white shadow-xs'
                            : 'bg-white text-rose-700 hover:bg-rose-50 border border-rose-200'
                        }`}
                      >
                        Incorrect Only ({incorrectCount})
                      </button>
                      <button
                        onClick={() => setInspectorFilter('correct')}
                        className={`px-3 py-1 rounded-xl text-[11px] font-bold transition-all ${
                          inspectorFilter === 'correct'
                            ? 'bg-emerald-600 text-white shadow-xs'
                            : 'bg-white text-emerald-700 hover:bg-emerald-50 border border-emerald-200'
                        }`}
                      >
                        Correct Only ({correctCount})
                      </button>
                      <button
                        onClick={() => setInspectorFilter('unattempted')}
                        className={`px-3 py-1 rounded-xl text-[11px] font-bold transition-all ${
                          inspectorFilter === 'unattempted'
                            ? 'bg-amber-600 text-white shadow-xs'
                            : 'bg-white text-amber-700 hover:bg-amber-50 border border-amber-200'
                        }`}
                      >
                        Skipped Only ({unattemptedCount})
                      </button>
                    </div>

                    {/* Section Selector */}
                    <div className="flex flex-wrap items-center gap-1">
                      {(['all', 'numerical', 'verbal', 'reasoning', 'advanced'] as const).map((sec) => (
                        <button
                          key={sec}
                          onClick={() => setInspectorSection(sec)}
                          className={`px-2.5 py-1 rounded-lg text-[10px] font-bold capitalize transition-colors ${
                            inspectorSection === sec
                              ? 'bg-slate-800 text-white'
                              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                          }`}
                        >
                          {sec === 'all' ? 'All Sections' : sec}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Filtered Question Cards */}
                  <div className="space-y-4 max-h-[50vh] overflow-y-auto pr-1">
                    {filteredQuestions.length === 0 ? (
                      <div className="p-8 text-center bg-slate-50 rounded-2xl border border-slate-200 text-slate-500 space-y-1">
                        <CheckCircle2 className="w-8 h-8 text-slate-400 mx-auto" />
                        <div className="font-bold text-slate-700">No questions found matching selected filter</div>
                      </div>
                    ) : (
                      filteredQuestions.map((q, idx) => {
                        const studentAns = selectedSubmission.answers?.[q.id];
                        const isAttempted = Boolean(studentAns);
                        const isCorrect = isAttempted && studentAns === q.correctOptionId;
                        const isIncorrect = isAttempted && studentAns !== q.correctOptionId;

                        const studentOption = q.options?.find(o => o.id === studentAns);
                        const correctOption = q.options?.find(o => o.id === q.correctOptionId);
                        const isExpanded = expandedQuestionId === q.id || inspectorFilter === 'incorrect';

                        return (
                          <div
                            key={q.id}
                            className={`bg-white border rounded-2xl overflow-hidden shadow-xs transition-colors ${
                              isCorrect
                                ? 'border-emerald-300'
                                : isIncorrect
                                ? 'border-rose-300'
                                : 'border-slate-200'
                            }`}
                          >
                            {/* Question Header Card */}
                            <div
                              onClick={() => setExpandedQuestionId(isExpanded ? null : q.id)}
                              className="w-full p-4 flex items-center justify-between text-left hover:bg-slate-50/70 transition-colors cursor-pointer"
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

                              {/* Status Badges */}
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
                            </div>

                            {/* Detailed Body (Statement, Comparison, Options, Solution) */}
                            {isExpanded && (
                              <div className="p-4 pt-0 border-t border-slate-100 space-y-3.5 bg-slate-50/50">
                                {/* Question Statement */}
                                <div className="p-3 bg-white rounded-xl border border-slate-200 text-slate-800 whitespace-pre-wrap leading-relaxed text-xs">
                                  {q.questionText}
                                </div>

                                {/* PRIMARY COMPARISON: Student Answer vs Write/Right Answer */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                  {/* Student's Answer */}
                                  <div className={`p-3 rounded-xl border flex flex-col justify-between ${
                                    isCorrect
                                      ? 'bg-emerald-50/90 border-emerald-300 text-emerald-950'
                                      : isIncorrect
                                      ? 'bg-rose-50/90 border-rose-300 text-rose-950'
                                      : 'bg-amber-50/90 border-amber-300 text-amber-950'
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
                                          Student skipped this question without answering.
                                        </span>
                                      )}
                                    </div>
                                  </div>

                                  {/* Right / Correct Answer */}
                                  <div className="p-3 rounded-xl border bg-emerald-50/90 border-emerald-300 text-emerald-950 flex flex-col justify-between">
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

                                {/* Options Breakdown */}
                                <div className="space-y-1.5">
                                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                                    Options:
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
                                                <X className="w-3 h-3 text-rose-600" /> Student Choice
                                              </span>
                                            )}
                                          </div>
                                        </div>
                                      );
                                    })}
                                  </div>
                                </div>

                                {/* Step-by-Step Explanation */}
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
              )}

              {/* Tab 2: AI Coding Logic & Student Code */}
              {inspectorTab === 'coding' && (
                <div className="space-y-4 text-xs">
                  <div className="text-slate-500 text-[11px]">
                    Candidate multi-language coding submissions evaluated with institutional logic leniency:
                  </div>

                  {Object.entries(selectedSubmission.codingEvaluations).map(([codeId, evalData]: any) => {
                    const studentCodeData = selectedSubmission.codingSubmissions?.[codeId];
                    const problemQuestion = questions.find(q => q.id === codeId);

                    return (
                      <div key={codeId} className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 pb-2">
                          <div className="flex items-center gap-2">
                            <span className="w-6 h-6 rounded-lg bg-indigo-100 text-indigo-800 font-bold flex items-center justify-center text-xs">
                              {codeId === 'code_1' ? '1' : '2'}
                            </span>
                            <span className="font-bold text-slate-900 text-sm">
                              {problemQuestion?.title || `${codeId.toUpperCase()} Problem`}
                            </span>
                            {studentCodeData?.language && (
                              <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 text-[10px] font-bold font-mono">
                                {studentCodeData.language}
                              </span>
                            )}
                          </div>

                          <div className="flex items-center gap-2">
                            <span className="text-xs font-black text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-xl border border-indigo-200">
                              Score: {evalData.score} / 30
                            </span>
                            <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-xl border border-emerald-200">
                              {evalData.verdict}
                            </span>
                          </div>
                        </div>

                        {/* Student Submitted Code */}
                        <div className="space-y-1">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                            Student Submitted Code:
                          </span>
                          <div className="bg-slate-900 text-slate-100 p-3 rounded-xl font-mono text-[11px] overflow-x-auto max-h-48 whitespace-pre">
                            {studentCodeData?.code || '// No custom code submitted. Default logic template used.'}
                          </div>
                        </div>

                        {/* Official Correct Model Solution (Write Answer) */}
                        <div className="space-y-1">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 flex items-center gap-1.5">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            Official Model Solution (Right Answer):
                          </span>
                          <div className="bg-emerald-950 text-emerald-200 p-3 rounded-xl font-mono text-[11px] overflow-x-auto max-h-48 whitespace-pre border border-emerald-800">
                            {problemQuestion?.modelSolutions?.[studentCodeData?.language || 'python'] ||
                             problemQuestion?.modelSolutions?.python ||
                             '// Official model solution'}
                          </div>
                        </div>

                        {/* Feedback & Leniency Log */}
                        <div className="space-y-1">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                            Evaluator Feedback & Algorithmic Analysis:
                          </span>
                          <p className="text-slate-700 text-xs bg-white p-3 rounded-xl border border-slate-200">
                            {evalData.feedback}
                          </p>
                        </div>

                        {evalData.errorsIgnored && evalData.errorsIgnored.length > 0 && (
                          <div className="p-2.5 bg-emerald-50 rounded-xl border border-emerald-200 text-[11px] text-emerald-900 font-medium">
                            <strong>Syntax leniency applied:</strong> {evalData.errorsIgnored.join(', ')}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Tab 3: Proctor Incident Logs */}
              {inspectorTab === 'proctor' && (
                <div className="space-y-3 text-xs">
                  <div className="flex items-center justify-between bg-slate-50 p-3 rounded-2xl border border-slate-200">
                    <span className="font-bold text-slate-700">Proctor Integrity Score:</span>
                    <span className="font-black text-emerald-700 text-base">{selectedSubmission.integrityScore}% Trust</span>
                  </div>

                  {selectedSubmission.violations.length === 0 ? (
                    <div className="p-8 text-center bg-emerald-50 rounded-2xl border border-emerald-200 text-emerald-900 space-y-1">
                      <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
                      <div className="font-bold text-sm">Clean Examination Audit</div>
                      <p className="text-[11px] text-emerald-700">Zero violations flagged. Fullscreen maintained with no tab blurs.</p>
                    </div>
                  ) : (
                    <div className="space-y-2 max-h-60 overflow-y-auto">
                      {selectedSubmission.violations.map((v) => (
                        <div key={v.id} className="p-3 bg-rose-50/70 rounded-xl border border-rose-200 flex items-center justify-between">
                          <div>
                            <span className="font-bold text-rose-900 text-xs block">{v.description}</span>
                            <span className="text-[10px] text-slate-500 font-mono">Incident ID: {v.id} • Severity: {v.severity.toUpperCase()}</span>
                          </div>
                          <span className="font-mono text-slate-500 text-[11px]">{v.timestamp}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Modal Bottom Actions */}
              <div className="pt-3 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3">
                <button
                  onClick={() => setSelectedSubmission(null)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-colors"
                >
                  Close Window
                </button>

                {onViewFullScorecard && (
                  <button
                    onClick={() => {
                      const sub = selectedSubmission;
                      setSelectedSubmission(null);
                      onViewFullScorecard(sub);
                    }}
                    className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs flex items-center gap-1.5 transition-all"
                  >
                    <Eye className="w-4 h-4" />
                    <span>Open Full Interactive Scorecard & Answers</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
};
