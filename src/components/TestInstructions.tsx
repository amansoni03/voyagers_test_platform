import React, { useState } from 'react';
import { StudentProfile } from '../types';
import { TCS_SECTIONS } from '../data/tcsQuestions';
import { SmsLogo } from './SmsLogo';
import { 
  ShieldCheck, 
  ShieldAlert,
  Maximize2, 
  AlertTriangle, 
  BookOpen, 
  CheckCircle2, 
  User, 
  Mail, 
  Award, 
  ArrowRight, 
  Clock, 
  FileSpreadsheet,
  Lock,
  Cpu
} from 'lucide-react';

interface TestInstructionsProps {
  onStartExam: (profile: StudentProfile, acceleratedTime: boolean) => void;
  defaultEmail?: string;
  onOpenQuestionManager?: () => void;
}

export const TestInstructions: React.FC<TestInstructionsProps> = ({
  onStartExam,
  defaultEmail = 'singhrishabh06116@gmail.com',
  onOpenQuestionManager,
}) => {
  const [profile, setProfile] = useState<StudentProfile>({
    name: 'Aarav Sharma',
    rollNo: '2104230100045',
    branch: 'Computer Science & Engineering (CSE)',
    year: '4th Year (2026 Batch)',
    email: 'aarav.sharma@smslucknow.ac.in',
    college: 'School of Management Sciences, Lucknow',
    instructorEmail: defaultEmail,
    googleSheetsWebhookUrl: '',
  });

  const [acceleratedTime, setAcceleratedTime] = useState(false);
  const [hasAgreed, setHasAgreed] = useState(false);
  const [isCalibrating, setIsCalibrating] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!hasAgreed) {
      alert('Please agree to the Mandatory Fullscreen Lock & Examination Rules to proceed.');
      return;
    }
    setIsCalibrating(true);
    setTimeout(() => {
      setIsCalibrating(false);
      onStartExam(profile, acceleratedTime);
    }, 600);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-8 animate-in fade-in duration-300 text-slate-800">
      {/* College Banner Hero in Crisp Light Academic Theme */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 rounded-3xl p-6 md:p-8 shadow-xl text-white relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="p-2.5 bg-white rounded-2xl shadow-md shrink-0 border border-white/30">
              <SmsLogo size="lg" />
            </div>

            <div className="space-y-1.5">
              <div className="inline-flex items-center gap-2 px-3 py-0.5 rounded-full bg-white/15 text-amber-300 border border-white/20 text-xs font-bold uppercase tracking-wider">
                <Award className="w-3.5 h-3.5 text-amber-400" />
                School of Management Sciences Lucknow • Dept of CSE
              </div>
              <h2 className="text-2xl md:text-3xl font-black tracking-tight text-white">
                TCS NQT 2025-26 Mock Assessment Portal
              </h2>
              <p className="text-blue-100 text-xs md:text-sm max-w-2xl leading-relaxed">
                Autonomous diagnostic examination equipped with <strong>AI-Powered Proctoring</strong>, <strong>Full Browser Lockdown</strong>, and <strong>Multi-Language Code Logic Evaluation</strong> with automated score dispatch to faculty.
              </p>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-4 text-xs space-y-2 shrink-0 w-full md:w-64">
            <div className="flex items-center gap-2 text-amber-300 font-bold text-[11px] uppercase tracking-wider">
              <ShieldCheck className="w-4 h-4" />
              <span>Assessment Protocol</span>
            </div>
            <div className="text-white font-medium text-xs space-y-1">
              <div>• 75 Minutes Duration</div>
              <div>• 15 Diagnostic Questions</div>
              <div>• Fullscreen Lockdown Active</div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid: Registration & Instructions in Clean Light Theme */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Candidate Registration Form */}
        <div className="lg:col-span-5 bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-5">
          <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <User className="w-4 h-4 text-blue-600" />
                Candidate Hall Ticket Verification
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Confirm your student credentials before launching the exam.
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div>
              <label className="block text-slate-700 font-bold mb-1">Student Full Name</label>
              <input
                type="text"
                required
                value={profile.name}
                onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                placeholder="e.g. Aarav Sharma"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-700 font-bold mb-1">AKTU / SMS Roll No.</label>
                <input
                  type="text"
                  required
                  value={profile.rollNo}
                  onChange={(e) => setProfile({ ...profile, rollNo: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                  placeholder="2104230100..."
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Academic Year</label>
                <select
                  value={profile.year}
                  onChange={(e) => setProfile({ ...profile, year: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="4th Year (2026 Batch)">4th Year (Final Year)</option>
                  <option value="3rd Year (2027 Batch)">3rd Year (Pre-Final)</option>
                  <option value="2nd Year (2028 Batch)">2nd Year</option>
                  <option value="MCA 2nd Year">MCA 2nd Year</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-slate-700 font-bold mb-1">Engineering Branch / Dept</label>
              <select
                value={profile.branch}
                onChange={(e) => setProfile({ ...profile, branch: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
              >
                <option value="Computer Science & Engineering (CSE)">Computer Science & Engineering (CSE)</option>
                <option value="Information Technology (IT)">Information Technology (IT)</option>
                <option value="CSE (Artificial Intelligence & ML)">CSE (Artificial Intelligence & ML)</option>
                <option value="Electronics & Communication (ECE)">Electronics & Communication (ECE)</option>
                <option value="Mechanical Engineering (ME)">Mechanical Engineering (ME)</option>
                <option value="Civil Engineering (CE)">Civil Engineering (CE)</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-700 font-bold mb-1">College Email Address</label>
              <input
                type="email"
                required
                value={profile.email}
                onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* AUTOMATIC RESULT DISPATCH BADGE (NO STUDENT EDITING OPTION) */}
            <div className="p-3.5 bg-blue-50 border border-blue-200 rounded-xl space-y-1">
              <div className="flex items-center gap-1.5 text-blue-900 font-bold text-xs">
                <Lock className="w-3.5 h-3.5 text-blue-700" />
                <span>Automated Result Dispatch Verified</span>
              </div>
              <p className="text-[11px] text-blue-800 leading-relaxed">
                Upon submitting your test, your verified scorecard and AI proctoring integrity log will be <strong>automatically transmitted directly to the Examination Cell at {defaultEmail}</strong>.
              </p>
            </div>

            {/* Accelerated Timer Mode for Demo */}
            <div className="flex items-center justify-between p-3 bg-slate-50 border border-slate-200 rounded-xl">
              <div className="space-y-0.5">
                <span className="font-bold text-slate-800 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-blue-600" />
                  Fast Practice Mode (Accelerated Timer)
                </span>
                <p className="text-[10px] text-slate-500">
                  Runs with a compact 20-minute countdown for swift assessment practice.
                </p>
              </div>
              <input
                type="checkbox"
                checked={acceleratedTime}
                onChange={(e) => setAcceleratedTime(e.target.checked)}
                className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-slate-300 cursor-pointer"
              />
            </div>

            {/* Declaration Checkbox */}
            <label className="flex items-start gap-2.5 p-3 bg-slate-50 border border-slate-200 rounded-xl cursor-pointer">
              <input
                type="checkbox"
                required
                checked={hasAgreed}
                onChange={(e) => setHasAgreed(e.target.checked)}
                className="mt-0.5 w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-slate-300 cursor-pointer"
              />
              <span className="text-[11px] text-slate-600 leading-normal">
                I hereby declare that I will take this examination in strict compliance with the SMS Lucknow Honor Code. I agree to the mandatory fullscreen lock and browser lockdown security until my final test submission.
              </span>
            </label>

            <button
              type="submit"
              disabled={isCalibrating || !hasAgreed}
              className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 active:scale-98 text-white font-black text-sm rounded-xl shadow-md flex items-center justify-center gap-2 transition-all disabled:opacity-50"
            >
              {isCalibrating ? (
                <>Locking Screen & Launching Exam...</>
              ) : (
                <>
                  <Maximize2 className="w-4 h-4" />
                  <span>Launch Exam (Mandatory Fullscreen Lock)</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        </div>

        {/* Right Column: Pattern & Anti-Cheating Protocol */}
        <div className="lg:col-span-7 space-y-6">
          {/* Sectional Blueprint in Light Style */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-blue-600" />
                TCS NQT 2025-26 Sectional Structure
              </h3>
              <span className="text-xs text-blue-600 font-bold bg-blue-50 px-2.5 py-1 rounded-full border border-blue-200">
                Total Marks: 155
              </span>
            </div>

            <div className="space-y-2.5">
              {TCS_SECTIONS.map((sec, idx) => (
                <div
                  key={sec.id}
                  className="p-3 bg-slate-50 border border-slate-200/80 rounded-xl flex items-center justify-between text-xs hover:bg-slate-100/70 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-lg bg-blue-600 text-white font-black flex items-center justify-center text-[11px]">
                      {idx + 1}
                    </span>
                    <div>
                      <div className="font-bold text-slate-900">{sec.title}</div>
                      <div className="text-[11px] text-slate-500">{sec.description}</div>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <div className="font-mono font-bold text-blue-700">{sec.totalMarks} Marks</div>
                    <div className="text-[10px] text-slate-500">{sec.durationMinutes} Mins</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Anti-Cheating & AI Proctoring Protocol Card in Light Theme */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-rose-600" />
              Anti-Cheating & AI Proctoring Safeguards
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
              <div className="p-3 bg-blue-50/70 border border-blue-200 rounded-xl space-y-1">
                <div className="font-bold text-blue-900 flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-blue-600" />
                  Mandatory Fullscreen Lockdown
                </div>
                <p className="text-[11px] text-blue-800">
                  Once launched, your screen is locked into fullscreen. Exiting is blocked until your final submission; attempts freeze the exam interface.
                </p>
              </div>

              <div className="p-3 bg-indigo-50/70 border border-indigo-200 rounded-xl space-y-1">
                <div className="font-bold text-indigo-900 flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-indigo-600" />
                  Tab Switching & Multi-Window Lock
                </div>
                <p className="text-[11px] text-indigo-800">
                  Navigating to other browser tabs, losing window focus, or minimizing the window automatically logs high-severity security incidents.
                </p>
              </div>

              <div className="p-3 bg-rose-50/60 border border-rose-200 rounded-xl space-y-1">
                <div className="font-bold text-rose-900 flex items-center gap-1.5">
                  <ShieldAlert className="w-3.5 h-3.5 text-rose-600" />
                  DevTools & Shortcut Interception
                </div>
                <p className="text-[11px] text-rose-800">
                  Developer tools (F12, Inspect Element), page source shortcuts (Ctrl+U), and context menu clicks are blocked and flagged.
                </p>
              </div>

              <div className="p-3 bg-rose-50/60 border border-rose-200 rounded-xl space-y-1">
                <div className="font-bold text-rose-900 flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                  Clipboard & Copy-Paste Blocker
                </div>
                <p className="text-[11px] text-rose-800">
                  Copying question text or pasting external code from unauthorized sources is intercepted and recorded in the integrity audit log.
                </p>
              </div>
            </div>

            {/* AI Logic Marking Promise */}
            <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs space-y-1">
              <div className="font-bold text-emerald-900 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                Fair AI Logic Evaluation Policy
              </div>
              <p className="text-[11px] text-emerald-800 leading-relaxed">
                <strong>You may code in Python, C, C++, Java, or JavaScript.</strong> Normal syntax mistakes (missing semicolon, minor print formatting differences) will be LENIENTLY IGNORED! If your algorithmic logic is sound, you will be awarded high marks.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
