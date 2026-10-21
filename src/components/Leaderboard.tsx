import React, { useState, useEffect, useMemo } from 'react';
import { SubmissionRecord } from '../types';
import { SmsLogo } from './SmsLogo';
import { 
  Trophy, 
  Medal, 
  Award, 
  Crown, 
  Flame, 
  Search, 
  Filter, 
  Sparkles, 
  ShieldCheck, 
  FileSpreadsheet, 
  Copy, 
  Check, 
  RefreshCw, 
  TrendingUp, 
  Code2, 
  GraduationCap, 
  ChevronRight,
  ArrowUpDown
} from 'lucide-react';

interface LeaderboardProps {
  onBackToTest: () => void;
  onSelectStudent?: (submission: SubmissionRecord) => void;
}

interface AggregatedStudent {
  rollNo: string;
  name: string;
  branch: string;
  year: string;
  college: string;
  bestScore: number;
  maxScore: number;
  percentage: number;
  qualificationStatus: 'TCS Digital' | 'TCS Ninja' | 'Under Review' | 'Not Qualified';
  bestCodingScore: number;
  bestNumericalScore: number;
  bestVerbalScore: number;
  bestReasoningScore: number;
  bestAdvancedScore: number;
  integrityScore: number;
  violationCount: number;
  attemptsCount: number;
  latestSubmissionDate: string;
  fastestTimeMinutes: number;
  codingLanguagesUsed: string[];
  rawSubmission: SubmissionRecord;
}

export const Leaderboard: React.FC<LeaderboardProps> = ({ onBackToTest, onSelectStudent }) => {
  const [submissions, setSubmissions] = useState<SubmissionRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBranch, setSelectedBranch] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [sortBy, setSortBy] = useState<'totalScore' | 'codingScore' | 'integrityScore' | 'speed'>('totalScore');
  const [copiedLeaderboard, setCopiedLeaderboard] = useState(false);

  // Fetch submissions from backend
  const fetchSubmissions = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/submissions');
      const data = await res.json();
      if (Array.isArray(data)) {
        setSubmissions(data);
      }
    } catch (err) {
      console.warn('Leaderboard fetch failed:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSubmissions();
  }, []);

  // Aggregate by Student Roll No (picks best run per candidate)
  const aggregatedStudents: AggregatedStudent[] = useMemo(() => {
    const map = new Map<string, AggregatedStudent>();

    submissions.forEach((sub) => {
      const roll = sub.student?.rollNo || 'UNKNOWN';
      const existing = map.get(roll);

      const languages: string[] = [];
      if (sub.codingSubmissions) {
        Object.values(sub.codingSubmissions).forEach((c) => {
          if (c?.language && !languages.includes(c.language)) {
            languages.push(c.language);
          }
        });
      }

      if (!existing) {
        map.set(roll, {
          rollNo: roll,
          name: sub.student?.name || 'Anonymous Student',
          branch: sub.student?.branch || 'CSE',
          year: sub.student?.year || '4th Year',
          college: sub.student?.college || 'SMS Lucknow',
          bestScore: sub.totalScore,
          maxScore: sub.maxTotalScore || 155,
          percentage: sub.percentage,
          qualificationStatus: sub.qualificationStatus,
          bestCodingScore: sub.sectionScores?.coding?.score || 0,
          bestNumericalScore: sub.sectionScores?.numerical?.score || 0,
          bestVerbalScore: sub.sectionScores?.verbal?.score || 0,
          bestReasoningScore: sub.sectionScores?.reasoning?.score || 0,
          bestAdvancedScore: sub.sectionScores?.advanced?.score || 0,
          integrityScore: sub.integrityScore,
          violationCount: sub.violationCount,
          attemptsCount: 1,
          latestSubmissionDate: sub.createdAt,
          fastestTimeMinutes: sub.timeTakenMinutes || 45,
          codingLanguagesUsed: languages,
          rawSubmission: sub,
        });
      } else {
        existing.attemptsCount += 1;
        if (sub.totalScore > existing.bestScore) {
          existing.bestScore = sub.totalScore;
          existing.percentage = sub.percentage;
          existing.qualificationStatus = sub.qualificationStatus;
          existing.rawSubmission = sub;
        }
        if ((sub.sectionScores?.coding?.score || 0) > existing.bestCodingScore) {
          existing.bestCodingScore = sub.sectionScores.coding.score;
        }
        if ((sub.timeTakenMinutes || 999) < existing.fastestTimeMinutes) {
          existing.fastestTimeMinutes = sub.timeTakenMinutes;
        }
        existing.integrityScore = Math.max(existing.integrityScore, sub.integrityScore);
        languages.forEach((l) => {
          if (!existing.codingLanguagesUsed.includes(l)) existing.codingLanguagesUsed.push(l);
        });
      }
    });

    return Array.from(map.values());
  }, [submissions]);

  // Filter & Sort
  const filteredRankings = useMemo(() => {
    return aggregatedStudents
      .filter((student) => {
        const matchesSearch =
          student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          student.rollNo.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesBranch = selectedBranch === 'ALL' || student.branch.includes(selectedBranch);
        const matchesStatus = selectedStatus === 'ALL' || student.qualificationStatus === selectedStatus;
        return matchesSearch && matchesBranch && matchesStatus;
      })
      .sort((a, b) => {
        if (sortBy === 'codingScore') {
          return b.bestCodingScore - a.bestCodingScore || b.bestScore - a.bestScore;
        }
        if (sortBy === 'integrityScore') {
          return b.integrityScore - a.integrityScore || b.bestScore - a.bestScore;
        }
        if (sortBy === 'speed') {
          return a.fastestTimeMinutes - b.fastestTimeMinutes || b.bestScore - a.bestScore;
        }
        return b.bestScore - a.bestScore || b.bestCodingScore - a.bestCodingScore || b.integrityScore - a.integrityScore;
      });
  }, [aggregatedStudents, searchTerm, selectedBranch, selectedStatus, sortBy]);

  // Top 3 Podium
  const top1 = filteredRankings[0];
  const top2 = filteredRankings[1];
  const top3 = filteredRankings[2];

  // Aggregated Stats
  const totalCandidates = aggregatedStudents.length;
  const digitalQualifiers = aggregatedStudents.filter((s) => s.qualificationStatus === 'TCS Digital').length;
  const averageCampusScore = totalCandidates > 0
    ? Math.round(aggregatedStudents.reduce((acc, s) => acc + s.bestScore, 0) / totalCandidates)
    : 0;
  const highestCodingMarks = Math.max(0, ...aggregatedStudents.map((s) => s.bestCodingScore));

  // Export Leaderboard CSV
  const handleExportCsv = () => {
    const headers = [
      'Campus Rank',
      'Student Name',
      'Roll Number',
      'Branch',
      'College',
      'Total Score',
      'Max Marks',
      'Percentage',
      'TCS Hiring Status',
      'Coding Logic Score (60M)',
      'Numerical Ability (25M)',
      'Verbal Ability (25M)',
      'Reasoning Ability (25M)',
      'Adv Quant (20M)',
      'Trust Index %',
      'Violations Flagged',
      'Fastest Time (Mins)',
      'Attempts'
    ];

    const rows = filteredRankings.map((s, idx) => [
      idx + 1,
      `"${s.name}"`,
      `"${s.rollNo}"`,
      `"${s.branch}"`,
      `"${s.college}"`,
      s.bestScore,
      s.maxScore,
      `"${s.percentage}%"`,
      `"${s.qualificationStatus}"`,
      s.bestCodingScore,
      s.bestNumericalScore,
      s.bestVerbalScore,
      s.bestReasoningScore,
      s.bestAdvancedScore,
      `"${s.integrityScore}%"`,
      s.violationCount,
      s.fastestTimeMinutes,
      s.attemptsCount
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `SMS_Lucknow_TCS_NQT_Leaderboard_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Copy Top 10 for Google Sheets
  const handleCopyForSheets = () => {
    const rows = filteredRankings.slice(0, 15).map((s, idx) => [
      idx + 1,
      s.name,
      s.rollNo,
      s.branch,
      s.bestScore,
      `${s.percentage}%`,
      s.qualificationStatus,
      s.bestCodingScore,
      `${s.integrityScore}%`,
      `${s.fastestTimeMinutes} mins`
    ].join('\t')).join('\n');

    navigator.clipboard.writeText(rows);
    setCopiedLeaderboard(true);
    setTimeout(() => setCopiedLeaderboard(false), 3000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8 animate-in fade-in duration-300 text-slate-800">
      {/* 1. Header Banner in Light Theme */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 md:p-8 shadow-xs relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-start gap-4">
          <SmsLogo size="lg" />
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="px-3 py-0.5 rounded-full bg-amber-100 text-amber-900 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
                <Trophy className="w-3.5 h-3.5 text-amber-600" />
                SMS Lucknow Hall of Fame
              </span>
              <span className="px-3 py-0.5 rounded-full bg-blue-100 text-blue-800 text-xs font-bold">
                TCS NQT Diagnostic Standings
              </span>
            </div>

            <h2 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2">
              Campus Performance Leaderboard
              <Flame className="w-6 h-6 text-amber-500" />
            </h2>

            <p className="text-slate-600 text-xs md:text-sm max-w-2xl leading-relaxed">
              Official rankings of top performing candidates at the School of Management Sciences Lucknow. Fosters healthy peer competition and algorithmic excellence for upcoming campus placements.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <button
            onClick={handleExportCsv}
            className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs flex items-center gap-2 transition-all active:scale-95"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={handleCopyForSheets}
            className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-700 font-bold text-xs rounded-xl shadow-2xs flex items-center gap-2 transition-all active:scale-95"
          >
            {copiedLeaderboard ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
            <span>{copiedLeaderboard ? 'Copied!' : 'Copy for Sheets'}</span>
          </button>

          <button
            onClick={onBackToTest}
            className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs transition-all"
          >
            Take Mock Test →
          </button>
        </div>
      </div>

      {/* 2. Campus Analytics Summary Badges in Light Theme */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-200 text-blue-600 flex items-center justify-center shrink-0">
            <GraduationCap className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Total Evaluated</span>
            <div className="text-2xl font-black text-slate-900">{totalCandidates} Candidates</div>
            <span className="text-[10px] text-blue-700 font-medium">Across All Departments</span>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-purple-50 border border-purple-200 text-purple-600 flex items-center justify-center shrink-0">
            <Crown className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">TCS Digital Qualifiers</span>
            <div className="text-2xl font-black text-purple-900">{digitalQualifiers} Students</div>
            <span className="text-[10px] text-purple-700 font-medium">7.0 – 9.0 LPA Tier</span>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center shrink-0">
            <Code2 className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Top Coding Logic</span>
            <div className="text-2xl font-black text-emerald-800">{highestCodingMarks} / 60 M</div>
            <span className="text-[10px] text-emerald-700 font-medium">AI Graded Algorithmic Logic</span>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center shrink-0">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Campus Mean Score</span>
            <div className="text-2xl font-black text-amber-900">{averageCampusScore} / 155 M</div>
            <span className="text-[10px] text-amber-700 font-medium">Target Benchmark: 80+</span>
          </div>
        </div>
      </div>

      {/* 3. Top 3 Podium Cards in Light Theme */}
      {filteredRankings.length >= 3 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
          {/* Rank 2: Silver */}
          <div className="order-2 md:order-1 bg-white border-2 border-slate-300 rounded-3xl p-6 shadow-xs flex flex-col items-center text-center relative hover:border-slate-400 transition-all">
            <div className="absolute -top-3 px-3 py-1 bg-slate-200 text-slate-800 font-black text-xs rounded-full shadow-xs flex items-center gap-1 uppercase tracking-wider">
              <Medal className="w-3.5 h-3.5 text-slate-600" />
              Rank 2 • Silver
            </div>

            <div className="w-18 h-18 rounded-full bg-slate-100 border-2 border-slate-300 flex items-center justify-center font-black text-2xl text-slate-700 mt-2">
              {top2.name.charAt(0)}
            </div>

            <h3 className="text-base font-black text-slate-900 mt-3">{top2.name}</h3>
            <span className="text-xs text-slate-500 font-mono">{top2.rollNo}</span>
            <span className="text-xs text-blue-700 font-medium mt-0.5">{top2.branch.split('(')[0]}</span>

            <div className="my-3 px-4 py-1.5 rounded-xl bg-slate-50 border border-slate-200 w-full flex items-center justify-between">
              <span className="text-xs text-slate-500">Score:</span>
              <span className="text-lg font-black text-slate-900 font-mono">{top2.bestScore} / 155</span>
            </div>

            <div className="grid grid-cols-2 gap-2 w-full text-xs">
              <div className="p-2 rounded-lg bg-slate-50 border border-slate-200">
                <span className="text-[10px] text-slate-500 block">Coding Logic</span>
                <span className="font-bold text-emerald-700">{top2.bestCodingScore} / 60</span>
              </div>
              <div className="p-2 rounded-lg bg-slate-50 border border-slate-200">
                <span className="text-[10px] text-slate-500 block">Trust Index</span>
                <span className="font-bold text-blue-700">{top2.integrityScore}%</span>
              </div>
            </div>

            <div className="mt-3">
              <span className="px-3 py-0.5 rounded-full bg-purple-50 text-purple-800 border border-purple-200 text-xs font-bold">
                {top2.qualificationStatus}
              </span>
            </div>
          </div>

          {/* Rank 1: Gold Spotlight in Light Theme */}
          <div className="order-1 md:order-2 bg-gradient-to-b from-amber-50 to-white border-2 border-amber-400 rounded-3xl p-6 shadow-md flex flex-col items-center text-center relative hover:shadow-lg transition-all scale-105 z-10">
            <div className="absolute -top-3.5 px-4 py-1 bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 font-black text-xs rounded-full shadow flex items-center gap-1.5 uppercase tracking-wider">
              <Crown className="w-4 h-4 fill-slate-950" />
              Rank 1 • Campus Champion
            </div>

            <div className="w-22 h-22 rounded-full bg-amber-100 border-3 border-amber-400 flex items-center justify-center font-black text-3xl text-amber-800 mt-3 shadow-inner">
              {top1.name.charAt(0)}
            </div>

            <h3 className="text-lg font-black text-slate-900 mt-3 flex items-center gap-1.5">
              {top1.name}
              <Sparkles className="w-4 h-4 text-amber-500" />
            </h3>
            <span className="text-xs text-slate-500 font-mono">{top1.rollNo}</span>
            <span className="text-xs text-amber-800 font-semibold mt-0.5">{top1.branch}</span>

            <div className="my-3 px-4 py-2 rounded-xl bg-amber-100/70 border border-amber-300 w-full flex items-center justify-between">
              <span className="text-xs text-amber-900 font-bold uppercase tracking-wider">Grand Total:</span>
              <span className="text-2xl font-black text-amber-950 font-mono">{top1.bestScore} / 155</span>
            </div>

            <div className="grid grid-cols-2 gap-2 w-full text-xs">
              <div className="p-2 rounded-lg bg-white border border-amber-200 shadow-2xs">
                <span className="text-[10px] text-slate-500 block">Coding Logic</span>
                <span className="font-black text-emerald-700 text-sm">{top1.bestCodingScore} / 60</span>
              </div>
              <div className="p-2 rounded-lg bg-white border border-amber-200 shadow-2xs">
                <span className="text-[10px] text-slate-500 block">Trust Index</span>
                <span className="font-black text-blue-700 text-sm">{top1.integrityScore}%</span>
              </div>
            </div>

            <div className="mt-3 flex items-center gap-2">
              <span className="px-3 py-0.5 rounded-full bg-purple-100 text-purple-900 border border-purple-200 text-xs font-black uppercase tracking-wide">
                🏆 {top1.qualificationStatus}
              </span>
              <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                {top1.percentage}%
              </span>
            </div>
          </div>

          {/* Rank 3: Bronze */}
          <div className="order-3 md:order-3 bg-white border-2 border-amber-600/30 rounded-3xl p-6 shadow-xs flex flex-col items-center text-center relative hover:border-amber-600/50 transition-all">
            <div className="absolute -top-3 px-3 py-1 bg-amber-800 text-white font-black text-xs rounded-full shadow-xs flex items-center gap-1 uppercase tracking-wider">
              <Medal className="w-3.5 h-3.5 text-amber-200" />
              Rank 3 • Bronze
            </div>

            <div className="w-18 h-18 rounded-full bg-amber-50 border-2 border-amber-600/40 flex items-center justify-center font-black text-2xl text-amber-800 mt-2">
              {top3.name.charAt(0)}
            </div>

            <h3 className="text-base font-black text-slate-900 mt-3">{top3.name}</h3>
            <span className="text-xs text-slate-500 font-mono">{top3.rollNo}</span>
            <span className="text-xs text-blue-700 font-medium mt-0.5">{top3.branch.split('(')[0]}</span>

            <div className="my-3 px-4 py-1.5 rounded-xl bg-slate-50 border border-slate-200 w-full flex items-center justify-between">
              <span className="text-xs text-slate-500">Score:</span>
              <span className="text-lg font-black text-slate-900 font-mono">{top3.bestScore} / 155</span>
            </div>

            <div className="grid grid-cols-2 gap-2 w-full text-xs">
              <div className="p-2 rounded-lg bg-slate-50 border border-slate-200">
                <span className="text-[10px] text-slate-500 block">Coding Logic</span>
                <span className="font-bold text-emerald-700">{top3.bestCodingScore} / 60</span>
              </div>
              <div className="p-2 rounded-lg bg-slate-50 border border-slate-200">
                <span className="text-[10px] text-slate-500 block">Trust Index</span>
                <span className="font-bold text-blue-700">{top3.integrityScore}%</span>
              </div>
            </div>

            <div className="mt-3">
              <span className="px-3 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold">
                {top3.qualificationStatus}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* 4. Controls: Filters & Sorters in Light Mode */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-4 text-xs shadow-xs">
        <div className="flex items-center gap-3 flex-1 min-w-[260px]">
          <Search className="w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search student by name or roll number..."
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
            </select>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-slate-600">Sort By:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-blue-700 font-bold"
            >
              <option value="totalScore">Total Score (Highest First)</option>
              <option value="codingScore">Coding Logic Score</option>
              <option value="integrityScore">Proctor Trust Index</option>
              <option value="speed">Fastest Completion Speed</option>
            </select>
          </div>

          <button
            onClick={fetchSubmissions}
            className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
            title="Refresh leaderboard"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* 5. Comprehensive Leaderboard Table in Light Mode */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
        <div className="px-5 py-3.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <Trophy className="w-4 h-4 text-amber-600" />
            <span className="font-bold text-slate-900">Full Campus Standings</span>
            <span className="px-2 py-0.5 rounded bg-slate-200 text-slate-700 text-[10px] font-mono">
              {filteredRankings.length} students ranked
            </span>
          </div>
          <span className="text-[11px] text-slate-500">
            Sorted by {sortBy === 'totalScore' ? 'Overall Score' : sortBy === 'codingScore' ? 'Coding Logic' : sortBy}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 text-[11px] uppercase tracking-wider text-slate-600 border-b border-slate-200 font-bold">
              <tr>
                <th className="p-3 w-16 text-center">Rank</th>
                <th className="p-3">Student Candidate</th>
                <th className="p-3">Branch & Batch</th>
                <th className="p-3 text-center">Total Score</th>
                <th className="p-3 text-center">Coding Logic</th>
                <th className="p-3 text-center">Quant & Logic</th>
                <th className="p-3 text-center">Verbal</th>
                <th className="p-3 text-center">Trust Index</th>
                <th className="p-3 text-center">Hiring Predictor</th>
                <th className="p-3 text-center">Speed</th>
                <th className="p-3 text-right">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredRankings.length === 0 ? (
                <tr>
                  <td colSpan={11} className="p-8 text-center text-slate-500">
                    No student submissions found matching the criteria.
                  </td>
                </tr>
              ) : (
                filteredRankings.map((student, idx) => {
                  const rank = idx + 1;

                  return (
                    <tr
                      key={student.rollNo}
                      onClick={() => onSelectStudent && onSelectStudent(student.rawSubmission)}
                      className={`hover:bg-slate-50 cursor-pointer transition-colors ${
                        rank === 1 ? 'bg-amber-50/30' : rank === 2 ? 'bg-slate-50/50' : rank === 3 ? 'bg-amber-50/20' : ''
                      }`}
                    >
                      {/* Rank Badge */}
                      <td className="p-3 text-center">
                        {rank === 1 ? (
                          <span className="w-6 h-6 mx-auto rounded-full bg-amber-400 text-slate-950 font-black flex items-center justify-center text-xs shadow-xs">
                            1
                          </span>
                        ) : rank === 2 ? (
                          <span className="w-6 h-6 mx-auto rounded-full bg-slate-300 text-slate-800 font-black flex items-center justify-center text-xs shadow-xs">
                            2
                          </span>
                        ) : rank === 3 ? (
                          <span className="w-6 h-6 mx-auto rounded-full bg-amber-700 text-white font-black flex items-center justify-center text-xs shadow-xs">
                            3
                          </span>
                        ) : (
                          <span className="font-mono text-slate-500 font-bold">{rank}</span>
                        )}
                      </td>

                      {/* Candidate Name */}
                      <td className="p-3">
                        <div className="font-bold text-slate-900 flex items-center gap-2">
                          <span>{student.name}</span>
                          {rank === 1 && <Crown className="w-3.5 h-3.5 text-amber-500" />}
                          {student.integrityScore === 100 && (
                            <span title="Clean proctored run (0 flags)">
                              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                            </span>
                          )}
                        </div>
                        <div className="text-[10px] text-slate-500 font-mono">{student.rollNo}</div>
                      </td>

                      {/* Branch & Batch */}
                      <td className="p-3">
                        <div className="text-slate-800">{student.branch.split('(')[0]}</div>
                        <div className="text-[10px] text-slate-500">{student.year}</div>
                      </td>

                      {/* Total Score */}
                      <td className="p-3 text-center">
                        <div className="font-mono font-black text-blue-700 text-sm">
                          {student.bestScore} <span className="text-[10px] text-slate-400 font-normal">/ 155</span>
                        </div>
                        <div className="text-[10px] text-slate-500">{student.percentage}%</div>
                      </td>

                      {/* Coding Logic */}
                      <td className="p-3 text-center">
                        <div className="font-mono font-bold text-indigo-700">
                          {student.bestCodingScore} / 60
                        </div>
                        {student.codingLanguagesUsed.length > 0 && (
                          <div className="text-[9px] text-slate-500 uppercase font-mono">
                            {student.codingLanguagesUsed.join(', ')}
                          </div>
                        )}
                      </td>

                      {/* Quant & Logic */}
                      <td className="p-3 text-center font-mono">
                        {student.bestNumericalScore + student.bestAdvancedScore} / 45
                      </td>

                      {/* Verbal */}
                      <td className="p-3 text-center font-mono">
                        {student.bestVerbalScore} / 25
                      </td>

                      {/* Trust Index */}
                      <td className="p-3 text-center">
                        <span className={`font-mono font-bold ${
                          student.integrityScore >= 90
                            ? 'text-emerald-700'
                            : student.integrityScore >= 75
                            ? 'text-amber-700'
                            : 'text-rose-700'
                        }`}>
                          {student.integrityScore}%
                        </span>
                        {student.violationCount > 0 && (
                          <div className="text-[9px] text-rose-600 font-medium">({student.violationCount} flags)</div>
                        )}
                      </td>

                      {/* Qualification Status */}
                      <td className="p-3 text-center">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          student.qualificationStatus === 'TCS Digital'
                            ? 'bg-purple-100 text-purple-900 border border-purple-200'
                            : student.qualificationStatus === 'TCS Ninja'
                            ? 'bg-emerald-100 text-emerald-900 border border-emerald-200'
                            : 'bg-amber-100 text-amber-900 border border-amber-200'
                        }`}>
                          {student.qualificationStatus}
                        </span>
                      </td>

                      {/* Speed */}
                      <td className="p-3 text-center font-mono text-[11px] text-slate-500">
                        {student.fastestTimeMinutes}m
                      </td>

                      {/* Action */}
                      <td className="p-3 text-right">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (onSelectStudent) onSelectStudent(student.rawSubmission);
                          }}
                          className="p-1 rounded hover:bg-slate-200 text-slate-400 hover:text-slate-800"
                          title="View student report"
                        >
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
