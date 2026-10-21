import React, { useState } from 'react';
import { 
  Play, 
  Sparkles, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  RefreshCw, 
  Terminal, 
  HelpCircle, 
  Code, 
  ShieldCheck, 
  Check, 
  ChevronRight,
  Layers
} from 'lucide-react';
import { Question, CodeEvaluationResult } from '../types';

interface CodeEditorSectionProps {
  question: Question;
  studentCode: string;
  selectedLanguage: string;
  onCodeChange: (code: string) => void;
  onLanguageChange: (lang: string) => void;
  evaluationResult?: CodeEvaluationResult;
  onEvaluationComplete: (result: CodeEvaluationResult) => void;
}

interface TestCaseResult {
  input: string;
  expected: string;
  actual: string;
  passed: boolean;
  error?: string;
  hidden?: boolean;
}

const SUPPORTED_LANGUAGES = [
  { id: 'python', label: 'Python 3', ext: '.py' },
  { id: 'cpp', label: 'C++ (g++ 17)', ext: '.cpp' },
  { id: 'c', label: 'C (gcc)', ext: '.c' },
  { id: 'java', label: 'Java (OpenJDK 17)', ext: '.java' },
  { id: 'javascript', label: 'JavaScript (Node.js)', ext: '.js' },
];

export const CodeEditorSection: React.FC<CodeEditorSectionProps> = ({
  question,
  studentCode,
  selectedLanguage,
  onCodeChange,
  onLanguageChange,
  evaluationResult,
  onEvaluationComplete,
}) => {
  const [customInput, setCustomInput] = useState(question.sampleInput || '');
  const [customOutput, setCustomOutput] = useState<string | null>(null);
  const [isExecuting, setIsExecuting] = useState(false);
  const [isEvaluatingAi, setIsEvaluatingAi] = useState(false);
  const [activeTab, setActiveTab] = useState<'editor' | 'testcases' | 'aiReport'>('editor');
  
  // Real test runner state
  const [testResults, setTestResults] = useState<TestCaseResult[]>([]);
  const [selectedTestCaseIdx, setSelectedTestCaseIdx] = useState<number>(0);
  const [executionStats, setExecutionStats] = useState<{ passedCount: number; totalCount: number; allPassed: boolean } | null>(null);
  const [executionError, setExecutionError] = useState<string | null>(null);

  const handleLanguageSelect = (lang: string) => {
    onLanguageChange(lang);
    if (question.starterTemplates && question.starterTemplates[lang]) {
      if (!studentCode.trim() || confirm('Load starter boilerplate template for ' + lang + '? (This will reset unsaved code)')) {
        onCodeChange(question.starterTemplates[lang]);
      }
    }
  };

  const resetToStarter = () => {
    if (question.starterTemplates && question.starterTemplates[selectedLanguage]) {
      if (confirm('Reset editor to clean starter boilerplate template?')) {
        onCodeChange(question.starterTemplates[selectedLanguage]);
      }
    }
  };

  // Run Real Code against all standard test cases + custom input
  const handleRunTestCases = async () => {
    setIsExecuting(true);
    setExecutionError(null);
    setActiveTab('testcases');

    try {
      const allCases = (question.testCases && question.testCases.length > 0)
        ? question.testCases
        : (question.sampleInput ? [{ input: question.sampleInput, expected: question.sampleExpectedOutput || '' }] : []);

      const res = await fetch('/api/run-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: studentCode,
          language: selectedLanguage,
          customInput: customInput,
          testCases: allCases
        }),
      });

      if (!res.ok) {
        throw new Error(`Execution service error (${res.status})`);
      }

      const data = await res.json();

      if (data.results && data.results.length > 0) {
        setTestResults(data.results);
        setExecutionStats({
          passedCount: data.passedCount || 0,
          totalCount: data.totalCount || data.results.length,
          allPassed: Boolean(data.allPassed)
        });
      }

      if (data.customOutput !== undefined) {
        setCustomOutput(data.customOutput);
      }

      if (data.error && !data.results?.length) {
        setExecutionError(data.error);
      }
    } catch (err: any) {
      console.error('Run code error:', err);
      setExecutionError(err.message || 'Execution failed. Check code syntax or infinite loop.');
    } finally {
      setIsExecuting(false);
    }
  };

  // Run Custom Input only
  const handleRunCustomInput = async () => {
    setIsExecuting(true);
    setExecutionError(null);
    try {
      const res = await fetch('/api/run-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: studentCode,
          language: selectedLanguage,
          customInput: customInput,
        }),
      });
      const data = await res.json();
      if (data.customOutput !== undefined) {
        setCustomOutput(data.customOutput);
      }
      if (data.error) {
        setExecutionError(data.error);
      }
    } catch (err: any) {
      setExecutionError(err.message || 'Failed to run on custom input');
    } finally {
      setIsExecuting(false);
    }
  };

  // AI Logic Grading with Leniency
  const handleEvaluateLogic = async () => {
    setIsEvaluatingAi(true);
    setActiveTab('aiReport');
    try {
      const res = await fetch('/api/evaluate-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          problemTitle: question.title,
          problemDescription: question.questionText,
          language: selectedLanguage,
          code: studentCode,
          sampleInput: question.sampleInput,
          sampleExpectedOutput: question.sampleExpectedOutput,
        }),
      });

      const data: CodeEvaluationResult = await res.json();
      onEvaluationComplete(data);
    } catch (err) {
      console.error('Logic evaluation error:', err);
    } finally {
      setIsEvaluatingAi(false);
    }
  };

  const selectedCase = testResults[selectedTestCaseIdx];

  return (
    <div className="flex flex-col h-full bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs text-slate-800">
      {/* Editor Top Bar */}
      <div className="px-4 py-2.5 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
            <Code className="w-3.5 h-3.5 text-blue-600" />
            Language:
          </label>
          <select
            value={selectedLanguage}
            onChange={(e) => handleLanguageSelect(e.target.value)}
            className="bg-white border border-slate-300 text-xs text-slate-800 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500 font-semibold shadow-2xs"
          >
            {SUPPORTED_LANGUAGES.map((lang) => (
              <option key={lang.id} value={lang.id}>
                {lang.label}
              </option>
            ))}
          </select>

          <button
            onClick={resetToStarter}
            className="text-xs text-slate-600 hover:text-slate-900 flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 border border-slate-200 transition-colors"
            title="Reset to clean boilerplate template without solution code"
          >
            <RefreshCw className="w-3 h-3 text-slate-500" />
            Reset Boilerplate
          </button>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleRunTestCases}
            disabled={isExecuting || !studentCode.trim()}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white text-xs font-bold rounded-lg shadow-xs transition-all disabled:opacity-50"
            title="Compile and run actual code against test cases"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>{isExecuting ? 'Executing...' : 'Run Test Cases'}</span>
          </button>

          <button
            onClick={handleEvaluateLogic}
            disabled={isEvaluatingAi || !studentCode.trim()}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white text-xs font-bold rounded-lg shadow-xs transition-all disabled:opacity-50"
            title="Evaluates algorithmic logic and awards marks even if minor syntax slips exist"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-spin" />
            <span>{isEvaluatingAi ? 'AI Grading Logic...' : 'Evaluate Logic with AI'}</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 bg-slate-50 text-xs font-semibold">
        <button
          onClick={() => setActiveTab('editor')}
          className={`px-4 py-2.5 border-b-2 transition-colors flex items-center gap-1.5 ${
            activeTab === 'editor'
              ? 'border-blue-600 text-blue-600 bg-white font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Code className="w-3.5 h-3.5" />
          Code Editor ({SUPPORTED_LANGUAGES.find(l => l.id === selectedLanguage)?.ext})
        </button>

        <button
          onClick={() => setActiveTab('testcases')}
          className={`px-4 py-2.5 border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === 'testcases'
              ? 'border-emerald-600 text-emerald-700 bg-white font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Terminal className="w-3.5 h-3.5" />
          <span>I/O & Test Cases</span>
          {executionStats && (
            <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
              executionStats.allPassed 
                ? 'bg-emerald-100 text-emerald-800' 
                : 'bg-amber-100 text-amber-800'
            }`}>
              {executionStats.passedCount}/{executionStats.totalCount} Passed
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('aiReport')}
          className={`px-4 py-2.5 border-b-2 transition-colors flex items-center gap-1.5 ${
            activeTab === 'aiReport'
              ? 'border-indigo-600 text-indigo-700 bg-white font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-500" />
          AI Logic Evaluation {evaluationResult && `(${evaluationResult.score}/30)`}
        </button>
      </div>

      {/* Tab Panels */}
      <div className="flex-1 overflow-hidden relative">
        {/* TAB 1: CODE EDITOR */}
        {activeTab === 'editor' && (
          <div className="h-full flex flex-col font-mono text-sm">
            <div className="flex-1 relative">
              <textarea
                value={studentCode}
                onChange={(e) => onCodeChange(e.target.value)}
                onKeyDown={(e) => e.stopPropagation()}
                onCopy={(e) => e.stopPropagation()}
                onCut={(e) => e.stopPropagation()}
                onPaste={(e) => e.stopPropagation()}
                onContextMenu={(e) => e.stopPropagation()}
                placeholder="// Write your solution here... Use Run Test Cases to execute your code."
                spellCheck={false}
                autoComplete="off"
                autoCorrect="off"
                autoCapitalize="off"
                className="w-full h-full p-4 bg-slate-900 text-slate-100 font-mono text-xs md:text-sm resize-none focus:outline-none focus:ring-1 focus:ring-blue-500 leading-relaxed scrollbar-thin select-text cursor-text"
              />
            </div>
            {/* Leniency Banner Notice */}
            <div className="px-3.5 py-2 bg-blue-50 border-t border-blue-200 text-[11px] text-blue-900 flex items-center justify-between">
              <span className="flex items-center gap-1.5 font-medium">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                AI Logic Leniency Active: Minor syntax errors & typos are forgiven. Marks awarded for core logic!
              </span>
              <span className="text-[10px] text-slate-500 font-bold shrink-0">Max Marks: 30</span>
            </div>
          </div>
        )}

        {/* TAB 2: I/O & TEST CASES RUNNER */}
        {activeTab === 'testcases' && (
          <div className="h-full p-4 overflow-y-auto space-y-4 text-xs bg-slate-50">
            {/* Top Run Status Banner */}
            {isExecuting ? (
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl flex items-center gap-2 text-blue-800 font-semibold">
                <RefreshCw className="w-4 h-4 animate-spin text-blue-600" />
                <span>Compiling and running code against assessment test cases...</span>
              </div>
            ) : executionError ? (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2 text-red-800">
                <AlertTriangle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold">Execution Error:</div>
                  <pre className="text-[11px] font-mono whitespace-pre-wrap mt-1">{executionError}</pre>
                </div>
              </div>
            ) : executionStats ? (
              <div className={`p-3 rounded-xl border flex items-center justify-between ${
                executionStats.allPassed 
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-900' 
                  : 'bg-amber-50 border-amber-200 text-amber-900'
              }`}>
                <div className="flex items-center gap-2 font-bold">
                  {executionStats.allPassed ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  ) : (
                    <AlertTriangle className="w-5 h-5 text-amber-600" />
                  )}
                  <span>
                    {executionStats.allPassed 
                      ? 'All Test Cases Passed Successfully! ✓' 
                      : `${executionStats.passedCount} of ${executionStats.totalCount} Test Cases Passed`}
                  </span>
                </div>
                <span className="text-[11px] font-mono">
                  {executionStats.allPassed ? 'Exit Code: 0 (Accepted)' : 'Check failed cases below'}
                </span>
              </div>
            ) : (
              <div className="p-3 bg-white border border-slate-200 rounded-xl flex items-center justify-between">
                <span className="text-slate-600 text-xs font-medium">
                  Click <strong>"Run Test Cases"</strong> above to compile and execute your code against real inputs.
                </span>
                <button
                  onClick={handleRunTestCases}
                  disabled={isExecuting || !studentCode.trim()}
                  className="px-3 py-1 bg-emerald-600 text-white rounded-lg font-bold text-xs hover:bg-emerald-700 flex items-center gap-1.5 transition-all"
                >
                  <Play className="w-3 h-3 fill-current" />
                  Run Now
                </button>
              </div>
            )}

            {/* Test Case Selection Pills */}
            {testResults.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center gap-2 border-b border-slate-200 pb-2 overflow-x-auto">
                  {testResults.map((tc, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedTestCaseIdx(idx)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 ${
                        selectedTestCaseIdx === idx
                          ? 'bg-slate-900 text-white shadow-xs'
                          : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      {tc.passed ? (
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                      ) : (
                        <XCircle className="w-3.5 h-3.5 text-rose-500" />
                      )}
                      <span>Case {idx + 1}</span>
                      <span className={`text-[10px] px-1.5 py-0.2 rounded font-mono ${
                        tc.passed ? 'bg-emerald-500/20 text-emerald-300' : 'bg-rose-500/20 text-rose-300'
                      }`}>
                        {tc.passed ? 'PASS' : 'FAIL'}
                      </span>
                    </button>
                  ))}
                </div>

                {/* Selected Test Case Details */}
                {selectedCase && (
                  <div className="p-4 bg-white rounded-xl border border-slate-200 space-y-3 shadow-2xs font-mono">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                      <span className="font-bold text-slate-800 text-xs">
                        Test Case #{selectedTestCaseIdx + 1} Details:
                      </span>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        selectedCase.passed 
                          ? 'bg-emerald-100 text-emerald-800' 
                          : 'bg-rose-100 text-rose-800'
                      }`}>
                        {selectedCase.passed ? 'PASSED ✓' : 'FAILED (Wrong Output) ✗'}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <span className="text-[10px] uppercase font-bold text-slate-500 block mb-1">Standard Input:</span>
                        <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200 text-slate-800 whitespace-pre-wrap text-xs">
                          {selectedCase.input}
                        </div>
                      </div>

                      <div>
                        <span className="text-[10px] uppercase font-bold text-slate-500 block mb-1">Expected Output:</span>
                        <div className="p-2.5 bg-blue-50/60 rounded-lg border border-blue-200 text-blue-900 font-bold whitespace-pre-wrap text-xs">
                          {selectedCase.expected}
                        </div>
                      </div>
                    </div>

                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-500 block mb-1">Your Code's Actual Output:</span>
                      <div className={`p-2.5 rounded-lg border whitespace-pre-wrap text-xs font-bold ${
                        selectedCase.passed
                          ? 'bg-emerald-50 text-emerald-900 border-emerald-300'
                          : 'bg-rose-50 text-rose-900 border-rose-300'
                      }`}>
                        {selectedCase.actual || (selectedCase.passed ? selectedCase.expected : '[No output produced or returned None]')}
                      </div>
                    </div>

                    {selectedCase.error && (
                      <div className="p-2.5 bg-amber-50 rounded-lg border border-amber-200 text-amber-900 text-xs">
                        <strong className="block text-[10px] uppercase tracking-wider text-amber-800 mb-0.5">Execution Diagnostic:</strong>
                        <pre className="whitespace-pre-wrap font-mono">{selectedCase.error}</pre>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Custom Input & Output Section */}
            <div className="pt-2 border-t border-slate-200 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-700 text-xs uppercase tracking-wider flex items-center gap-1.5">
                  <Terminal className="w-3.5 h-3.5 text-blue-600" />
                  Custom Input Runner:
                </span>
                <button
                  onClick={handleRunCustomInput}
                  disabled={isExecuting || !studentCode.trim()}
                  className="px-2.5 py-1 bg-slate-200 hover:bg-slate-300 active:scale-95 text-slate-800 text-[11px] font-bold rounded-lg transition-colors disabled:opacity-50"
                >
                  Run on Custom Input
                </button>
              </div>

              <textarea
                value={customInput}
                onChange={(e) => setCustomInput(e.target.value)}
                placeholder="Enter custom input to pass via stdin..."
                rows={2}
                className="w-full p-2.5 bg-white rounded-xl border border-slate-300 text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500 font-mono text-xs shadow-2xs"
              />

              {customOutput && (
                <div className="space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                    Execution Stdout / Stderr:
                  </span>
                  <div className="p-3 bg-slate-900 text-emerald-400 rounded-xl border border-slate-800 whitespace-pre-wrap font-mono text-xs max-h-36 overflow-y-auto">
                    {customOutput}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 3: AI LOGIC EVALUATION */}
        {activeTab === 'aiReport' && (
          <div className="h-full p-4 overflow-y-auto space-y-3.5 bg-white">
            {isEvaluatingAi ? (
              <div className="h-full flex flex-col items-center justify-center p-8 text-center space-y-3">
                <Sparkles className="w-10 h-10 text-amber-500 animate-spin" />
                <div className="text-base font-bold text-slate-900">AI Evaluating Algorithmic Logic & Correctness</div>
                <p className="text-xs text-slate-500 max-w-md">
                  Analyzing code structure in {selectedLanguage.toUpperCase()}... forgiving minor syntax slips and grading algorithmic thought process.
                </p>
              </div>
            ) : evaluationResult ? (
              <div className="space-y-3 text-xs">
                {/* Score Header */}
                <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-blue-700 tracking-wider">Evaluation Verdict</span>
                    <h4 className="text-base font-black text-slate-900 flex items-center gap-2">
                      {evaluationResult.verdict}
                    </h4>
                    <span className="text-slate-600 text-[11px]">
                      Approach Identified: <strong className="text-emerald-700">{evaluationResult.approach}</strong>
                    </span>
                  </div>

                  <div className="text-right">
                    <span className="text-[10px] uppercase font-bold text-slate-500">Awarded Marks</span>
                    <div className="text-2xl font-black text-blue-700">
                      {evaluationResult.score} <span className="text-xs text-slate-500 font-normal">/ 30</span>
                    </div>
                    <span className="text-[10px] text-amber-700 font-bold font-mono">
                      Logic Score: {evaluationResult.logicScore}%
                    </span>
                  </div>
                </div>

                {/* Leniency Box (Errors Ignored) */}
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl space-y-1">
                  <div className="flex items-center gap-1.5 text-emerald-900 font-bold text-xs">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Leniency Mode Applied (Errors Ignored for Fair Marking):</span>
                  </div>
                  {evaluationResult.errorsIgnored && evaluationResult.errorsIgnored.length > 0 ? (
                    <ul className="list-disc list-inside space-y-0.5 text-emerald-800 text-[11px] pl-1">
                      {evaluationResult.errorsIgnored.map((err, idx) => (
                        <li key={idx}>{err}</li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-[11px] text-slate-600">Clean code structure. Algorithmic marks awarded.</p>
                  )}
                </div>

                {/* AI Constructive Feedback */}
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Examiner AI Feedback:</span>
                  <p className="text-slate-800 leading-relaxed text-xs">{evaluationResult.feedback}</p>
                </div>

                {/* Complexity */}
                <div className="grid grid-cols-2 gap-2 text-center">
                  <div className="p-2 rounded-lg bg-slate-50 border border-slate-200">
                    <span className="text-[10px] text-slate-500 block">Time Complexity</span>
                    <span className="font-mono text-blue-700 font-bold">{evaluationResult.timeComplexity || 'O(N)'}</span>
                  </div>
                  <div className="p-2 rounded-lg bg-slate-50 border border-slate-200">
                    <span className="text-[10px] text-slate-500 block">Auxiliary Space</span>
                    <span className="font-mono text-indigo-700 font-bold">{evaluationResult.spaceComplexity || 'O(1)'}</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center p-6 text-center space-y-2 text-slate-500">
                <HelpCircle className="w-8 h-8 text-slate-400" />
                <p className="text-xs">Click <strong>"Evaluate Logic with AI"</strong> above to grade your code.</p>
                <p className="text-[11px] text-slate-400 max-w-sm">
                  Evaluates algorithm logic and edge-cases rather than punishing minor syntax quirks.
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
