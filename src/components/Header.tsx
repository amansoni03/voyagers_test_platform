import React from 'react';
import { SmsLogo } from './SmsLogo';
import { 
  ShieldCheck, 
  Award, 
  GraduationCap, 
  LayoutDashboard, 
  Calculator, 
  Trophy, 
  Sliders, 
  Settings,
  Lock,
  LogOut,
  UserCheck
} from 'lucide-react';

interface HeaderProps {
  currentView: 'instructions' | 'exam' | 'thankyou' | 'result' | 'faculty' | 'leaderboard';
  onNavigate: (view: 'instructions' | 'exam' | 'thankyou' | 'result' | 'faculty' | 'leaderboard') => void;
  onToggleCalculator?: () => void;
  isExamActive?: boolean;
  onOpenQuestionManager?: () => void;
  isAdmin?: boolean;
  onOpenAdminLogin: () => void;
  onLogoutAdmin: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentView,
  onNavigate,
  onToggleCalculator,
  isExamActive,
  onOpenQuestionManager,
  isAdmin = false,
  onOpenAdminLogin,
  onLogoutAdmin,
}) => {
  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs select-none">
      {/* Top Academic Sub-bar */}
      <div className="bg-slate-50 border-b border-slate-200 px-4 py-1.5 text-[11px] text-slate-600 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-blue-100 text-blue-800 font-bold tracking-wide uppercase text-[10px] border border-blue-200">
            AKTU Code: 423
          </span>
          <span className="text-slate-600 font-medium hidden sm:inline">
            Kasimpur Biruha, PO-Gosainganj, Sultanpur Road, Lucknow • Approved by AICTE, Affiliated to AKTU
          </span>
        </div>

        <div className="flex items-center gap-1.5 text-slate-500 font-medium text-[11px]">
          <Award className="w-3.5 h-3.5 text-amber-500" />
          <span>Department of Computer Science & Engineering</span>
        </div>
      </div>

      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-4 py-2.5 flex items-center justify-between gap-4">
        {/* College Logo & Portal Title */}
        <div className="flex items-center gap-3.5">
          <SmsLogo size="md" className="shrink-0" />

          <div className="hidden lg:block border-l border-slate-200 pl-3.5">
            <div className="flex items-center gap-2">
              <span className="text-xs md:text-sm font-black tracking-tight text-slate-900">
                TCS NQT Assessment Portal
              </span>
              <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold">
                2025-26
              </span>
            </div>
            <p className="text-[11px] text-slate-500 font-medium">
              Autonomous Recruitment & Diagnostic Portal • AI Proctoring & Logic Evaluation
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          {/* Scientific Calculator (only visible during exam) */}
          {isExamActive && onToggleCalculator && (
            <button
              onClick={onToggleCalculator}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-700 text-xs font-semibold shadow-xs transition-colors"
              title="Open TCS iON Scientific Calculator"
            >
              <Calculator className="w-4 h-4 text-amber-600" />
              <span className="hidden sm:inline">Calculator</span>
            </button>
          )}

          {/* Student & Universal: Test Portal Link */}
          <button
            onClick={() => onNavigate('instructions')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
              currentView === 'instructions' || currentView === 'exam'
                ? 'bg-blue-600 text-white shadow-xs font-bold'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <GraduationCap className="w-4 h-4" />
            <span>Test Portal</span>
          </button>

          {/* ADMIN-ONLY NAVIGATION CONTROLS */}
          {isAdmin ? (
            <>
              {/* Leaderboard Link for Admin */}
              <button
                onClick={() => onNavigate('leaderboard')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                  currentView === 'leaderboard'
                    ? 'bg-amber-600 text-white shadow-xs font-bold'
                    : 'text-amber-700 bg-amber-50/80 hover:bg-amber-100 border border-amber-200'
                }`}
              >
                <Trophy className="w-4 h-4 text-amber-600" />
                <span className="hidden sm:inline">Leaderboard</span>
              </button>

              {/* Faculty / Submissions Roster */}
              <button
                onClick={() => onNavigate('faculty')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                  currentView === 'faculty' || currentView === 'result'
                    ? 'bg-indigo-600 text-white shadow-xs font-bold'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <LayoutDashboard className="w-4 h-4 text-indigo-600" />
                <span className="hidden sm:inline">Submissions Roster</span>
                <span className="sm:hidden">Roster</span>
              </button>

              {/* Admin: Edit Questions & Test Settings */}
              {onOpenQuestionManager && (
                <button
                  onClick={onOpenQuestionManager}
                  className="px-3 py-1.5 rounded-lg text-xs font-bold bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-800 transition-colors flex items-center gap-1.5"
                  title="Edit questions, options, test duration & settings"
                >
                  <Sliders className="w-4 h-4 text-blue-600" />
                  <span className="hidden md:inline">Edit Questions</span>
                </button>
              )}

              {/* Admin Badge */}
              <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11px] font-bold">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>Admin: smsnqt26</span>
              </div>

              {/* Admin Logout */}
              <button
                onClick={onLogoutAdmin}
                className="px-3 py-1.5 rounded-lg text-xs font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 flex items-center gap-1.5 transition-colors"
                title="Log out of Admin session"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Logout</span>
              </button>
            </>
          ) : (
            /* NON-ADMIN / STUDENT VIEW: Strictly show Admin Login button only */
            <button
              onClick={onOpenAdminLogin}
              className="px-3.5 py-1.5 rounded-lg text-xs font-bold bg-slate-100 hover:bg-blue-50 hover:border-blue-300 hover:text-blue-700 border border-slate-300 text-slate-700 flex items-center gap-1.5 shadow-2xs transition-all active:scale-95"
              title="Faculty & Admin Login (Username: smsnqt26)"
            >
              <Lock className="w-3.5 h-3.5 text-blue-600" />
              <span>Admin Login</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
