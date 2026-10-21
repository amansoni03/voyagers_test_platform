import React, { useState, useEffect } from 'react';
import { Question, SectionId } from '../types';
import { TCS_SECTIONS } from '../data/tcsQuestions';
import { 
  X, 
  Plus, 
  Trash2, 
  Edit3, 
  Save, 
  RotateCcw, 
  Check, 
  AlertCircle, 
  Sliders, 
  HelpCircle, 
  Code2, 
  CheckCircle2, 
  BookOpen, 
  Clock, 
  Mail,
  Sparkles
} from 'lucide-react';

interface QuestionManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  questions: Question[];
  onSaveQuestions: (updatedQuestions: Question[]) => void;
  onResetQuestions: () => void;
}

export const QuestionManagerModal: React.FC<QuestionManagerModalProps> = ({
  isOpen,
  onClose,
  questions,
  onSaveQuestions,
  onResetQuestions,
}) => {
  const [activeSection, setActiveSection] = useState<SectionId>('numerical');
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [saveStatus, setSaveStatus] = useState<string | null>(null);

  // Test Settings State
  const [activeTab, setActiveTab] = useState<'questions' | 'settings'>('questions');
  const [settings, setSettings] = useState({
    testTitle: 'SMS Lucknow TCS NQT Mock Test 2025-26',
    durationMinutes: 120,
    digitalCutoff: 70,
    ninjaCutoff: 45,
    instructorEmail: 'singhrishabh06116@gmail.com',
  });

  useEffect(() => {
    // 1. Load cached settings from localStorage first
    try {
      const cached = localStorage.getItem('sms_test_settings');
      if (cached) {
        const parsed = JSON.parse(cached);
        if (parsed && typeof parsed === 'object') {
          setSettings(prev => ({ ...prev, ...parsed }));
        }
      }
    } catch {}

    // 2. Fetch settings from server
    fetch('/api/test-settings')
      .then(res => {
        if (!res.ok) throw new Error('Not ok');
        const ct = res.headers.get('content-type') || '';
        if (!ct.includes('application/json')) throw new Error('Not JSON');
        return res.json();
      })
      .then(data => {
        if (data && typeof data === 'object') {
          setSettings(prev => ({ ...prev, ...data }));
          try {
            localStorage.setItem('sms_test_settings', JSON.stringify(data));
          } catch {}
        }
      })
      .catch(() => {});
  }, []);

  if (!isOpen) return null;

  const sectionQuestions = questions.filter(q => q.sectionId === activeSection);

  const handleStartEdit = (q: Question) => {
    setIsAddingNew(false);
    setEditingQuestion(JSON.parse(JSON.stringify(q)));
  };

  const handleStartAddNew = () => {
    const isCoding = activeSection === 'coding';
    const newQ: Question = {
      id: `q_${activeSection}_${Date.now()}`,
      sectionId: activeSection,
      title: isCoding ? 'New Algorithmic Challenge' : 'New Multiple Choice Question',
      questionText: isCoding 
        ? 'Problem Statement: Given an array of integers...' 
        : 'Enter question text here...',
      marks: isCoding ? 30 : 5,
      topic: isCoding ? 'Dynamic Programming & Algorithms' : 'Core Aptitude',
      explanation: 'Detailed solution step by step...',
      options: isCoding ? undefined : [
        { id: 'a', text: 'Option A' },
        { id: 'b', text: 'Option B' },
        { id: 'c', text: 'Option C' },
        { id: 'd', text: 'Option D' },
      ],
      correctOptionId: isCoding ? undefined : 'a',
      sampleInput: isCoding ? '5\n1 2 3 4 5' : undefined,
      sampleExpectedOutput: isCoding ? '15' : undefined,
      constraints: isCoding ? ['1 <= N <= 10^5', 'Time Complexity: O(N)'] : undefined,
      starterTemplates: isCoding ? {
        python: `# Python solution\ndef solve():\n    pass\n`,
        cpp: `// C++ solution\n#include <iostream>\nusing namespace std;\nint main() {\n    return 0;\n}\n`,
        java: `// Java solution\nimport java.util.*;\npublic class Solution {\n    public static void main(String[] args) {}\n}\n`
      } : undefined,
    };
    setIsAddingNew(true);
    setEditingQuestion(newQ);
  };

  const handleSaveCurrentQuestion = async () => {
    if (!editingQuestion) return;

    let updatedList: Question[] = [];
    if (isAddingNew) {
      updatedList = [...questions, editingQuestion];
    } else {
      updatedList = questions.map(q => q.id === editingQuestion.id ? editingQuestion : q);
    }

    onSaveQuestions(updatedList);
    try {
      localStorage.setItem('sms_custom_questions', JSON.stringify(updatedList));
    } catch {}

    // Save full list to server
    try {
      const res = await fetch('/api/questions-all', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ questions: updatedList }),
      });
      if (res.ok) {
        setSaveStatus('Questions saved and synchronized successfully!');
      } else {
        setSaveStatus('Saved locally in browser storage!');
      }
    } catch {
      setSaveStatus('Saved locally in browser storage!');
    }

    setEditingQuestion(null);
    setIsAddingNew(false);
    setTimeout(() => setSaveStatus(null), 3000);
  };

  const handleDeleteQuestion = async (id: string) => {
    if (!confirm('Are you sure you want to delete this question from the test?')) return;

    const updatedList = questions.filter(q => q.id !== id);
    onSaveQuestions(updatedList);
    try {
      localStorage.setItem('sms_custom_questions', JSON.stringify(updatedList));
    } catch {}

    try {
      await fetch('/api/questions-all', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ questions: updatedList }),
      });
    } catch {}

    try {
      await fetch(`/api/questions/${id}`, { method: 'DELETE' });
    } catch {}
  };

  const handleSaveSettings = async () => {
    try {
      localStorage.setItem('sms_test_settings', JSON.stringify(settings));
    } catch {}

    try {
      const res = await fetch('/api/test-settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });
      if (res.ok) {
        setSaveStatus('Test settings saved successfully!');
      } else {
        setSaveStatus('Test settings saved locally!');
      }
      setTimeout(() => setSaveStatus(null), 3000);
    } catch {
      setSaveStatus('Test settings saved locally!');
      setTimeout(() => setSaveStatus(null), 3000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white border border-slate-200 w-full max-w-5xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] text-slate-800">
        {/* Top Header */}
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-200 text-blue-700 flex items-center justify-center font-bold">
              <Sliders className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Examination Control & Question Bank Manager
              </h2>
              <p className="text-xs text-slate-500">
                School of Management Sciences Lucknow • Customize questions, options, test duration & cutoffs
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="p-2 hover:bg-slate-200 rounded-lg text-slate-400 hover:text-slate-700 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="px-6 border-b border-slate-200 bg-white flex items-center justify-between text-xs font-semibold">
          <div className="flex gap-2">
            <button
              onClick={() => { setActiveTab('questions'); setEditingQuestion(null); }}
              className={`py-3 px-4 border-b-2 flex items-center gap-2 transition-colors ${
                activeTab === 'questions'
                  ? 'border-blue-600 text-blue-600 font-bold'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <BookOpen className="w-4 h-4" />
              <span>Questions Bank ({questions.length} Questions)</span>
            </button>

            <button
              onClick={() => { setActiveTab('settings'); setEditingQuestion(null); }}
              className={`py-3 px-4 border-b-2 flex items-center gap-2 transition-colors ${
                activeTab === 'settings'
                  ? 'border-blue-600 text-blue-600 font-bold'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <Clock className="w-4 h-4" />
              <span>Test Timing & Automatic Email Settings</span>
            </button>
          </div>

          <button
            onClick={() => {
              if (confirm('Reset question bank back to default TCS NQT questions?')) {
                onResetQuestions();
                setEditingQuestion(null);
                setSaveStatus('Reset to official TCS NQT questions!');
                setTimeout(() => setSaveStatus(null), 3000);
              }
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset to Default TCS NQT Questions</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6">
          {saveStatus && (
            <div className="mb-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2 font-medium">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{saveStatus}</span>
            </div>
          )}

          {activeTab === 'settings' ? (
            /* Test Configuration Settings Panel */
            <div className="max-w-2xl mx-auto space-y-5 text-xs">
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl space-y-1">
                <h4 className="font-bold text-blue-900 text-sm">Automated Result Dispatch</h4>
                <p className="text-blue-700">
                  Whenever any student submits the TCS NQT mock assessment, their full score report, code logic marks, and proctoring audit are automatically delivered to the email address below without requiring any manual student action.
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Default Scorecard Delivery Email (Your Gmail)</label>
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-slate-400" />
                    <input
                      type="email"
                      value={settings.instructorEmail}
                      onChange={(e) => setSettings({ ...settings, instructorEmail: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-800 font-mono text-xs focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </div>
                  <span className="text-[11px] text-slate-500 mt-0.5 block">
                    All student test results will automatically route directly to this Gmail ID.
                  </span>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Exam Title</label>
                  <input
                    type="text"
                    value={settings.testTitle}
                    onChange={(e) => setSettings({ ...settings, testTitle: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-800 text-xs focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Test Duration (Minutes)</label>
                    <input
                      type="number"
                      value={settings.durationMinutes}
                      onChange={(e) => setSettings({ ...settings, durationMinutes: Number(e.target.value) })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-800 text-xs focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">TCS Digital Cutoff (%)</label>
                    <input
                      type="number"
                      value={settings.digitalCutoff}
                      onChange={(e) => setSettings({ ...settings, digitalCutoff: Number(e.target.value) })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-800 text-xs focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </div>
                </div>

                <button
                  onClick={handleSaveSettings}
                  className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md transition-colors flex items-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  <span>Save Test Settings</span>
                </button>
              </div>
            </div>
          ) : editingQuestion ? (
            /* Question Edit Form */
            <div className="space-y-4 text-xs">
              <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                <h3 className="text-sm font-bold text-slate-900">
                  {isAddingNew ? 'Add New Question' : `Edit Question: ${editingQuestion.title}`}
                </h3>
                <button
                  onClick={() => setEditingQuestion(null)}
                  className="text-xs text-slate-500 hover:text-slate-800"
                >
                  Cancel
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Question Title</label>
                  <input
                    type="text"
                    value={editingQuestion.title}
                    onChange={(e) => setEditingQuestion({ ...editingQuestion, title: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-800 outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Topic / Category</label>
                    <input
                      type="text"
                      value={editingQuestion.topic}
                      onChange={(e) => setEditingQuestion({ ...editingQuestion, topic: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-800 outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Marks</label>
                    <input
                      type="number"
                      value={editingQuestion.marks}
                      onChange={(e) => setEditingQuestion({ ...editingQuestion, marks: Number(e.target.value) })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-800 outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Question Description / Problem Statement</label>
                <textarea
                  rows={5}
                  value={editingQuestion.questionText}
                  onChange={(e) => setEditingQuestion({ ...editingQuestion, questionText: e.target.value })}
                  className="w-full p-3 bg-slate-50 border border-slate-300 rounded-lg text-slate-800 outline-none focus:ring-2 focus:ring-blue-500 font-mono text-xs leading-relaxed"
                />
              </div>

              {/* Options for MCQ */}
              {editingQuestion.sectionId !== 'coding' && editingQuestion.options && (
                <div className="space-y-3 pt-2 border-t border-slate-200">
                  <label className="block font-bold text-slate-700">Answer Options & Correct Key</label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {editingQuestion.options.map((opt, idx) => (
                      <div key={opt.id} className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1.5">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-slate-700 uppercase">Option {opt.id}</span>
                          <label className="flex items-center gap-1.5 cursor-pointer text-[11px] font-bold text-emerald-700">
                            <input
                              type="radio"
                              name="correctOption"
                              checked={editingQuestion.correctOptionId === opt.id}
                              onChange={() => setEditingQuestion({ ...editingQuestion, correctOptionId: opt.id })}
                            />
                            <span>Correct Answer</span>
                          </label>
                        </div>
                        <input
                          type="text"
                          value={opt.text}
                          onChange={(e) => {
                            const newOptions = [...editingQuestion.options!];
                            newOptions[idx].text = e.target.value;
                            setEditingQuestion({ ...editingQuestion, options: newOptions });
                          }}
                          className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-md text-xs"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Coding Specific Fields */}
              {editingQuestion.sectionId === 'coding' && (
                <div className="space-y-5 pt-2 border-t border-slate-200">

                  {/* Sample I/O */}
                  <div className="space-y-2">
                    <label className="block font-bold text-slate-700">Sample Test Cases</label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <span className="text-[11px] font-bold text-slate-600 block mb-1">Sample Input</span>
                        <textarea
                          rows={3}
                          value={editingQuestion.sampleInput || ''}
                          onChange={(e) => setEditingQuestion({ ...editingQuestion, sampleInput: e.target.value })}
                          className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg font-mono text-xs"
                          placeholder={`e.g.\n5\n1 2 3 4 5`}
                        />
                      </div>
                      <div>
                        <span className="text-[11px] font-bold text-slate-600 block mb-1">Sample Expected Output</span>
                        <textarea
                          rows={3}
                          value={editingQuestion.sampleExpectedOutput || ''}
                          onChange={(e) => {
                            const newExpected = e.target.value;
                            const currentCases = editingQuestion.testCases ? [...editingQuestion.testCases] : [];
                            if (currentCases.length > 0) {
                              currentCases[0] = { ...currentCases[0], expected: newExpected };
                            }
                            setEditingQuestion({ 
                              ...editingQuestion, 
                              sampleExpectedOutput: newExpected,
                              testCases: currentCases.length > 0 ? currentCases : undefined
                            });
                          }}
                          className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg font-mono text-xs"
                          placeholder="e.g. 15"
                        />
                        <span className="text-[10px] text-amber-700 font-semibold block mt-1">
                          ⚠️ Strict Output Check: If the student's output does not match this expected output, an Output Mismatch Error will be shown to the candidate.
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* ── All Test Cases & Expected Outputs ── */}
                  <div className="space-y-3 p-4 bg-slate-100/80 border border-slate-300 rounded-xl">
                    <div className="flex items-center justify-between">
                      <div>
                        <label className="block font-bold text-slate-800 text-xs">
                          Test Cases & Expected Outputs Evaluation Suite
                        </label>
                        <p className="text-[11px] text-slate-600 mt-0.5">
                          Every test case input is executed against the student's program and compared with its expected output.
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          const current = editingQuestion.testCases || [];
                          setEditingQuestion({
                            ...editingQuestion,
                            testCases: [
                              ...current,
                              { input: '', expected: '', hidden: false }
                            ],
                          });
                        }}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold transition-colors shrink-0 shadow-2xs"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        Add Test Case
                      </button>
                    </div>

                    {(!editingQuestion.testCases || editingQuestion.testCases.length === 0) ? (
                      <div className="py-3 text-center text-slate-500 text-[11px] border border-dashed border-slate-300 rounded-lg bg-white">
                        Using Sample Input & Sample Expected Output as the test case. Click "Add Test Case" to add more.
                      </div>
                    ) : (
                      <div className="space-y-2.5 mt-2">
                        {editingQuestion.testCases.map((tc, idx) => (
                          <div key={idx} className="p-3 bg-white border border-slate-200 rounded-xl space-y-2 shadow-2xs">
                            <div className="flex items-center justify-between border-b border-slate-100 pb-1.5">
                              <span className="font-bold text-xs text-slate-800">
                                Test Case #{idx + 1} {idx === 0 && <span className="text-blue-600 text-[10px] font-semibold">(Primary Sample Case)</span>}
                              </span>
                              <div className="flex items-center gap-2">
                                <label className="flex items-center gap-1 text-[11px] font-semibold text-slate-600 cursor-pointer">
                                  <input
                                    type="checkbox"
                                    checked={Boolean(tc.hidden)}
                                    onChange={(e) => {
                                      const updated = [...(editingQuestion.testCases || [])];
                                      updated[idx] = { ...updated[idx], hidden: e.target.checked };
                                      setEditingQuestion({ ...editingQuestion, testCases: updated });
                                    }}
                                    className="rounded border-slate-300"
                                  />
                                  <span>Hidden Case</span>
                                </label>
                                {editingQuestion.testCases!.length > 1 && (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      const updated = (editingQuestion.testCases || []).filter((_, i) => i !== idx);
                                      setEditingQuestion({ ...editingQuestion, testCases: updated });
                                    }}
                                    className="p-1 rounded-md text-rose-600 hover:bg-rose-50 transition-colors"
                                    title="Delete test case"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                )}
                              </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
                              <div>
                                <span className="text-[10px] font-bold text-slate-500 block mb-0.5">Input (stdin):</span>
                                <textarea
                                  rows={2}
                                  value={tc.input}
                                  onChange={(e) => {
                                    const updated = [...(editingQuestion.testCases || [])];
                                    updated[idx] = { ...updated[idx], input: e.target.value };
                                    if (idx === 0) {
                                      setEditingQuestion({ ...editingQuestion, testCases: updated, sampleInput: e.target.value });
                                    } else {
                                      setEditingQuestion({ ...editingQuestion, testCases: updated });
                                    }
                                  }}
                                  placeholder="Input data passed to stdin"
                                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg font-mono text-xs"
                                />
                              </div>
                              <div>
                                <span className="text-[10px] font-bold text-slate-500 block mb-0.5">Expected Output (stdout):</span>
                                <textarea
                                  rows={2}
                                  value={tc.expected}
                                  onChange={(e) => {
                                    const updated = [...(editingQuestion.testCases || [])];
                                    updated[idx] = { ...updated[idx], expected: e.target.value };
                                    if (idx === 0) {
                                      setEditingQuestion({ ...editingQuestion, testCases: updated, sampleExpectedOutput: e.target.value });
                                    } else {
                                      setEditingQuestion({ ...editingQuestion, testCases: updated });
                                    }
                                  }}
                                  placeholder="Expected exact stdout"
                                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg font-mono text-xs text-emerald-800 font-bold"
                                />
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* ── Constraints Editor ── */}
                  <div className="space-y-2 p-4 bg-indigo-50 border border-indigo-200 rounded-xl">
                    <div className="flex items-center justify-between">
                      <div>
                        <label className="block font-bold text-indigo-900 text-xs">
                          Problem Constraints
                        </label>
                        <p className="text-[11px] text-indigo-600 mt-0.5">
                          These lines are shown to the candidate inside the problem statement panel during the exam.
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          const current = editingQuestion.constraints || [];
                          setEditingQuestion({
                            ...editingQuestion,
                            constraints: [...current, ''],
                          });
                        }}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-[11px] font-bold transition-colors shrink-0"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        Add Constraint
                      </button>
                    </div>

                    {/* Constraint Lines */}
                    {(!editingQuestion.constraints || editingQuestion.constraints.length === 0) ? (
                      <div className="py-4 text-center text-indigo-400 text-[11px] border border-dashed border-indigo-300 rounded-lg bg-white/60">
                        No constraints added yet. Click "Add Constraint" to add one.
                      </div>
                    ) : (
                      <div className="space-y-2 mt-1">
                        {editingQuestion.constraints.map((c, idx) => (
                          <div key={idx} className="flex items-center gap-2">
                            <span className="text-[10px] font-bold text-indigo-500 w-5 shrink-0 text-right">
                              {idx + 1}.
                            </span>
                            <input
                              type="text"
                              value={c}
                              onChange={(e) => {
                                const updated = [...(editingQuestion.constraints || [])];
                                updated[idx] = e.target.value;
                                setEditingQuestion({ ...editingQuestion, constraints: updated });
                              }}
                              placeholder={
                                idx === 0 ? 'e.g.  1 ≤ N ≤ 10^5' :
                                idx === 1 ? 'e.g.  -10^4 ≤ Array[i] ≤ 10^4' :
                                idx === 2 ? 'e.g.  Time Complexity Target: O(N)' :
                                'e.g.  Auxiliary Space: O(1)'
                              }
                              className="flex-1 px-3 py-1.5 bg-white border border-indigo-200 rounded-lg font-mono text-xs text-slate-800 outline-none focus:ring-2 focus:ring-indigo-400"
                            />
                            <button
                              type="button"
                              onClick={() => {
                                const updated = (editingQuestion.constraints || []).filter((_, i) => i !== idx);
                                setEditingQuestion({ ...editingQuestion, constraints: updated });
                              }}
                              className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 transition-colors shrink-0"
                              title="Remove this constraint"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Live Preview */}
                    {editingQuestion.constraints && editingQuestion.constraints.some(c => c.trim()) && (
                      <div className="mt-3 p-3 bg-white border border-indigo-200 rounded-lg">
                        <span className="text-[10px] font-bold text-indigo-500 uppercase tracking-wider block mb-1.5">
                          Preview — as shown to candidate:
                        </span>
                        <ul className="list-disc list-inside space-y-0.5 text-slate-700 font-mono text-[11px]">
                          {editingQuestion.constraints.filter(c => c.trim()).map((c, i) => (
                            <li key={i}>{c}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>

                </div>
              )}

              <div>
                <label className="block font-bold text-slate-700 mb-1">Explanation / Solution Steps</label>
                <textarea
                  rows={3}
                  value={editingQuestion.explanation || ''}
                  onChange={(e) => setEditingQuestion({ ...editingQuestion, explanation: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-800 text-xs"
                  placeholder="Explain why the answer is correct for the student result report..."
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setEditingQuestion(null)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSaveCurrentQuestion}
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg shadow-sm flex items-center gap-1.5"
                >
                  <Save className="w-4 h-4" />
                  <span>Save Question</span>
                </button>
              </div>
            </div>
          ) : (
            /* Questions List by Section */
            <div className="space-y-4">
              {/* Section Sub-tabs */}
              <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                <div className="flex items-center gap-1.5 overflow-x-auto">
                  {TCS_SECTIONS.map((sec) => (
                    <button
                      key={sec.id}
                      onClick={() => setActiveSection(sec.id)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                        activeSection === sec.id
                          ? 'bg-blue-600 text-white shadow-sm'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {sec.shortName} ({questions.filter(q => q.sectionId === sec.id).length})
                    </button>
                  ))}
                </div>

                <button
                  onClick={handleStartAddNew}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Question to {activeSection.toUpperCase()}</span>
                </button>
              </div>

              {/* Questions List */}
              <div className="space-y-3">
                {sectionQuestions.length === 0 ? (
                  <div className="p-8 text-center text-slate-400 bg-slate-50 rounded-xl border border-slate-200">
                    No questions in this section. Click "Add Question" above.
                  </div>
                ) : (
                  sectionQuestions.map((q, idx) => (
                    <div
                      key={q.id}
                      className="p-4 bg-white border border-slate-200 rounded-xl shadow-xs hover:border-slate-300 transition-colors flex items-start justify-between gap-4"
                    >
                      <div className="space-y-1.5 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="w-6 h-6 rounded-md bg-blue-100 text-blue-800 font-bold text-xs flex items-center justify-center">
                            {idx + 1}
                          </span>
                          <h4 className="font-bold text-slate-900 text-xs md:text-sm">{q.title}</h4>
                          <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-600 font-mono text-[10px]">
                            {q.marks} Marks
                          </span>
                          <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-700 text-[10px] font-medium">
                            {q.topic}
                          </span>
                        </div>
                        <p className="text-slate-600 text-xs line-clamp-2 pl-8">
                          {q.questionText}
                        </p>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0 pt-1">
                        <button
                          onClick={() => handleStartEdit(q)}
                          className="p-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 transition-colors"
                          title="Edit question text and answers"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteQuestion(q.id)}
                          className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 transition-colors"
                          title="Delete question"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
          <span>SMS Lucknow Examination Board Configuration</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold rounded-lg transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
