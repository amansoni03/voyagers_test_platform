import React from 'react';
import { SubmissionRecord } from '../types';
import { SmsLogo } from './SmsLogo';
import { 
  CheckCircle2, 
  ShieldCheck, 
  Mail, 
  Calendar, 
  User, 
  Hash, 
  GraduationCap, 
  Building2, 
  ArrowLeft,
  Lock,
  ExternalLink
} from 'lucide-react';

interface SubmissionThankYouProps {
  submission: SubmissionRecord;
  onReturnToHome: () => void;
  onOpenAdminLogin?: () => void;
  targetEmail?: string;
}

export const SubmissionThankYou: React.FC<SubmissionThankYouProps> = ({
  submission,
  onReturnToHome,
  onOpenAdminLogin,
  targetEmail = 'singhrishabh06116@gmail.com',
}) => {
  return (
    <div className="max-w-3xl mx-auto px-4 py-12 animate-in fade-in duration-300 text-slate-800">
      <div className="bg-white border border-slate-200 rounded-3xl shadow-xl overflow-hidden">
        {/* Top Header Decorative Banner */}
        <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 p-8 text-white text-center relative">
          <div className="flex justify-center mb-4">
            <div className="p-2.5 bg-white rounded-2xl shadow-md border border-white/30 inline-block">
              <SmsLogo size="lg" />
            </div>
          </div>
          <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-white/15 text-amber-300 border border-white/20 text-xs font-bold uppercase tracking-wider mb-2">
            School of Management Sciences, Lucknow
          </div>
          <h1 className="text-2xl md:text-3xl font-black tracking-tight text-white">
            TCS NQT Assessment Submitted
          </h1>
          <p className="text-blue-100 text-xs md:text-sm mt-1 max-w-xl mx-auto">
            Autonomous Recruitment Assessment & Proctoring System
          </p>
        </div>

        {/* Main Body */}
        <div className="p-6 md:p-10 space-y-8">
          {/* Success Checkmark & Thanks Heading */}
          <div className="text-center space-y-3">
            <div className="inline-flex p-4 bg-emerald-50 text-emerald-600 rounded-full border-4 border-emerald-100 shadow-sm animate-bounce">
              <CheckCircle2 className="w-12 h-12" />
            </div>
            <h2 className="text-2xl md:text-3xl font-black text-slate-900">
              Thank You, {submission.student.name}!
            </h2>
            <p className="text-slate-600 text-sm max-w-lg mx-auto leading-relaxed">
              Your test has been successfully submitted and permanently recorded. Your answers and multi-language programming solutions have been captured in the institutional database.
            </p>
          </div>

          {/* Automatic Dispatch Confirmation Box */}
          <div className="p-4 bg-emerald-50/80 border border-emerald-200 rounded-2xl flex items-start gap-3.5">
            <div className="p-2 bg-emerald-100 rounded-xl text-emerald-700 shrink-0 mt-0.5">
              <Mail className="w-5 h-5" />
            </div>
            <div className="text-xs space-y-1">
              <div className="font-bold text-emerald-950 text-sm flex items-center gap-2">
                <span>Scorecard Automatically Sent to Faculty</span>
                <span className="px-2 py-0.5 bg-emerald-200 text-emerald-900 rounded-md font-mono text-[10px] uppercase font-bold">
                  Sent
                </span>
              </div>
              <p className="text-emerald-800 leading-relaxed">
                Your full evaluation report, code logic scores, and anti-cheating audit trail have been automatically delivered to the examination committee at <strong>{targetEmail}</strong>.
              </p>
            </div>
          </div>

          {/* Official Candidate Submission Receipt */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-700 uppercase tracking-wider">
                <ShieldCheck className="w-4 h-4 text-blue-600" />
                <span>Official Candidate Submission Receipt</span>
              </div>
              <span className="font-mono text-xs font-bold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-200">
                {submission.id}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white rounded-lg border border-slate-200 text-slate-500">
                  <User className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 block uppercase font-bold">Candidate Name</span>
                  <span className="font-bold text-slate-900 text-sm">{submission.student.name}</span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="p-2 bg-white rounded-lg border border-slate-200 text-slate-500">
                  <Hash className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 block uppercase font-bold">Roll Number</span>
                  <span className="font-mono font-bold text-slate-900 text-sm">{submission.student.rollNo}</span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="p-2 bg-white rounded-lg border border-slate-200 text-slate-500">
                  <GraduationCap className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 block uppercase font-bold">Branch & Batch</span>
                  <span className="font-semibold text-slate-800">{submission.student.branch}</span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="p-2 bg-white rounded-lg border border-slate-200 text-slate-500">
                  <Calendar className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 block uppercase font-bold">Submission Timestamp</span>
                  <span className="font-medium text-slate-700">
                    {new Date(submission.createdAt).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-[11px] text-slate-500">
              <span>Institution: {submission.student.college}</span>
              <span className="text-emerald-700 font-bold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                Record Verified & Sealed
              </span>
            </div>
          </div>

          {/* Privacy & Instructions Notice */}
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl text-xs text-slate-600 space-y-1.5 leading-relaxed">
            <div className="font-bold text-slate-800 flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-blue-600" />
              <span>Confidentiality & Result Publication</span>
            </div>
            <p className="text-[11px]">
              In accordance with institution examination protocols, individual scorecards, answer keys, and rankings are accessible exclusively by authorized faculty administrators. You may now close this window safely.
            </p>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-100">
            <button
              onClick={onReturnToHome}
              className="w-full sm:w-auto px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-black text-xs rounded-xl shadow-md flex items-center justify-center gap-2 transition-all active:scale-95"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Return to Test Portal Home</span>
            </button>

            {onOpenAdminLogin && (
              <button
                onClick={onOpenAdminLogin}
                className="text-xs text-slate-500 hover:text-blue-700 hover:underline flex items-center gap-1.5 font-medium py-2"
              >
                <Lock className="w-3.5 h-3.5" />
                <span>Faculty / Admin Access</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
