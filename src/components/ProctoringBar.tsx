import React, { useState } from 'react';
import { 
  ShieldCheck, 
  ShieldAlert, 
  Lock, 
  Maximize2, 
  AlertTriangle, 
  ChevronDown, 
  ChevronUp, 
  Laptop, 
  EyeOff, 
  CheckCircle2 
} from 'lucide-react';
import { ProctorViolation } from '../types';

interface ProctoringBarProps {
  integrityScore: number;
  violations: ProctorViolation[];
  onAddViolation: (violation: Omit<ProctorViolation, 'id' | 'timestamp'>) => void;
  isExamActive: boolean;
}

export const ProctoringBar: React.FC<ProctoringBarProps> = ({
  integrityScore,
  violations,
  isExamActive,
}) => {
  const [isMinimized, setIsMinimized] = useState(false);

  // Color according to integrity in Light Mode
  const getIntegrityColor = () => {
    if (integrityScore >= 85) return 'text-emerald-700 bg-emerald-50 border-emerald-200';
    if (integrityScore >= 60) return 'text-amber-700 bg-amber-50 border-amber-200';
    return 'text-rose-700 bg-rose-50 border-rose-200';
  };

  const latestViolation = violations[0];

  return (
    <>
      {/* Floating Browser Security & Exam Lockdown Badge (Zero Camera/Mic Prompt) */}
      <div className={`fixed bottom-4 right-4 z-40 transition-all duration-200 select-none ${
        isMinimized ? 'w-56' : 'w-72'
      }`}>
        <div className="bg-white/95 backdrop-blur-md border border-slate-200 rounded-2xl shadow-xl overflow-hidden text-slate-800">
          {/* Header */}
          <div className="px-3.5 py-2.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
              </span>
              <span className="text-xs font-bold text-slate-800 tracking-wide uppercase flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-blue-600" />
                Browser Screen Lock Active
              </span>
            </div>

            <button
              onClick={() => setIsMinimized(!isMinimized)}
              className="p-1 hover:bg-slate-200 rounded text-slate-500 hover:text-slate-800 transition-colors"
              title={isMinimized ? 'Expand Monitor' : 'Minimize Monitor'}
            >
              {isMinimized ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>
          </div>

          {!isMinimized ? (
            <div className="p-3 space-y-2.5">
              {/* Lockdown Status Card */}
              <div className="p-2.5 bg-blue-50/70 border border-blue-200 rounded-xl space-y-1 text-xs">
                <div className="flex items-center justify-between text-blue-900 font-bold">
                  <span className="flex items-center gap-1.5">
                    <Maximize2 className="w-3.5 h-3.5 text-blue-700" />
                    Fullscreen Locked
                  </span>
                  <span className="text-[10px] bg-blue-200/70 text-blue-800 px-1.5 py-0.5 rounded font-mono">
                    Mandatory
                  </span>
                </div>
                <p className="text-[11px] text-blue-700 leading-tight">
                  Exiting fullscreen is strictly disabled until your final test submission.
                </p>
              </div>

              {/* Real-time Integrity Trust Index */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className={`p-2.5 rounded-xl border flex flex-col items-center justify-center ${getIntegrityColor()}`}>
                  <span className="text-[10px] uppercase font-bold tracking-wider opacity-80">Trust Index</span>
                  <div className="text-lg font-black tracking-tight">{integrityScore}%</div>
                  <span className="text-[9px] opacity-75">
                    {integrityScore >= 80 ? 'High Integrity' : integrityScore >= 50 ? 'Audit Flagged' : 'Critical Strike'}
                  </span>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 flex flex-col justify-between">
                  <div className="flex items-center justify-between text-[10px] text-slate-600">
                    <span className="flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                      Security Guard
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-700 font-semibold mt-1">
                    Tabs & Window Lock
                  </div>
                  <span className="text-[9px] text-emerald-700 mt-0.5 font-medium flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                    Protected
                  </span>
                </div>
              </div>

              {/* Incidents Counter */}
              <div className="flex items-center justify-between px-2.5 py-1.5 rounded-lg bg-slate-50 text-[11px] text-slate-700 border border-slate-200">
                <span className="flex items-center gap-1.5">
                  <ShieldAlert className="w-3.5 h-3.5 text-amber-600" />
                  Lockdown Flags:
                </span>
                <span className={`font-bold px-1.5 py-0.2 rounded font-mono ${
                  violations.length > 0 ? 'bg-rose-100 text-rose-700' : 'bg-emerald-100 text-emerald-800'
                }`}>
                  {violations.length} incidents
                </span>
              </div>
            </div>
          ) : (
            <div className="p-2 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <div className={`px-2 py-0.5 rounded font-black text-xs ${getIntegrityColor()}`}>
                  {integrityScore}%
                </div>
                <span className="text-slate-600 text-[11px]">Flags: {violations.length}</span>
              </div>
              <span className="text-[10px] text-blue-700 font-mono font-bold flex items-center gap-1">
                <Lock className="w-3 h-3" />
                LOCKED
              </span>
            </div>
          )}
        </div>
      </div>
    </>
  );
};
