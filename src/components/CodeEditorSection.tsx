import React, { useState, useEffect, useRef } from 'react';
import { 
  Play, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  RefreshCw, 
  Terminal, 
  HelpCircle, 
  Code, 
  ShieldCheck, 
  Check, 
  Maximize2,
  Minimize2,
  Copy,
  Columns
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
  mismatch?: boolean;
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
  const [customMismatchError, setCustomMismatchError] = useState<string | null>(null);
  const [isExecuting, setIsExecuting] = useState(false);
  const [activeTab, setActiveTab] = useState<'editor' | 'testcases'>('editor');
  const [isSplitView, setIsSplitView] = useState<boolean>(false);
  const [fontSize, setFontSize] = useState<'xs' | 'sm' | 'base'>('xs');
  const [copiedCodeToast, setCopiedCodeToast] = useState(false);
  const [resetPromptOpen, setResetPromptOpen] = useState(false);

  // Per-language code cache so switching languages never loses work
  const codeCacheRef = useRef<Record<string, string>>({});

  // Real test runner state
  const [testResults, setTestResults] = useState<TestCaseResult[]>([]);
  const [selectedTestCaseIdx, setSelectedTestCaseIdx] = useState<number>(0);
  const [executionStats, setExecutionStats] = useState<{ passedCount: number; totalCount: number; allPassed: boolean } | null>(null);
  const [executionError, setExecutionError] = useState<string | null>(null);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const lineNumbersRef = useRef<HTMLDivElement>(null);

  // Initialize or reset question data
  useEffect(() => {
    setCustomInput(question.sampleInput || '');
    setTestResults([]);
    setExecutionStats(null);
    setExecutionError(null);
    setCustomOutput(null);
    setSelectedTestCaseIdx(0);

    // If current code is completely empty, populate with template
    const template = question.starterTemplates?.[selectedLanguage] || '';
    if (!studentCode.trim() && template) {
      codeCacheRef.current[selectedLanguage] = template;
      onCodeChange(template);
    } else if (studentCode.trim()) {
      codeCacheRef.current[selectedLanguage] = studentCode;
    }
  }, [question.id]);

  // Keep cache synced with studentCode
  useEffect(() => {
    if (studentCode) {
      codeCacheRef.current[selectedLanguage] = studentCode;
    }
  }, [studentCode, selectedLanguage]);

  // Language switch without blocking browser confirm() popups
  const handleLanguageSelect = (newLang: string) => {
    // Save current code to cache
    if (studentCode) {
      codeCacheRef.current[selectedLanguage] = studentCode;
    }
    onLanguageChange(newLang);

    // Retrieve cached code or default starter template for new language
    const cached = codeCacheRef.current[newLang];
    const template = question.starterTemplates?.[newLang] || '';
    const targetCode = cached || template;
    onCodeChange(targetCode);
  };

  // Reset to starter template
  const handleResetToTemplate = () => {
    const template = question.starterTemplates?.[selectedLanguage] || '';
    if (template) {
      codeCacheRef.current[selectedLanguage] = template;
      onCodeChange(template);
      setResetPromptOpen(false);
    }
  };

  // Copy code to clipboard
  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(studentCode);
      setCopiedCodeToast(true);
      setTimeout(() => setCopiedCodeToast(false), 2000);
    } catch {}
  };

  // Sync scroll between textarea and line numbers gutter
  const handleScroll = () => {
    if (textareaRef.current && lineNumbersRef.current) {
      lineNumbersRef.current.scrollTop = textareaRef.current.scrollTop;
    }
  };

  // Advanced code editor keystroke handling (Tab, Shift+Tab, Enter indentation, Brackets)
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    e.stopPropagation(); // Prevent exam lockdown from catching editor keystrokes
    const textarea = textareaRef.current;
    if (!textarea) return;

    // Run tests shortcut: Ctrl+Enter or Cmd+Enter
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      handleRunTestCases();
      return;
    }

    const { selectionStart, selectionEnd, value } = textarea;

    // TAB INDENTATION: 4 spaces
    if (e.key === 'Tab') {
      e.preventDefault();
      if (!e.shiftKey) {
        // Insert 4 spaces
        const before = value.substring(0, selectionStart);
        const after = value.substring(selectionEnd);
        const updated = before + '    ' + after;
        onCodeChange(updated);
        setTimeout(() => {
          textarea.selectionStart = textarea.selectionEnd = selectionStart + 4;
        }, 0);
      } else {
        // Shift+Tab: Unindent current line
        const before = value.substring(0, selectionStart);
        const lastNewline = before.lastIndexOf('\n');
        const lineStart = lastNewline === -1 ? 0 : lastNewline + 1;
        const line = value.substring(lineStart, selectionStart);
        if (line.startsWith('    ')) {
          const updated = value.substring(0, lineStart) + line.substring(4) + value.substring(selectionStart);
          onCodeChange(updated);
          setTimeout(() => {
            textarea.selectionStart = textarea.selectionEnd = Math.max(lineStart, selectionStart - 4);
          }, 0);
        } else if (line.startsWith('  ')) {
          const updated = value.substring(0, lineStart) + line.substring(2) + value.substring(selectionStart);
          onCodeChange(updated);
          setTimeout(() => {
            textarea.selectionStart = textarea.selectionEnd = Math.max(lineStart, selectionStart - 2);
          }, 0);
        }
      }
      return;
    }

    // ENTER: Auto-indentation based on previous line
    if (e.key === 'Enter') {
      e.preventDefault();
      const before = value.substring(0, selectionStart);
      const after = value.substring(selectionEnd);
      const lastNewline = before.lastIndexOf('\n');
      const currentLine = before.substring(lastNewline === -1 ? 0 : lastNewline + 1);

      // Match leading whitespace
      const match = currentLine.match(/^(\s+)/);
      let indent = match ? match[1] : '';

      // If line ends with colon (Python) or opening brace (C/C++/Java/JS), add 4 spaces
      const trimmedLine = currentLine.trimEnd();
      if (trimmedLine.endsWith(':') || trimmedLine.endsWith('{')) {
        indent += '    ';
      }

      const insertion = '\n' + indent;
      const updated = before + insertion + after;
      onCodeChange(updated);
      setTimeout(() => {
        textarea.selectionStart = textarea.selectionEnd = selectionStart + insertion.length;
      }, 0);
      return;
    }

    // Auto-close brackets & quotes
    const pairs: Record<string, string> = {
      '(': ')',
      '[': ']',
      '{': '}',
      '"': '"',
      "'": "'",
    };

    if (pairs[e.key] && selectionStart === selectionEnd) {
      const closing = pairs[e.key];
      // Only auto-close quotes if not immediately preceding a word char
      if ((e.key === '"' || e.key === "'") && value[selectionStart]?.match(/\w/)) {
        return;
      }
      e.preventDefault();
      const before = value.substring(0, selectionStart);
      const after = value.substring(selectionEnd);
      const updated = before + e.key + closing + after;
      onCodeChange(updated);
      setTimeout(() => {
        textarea.selectionStart = textarea.selectionEnd = selectionStart + 1;
      }, 0);
    }
  };

  // Run Real Code against all standard test cases + custom input
  const handleRunTestCases = async () => {
    setIsExecuting(true);
    setExecutionError(null);
    setCustomMismatchError(null);
    if (!isSplitView) {
      setActiveTab('testcases');
    }

    try {
      // Ensure test cases list incorporates the admin's sampleInput and sampleExpectedOutput
      let allCases: Array<{ input: string; expected: string; hidden?: boolean }> = [];
      if (question.testCases && question.testCases.length > 0) {
        allCases = question.testCases.map((tc, idx) => {
          if (idx === 0 && question.sampleExpectedOutput) {
            return {
              ...tc,
              input: (question.sampleInput !== undefined && question.sampleInput.trim() !== '') ? question.sampleInput : tc.input,
              expected: question.sampleExpectedOutput
            };
          }
          return tc;
        });
      } else if (question.sampleExpectedOutput) {
        allCases = [{ input: question.sampleInput || '', expected: question.sampleExpectedOutput }];
      }

      const res = await fetch('/api/run-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: studentCode,
          language: selectedLanguage,
          customInput: customInput,
          expectedOutput: question.sampleExpectedOutput,
          testCases: allCases,
        }),
      });

      if (!res.ok) {
        throw new Error(`Execution service error (${res.status})`);
      }

      const data = await res.json();

      if (data.results && data.results.length > 0) {
        setTestResults(data.results);
        const passedCount = data.passedCount || 0;
        const totalCount = data.totalCount || data.results.length;
        setExecutionStats({
          passedCount,
          totalCount,
          allPassed: Boolean(data.allPassed),
        });

        // Automatically update submission evaluation from real test cases
        const total = totalCount || 1;
        const score = Math.round((passedCount / total) * (question.marks || 30));
        const logicScore = Math.round((passedCount / total) * 100);
        const hasCompileError = data.results.some((r: any) => r.actual?.includes('Compilation Error') || r.error?.includes('Compilation'));
        const verdict = data.allPassed 
          ? 'Accepted' 
          : hasCompileError 
            ? 'Compilation Error' 
            : passedCount > 0 
              ? `Partially Accepted (${passedCount}/${total})` 
              : 'Wrong Answer';

        onEvaluationComplete({
          score,
          maxScore: question.marks || 30,
          logicScore,
          verdict,
          approach: `${selectedLanguage.toUpperCase()} Program`,
          errorsIgnored: [],
          feedback: data.allPassed 
            ? 'All test cases compiled and passed successfully.' 
            : `Program passed ${passedCount} of ${total} test cases.`,
          timeComplexity: 'N/A',
          spaceComplexity: 'N/A',
          testCases: data.results,
        });

        // Automatically focus the first failed/mismatched test case so the mismatch error is directly visible
        const firstFailed = data.results.findIndex((r: any) => !r.passed);
        if (firstFailed >= 0) {
          setSelectedTestCaseIdx(firstFailed);
        }
      }

      if (data.customOutput !== undefined) {
        setCustomOutput(data.customOutput);
      }

      if (data.customMismatchError) {
        setCustomMismatchError(data.customMismatchError);
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
    setCustomMismatchError(null);
    try {
      const isSample = customInput.trim() === (question.sampleInput || '').trim();
      const expected = isSample ? question.sampleExpectedOutput : undefined;

      const res = await fetch('/api/run-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: studentCode,
          language: selectedLanguage,
          customInput: customInput,
          expectedOutput: expected,
        }),
      });
      const data = await res.json();
      if (data.customOutput !== undefined) {
        setCustomOutput(data.customOutput);
      }
      if (data.customMismatchError) {
        setCustomMismatchError(data.customMismatchError);
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

  // Generate line numbers
  const lines = (studentCode || '').split('\n');
  const lineCount = Math.max(lines.length, 18);

  const selectedCase = testResults[selectedTestCaseIdx];

  const fontSizeClass = fontSize === 'xs' ? 'text-xs leading-5' : fontSize === 'sm' ? 'text-sm leading-6' : 'text-base leading-7';

  return (
    <div className="flex flex-col h-full bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs text-slate-800">
      {/* Editor Top Bar */}
      <div className="px-4 py-2.5 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
            <Code className="w-3.5 h-3.5 text-blue-600" />
            Language:
          </label>
          <select
            value={selectedLanguage}
            onChange={(e) => handleLanguageSelect(e.target.value)}
            className="bg-white border border-slate-300 text-xs text-slate-800 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500 font-semibold shadow-2xs cursor-pointer"
          >
            {SUPPORTED_LANGUAGES.map((lang) => (
              <option key={lang.id} value={lang.id}>
                {lang.label}
              </option>
            ))}
          </select>

          {/* Reset Template with Inline Dropdown */}
          <div className="relative">
            <button
              onClick={() => setResetPromptOpen(!resetPromptOpen)}
              className="text-xs text-slate-600 hover:text-slate-900 flex items-center gap-1 px-2 py-1.5 rounded-lg bg-white hover:bg-slate-100 border border-slate-200 transition-colors shadow-2xs"
              title="Reset boilerplate template for this language"
            >
              <RefreshCw className="w-3 h-3 text-slate-500" />
              <span>Reset</span>
            </button>

            {resetPromptOpen && (
              <div className="absolute left-0 mt-1.5 w-60 p-3 bg-white border border-slate-200 rounded-xl shadow-lg z-50 text-xs space-y-2">
                <p className="text-slate-700 font-medium">
                  Load clean starter boilerplate for <strong>{selectedLanguage.toUpperCase()}</strong>? Unsaved modifications will be replaced.
                </p>
                <div className="flex items-center justify-end gap-2 pt-1">
                  <button
                    onClick={() => setResetPromptOpen(false)}
                    className="px-2.5 py-1 text-slate-600 hover:bg-slate-100 rounded-md text-xs font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleResetToTemplate}
                    className="px-2.5 py-1 bg-rose-600 hover:bg-rose-700 text-white rounded-md text-xs font-bold shadow-xs"
                  >
                    Confirm Reset
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Copy Code */}
          <button
            onClick={handleCopyCode}
            className="text-xs text-slate-600 hover:text-slate-900 flex items-center gap-1 px-2 py-1.5 rounded-lg bg-white hover:bg-slate-100 border border-slate-200 transition-colors shadow-2xs"
            title="Copy current code to clipboard"
          >
            {copiedCodeToast ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3 text-slate-500" />}
            <span>{copiedCodeToast ? 'Copied!' : 'Copy'}</span>
          </button>

          {/* Font Size Toggle */}
          <div className="hidden sm:flex items-center border border-slate-200 rounded-lg overflow-hidden bg-white text-[11px] font-semibold text-slate-600">
            <button
              onClick={() => setFontSize('xs')}
              className={`px-2 py-1 ${fontSize === 'xs' ? 'bg-blue-600 text-white font-bold' : 'hover:bg-slate-50'}`}
              title="Small text"
            >
              A-
            </button>
            <button
              onClick={() => setFontSize('sm')}
              className={`px-2 py-1 border-x border-slate-200 ${fontSize === 'sm' ? 'bg-blue-600 text-white font-bold' : 'hover:bg-slate-50'}`}
              title="Medium text"
            >
              A
            </button>
            <button
              onClick={() => setFontSize('base')}
              className={`px-2 py-1 ${fontSize === 'base' ? 'bg-blue-600 text-white font-bold' : 'hover:bg-slate-50'}`}
              title="Large text"
            >
              A+
            </button>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          {/* Split View Toggle */}
          <button
            onClick={() => setIsSplitView(!isSplitView)}
            className={`p-1.5 rounded-lg border text-xs font-semibold flex items-center gap-1 transition-all ${
              isSplitView 
                ? 'bg-blue-50 border-blue-300 text-blue-700 shadow-2xs' 
                : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100'
            }`}
            title={isSplitView ? 'Switch to Tabbed View' : 'Switch to Split Editor + Output View'}
          >
            <Columns className="w-3.5 h-3.5" />
            <span className="hidden md:inline text-[11px]">{isSplitView ? 'Split View Active' : 'Split View'}</span>
          </button>

          <button
            onClick={handleRunTestCases}
            disabled={isExecuting || !studentCode.trim()}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white text-xs font-bold rounded-lg shadow-xs transition-all disabled:opacity-50 cursor-pointer"
            title="Compile and run code against test cases (Ctrl + Enter)"
          >
            <Play className={`w-3.5 h-3.5 fill-current ${isExecuting ? 'animate-pulse' : ''}`} />
            <span>{isExecuting ? 'Running...' : 'Run Test Cases'}</span>
          </button>

        </div>
      </div>

      {/* Tabs (Hidden in Split View) */}
      {!isSplitView && (
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
            <span>Code Editor ({SUPPORTED_LANGUAGES.find(l => l.id === selectedLanguage)?.ext})</span>
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
        </div>
      )}

      {/* Editor & Content Area */}
      <div className="flex-1 overflow-hidden relative flex flex-col">
        {/* Render Code Editor */}
        {(isSplitView || activeTab === 'editor') && (
          <div className={`flex flex-col font-mono ${isSplitView ? 'h-3/5 border-b border-slate-300' : 'h-full'}`}>
            <div className="flex-1 relative flex bg-slate-950 overflow-hidden">
              {/* Line Numbers Gutter */}
              <div 
                ref={lineNumbersRef}
                className="w-11 py-4 select-none bg-slate-900 border-r border-slate-800 text-slate-500 font-mono text-[11px] text-right pr-2.5 overflow-hidden shrink-0 leading-5"
                style={{ fontFamily: 'monospace' }}
              >
                {Array.from({ length: lineCount }).map((_, i) => (
                  <div key={i} className="h-5">
                    {i + 1}
                  </div>
                ))}
              </div>

              {/* Textarea Input */}
              <div className="flex-1 relative h-full">
                <textarea
                  ref={textareaRef}
                  value={studentCode}
                  onChange={(e) => onCodeChange(e.target.value)}
                  onKeyDown={handleKeyDown}
                  onScroll={handleScroll}
                  onCopy={(e) => e.stopPropagation()}
                  onCut={(e) => e.stopPropagation()}
                  onPaste={(e) => e.stopPropagation()}
                  onContextMenu={(e) => e.stopPropagation()}
                  placeholder="// Write your solution here... Press Ctrl+Enter or click 'Run Test Cases' to execute."
                  spellCheck={false}
                  autoComplete="off"
                  autoCorrect="off"
                  autoCapitalize="off"
                  className={`w-full h-full p-4 pl-3 bg-slate-950 text-slate-100 font-mono resize-none focus:outline-none focus:ring-0 scrollbar-thin select-text cursor-text ${fontSizeClass}`}
                  style={{ tabSize: 4 }}
                />
              </div>
            </div>

            {/* Bottom Status bar */}
            <div className="px-3.5 py-1.5 bg-slate-100 border-t border-slate-200 text-[11px] text-slate-700 flex items-center justify-between shrink-0">
              <span className="flex items-center gap-1.5 font-medium">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>AI Logic Evaluation Active: Tab & indent supported. Shortcuts: <kbd className="px-1 py-0.5 bg-white border rounded font-mono text-[10px]">Ctrl+Enter</kbd> to Run.</span>
              </span>
              <span className="text-[10px] text-slate-500 font-bold shrink-0">
                Lines: {lines.length} • Max Marks: 30
              </span>
            </div>
          </div>
        )}

        {/* Render Test Cases / Console Output (in Split View or when activeTab === 'testcases') */}
        {(isSplitView || activeTab === 'testcases') && (
          <div className={`p-4 overflow-y-auto space-y-4 text-xs bg-slate-50 ${isSplitView ? 'h-2/5' : 'h-full'}`}>
            {/* Top Run Status Banner */}
            {isExecuting ? (
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl flex items-center gap-2 text-blue-800 font-semibold shadow-2xs">
                <RefreshCw className="w-4 h-4 animate-spin text-blue-600 shrink-0" />
                <span>Compiling and running your {selectedLanguage.toUpperCase()} code against test cases...</span>
              </div>
            ) : executionError ? (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2 text-red-800 shadow-2xs">
                <AlertTriangle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                <div className="flex-1">
                  <div className="font-bold">Execution Error:</div>
                  <pre className="text-[11px] font-mono whitespace-pre-wrap mt-1 bg-red-100/60 p-2 rounded-lg border border-red-200">{executionError}</pre>
                </div>
              </div>
            ) : executionStats ? (
              <div className={`p-3 rounded-xl border flex items-center justify-between shadow-2xs ${
                executionStats.allPassed 
                  ? 'bg-emerald-50 border-emerald-300 text-emerald-900' 
                  : 'bg-amber-50 border-amber-300 text-amber-900'
              }`}>
                <div className="flex items-center gap-2 font-bold">
                  {executionStats.allPassed ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                  ) : (
                    <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
                  )}
                  <span>
                    {executionStats.allPassed 
                      ? 'All Test Cases Passed Successfully! ✓' 
                      : `${executionStats.passedCount} of ${executionStats.totalCount} Test Cases Passed`}
                  </span>
                </div>
                <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-white/80 border border-slate-200">
                  {executionStats.allPassed ? 'Exit Code: 0 (Accepted)' : 'Check failed cases below'}
                </span>
              </div>
            ) : (
              <div className="p-3 bg-white border border-slate-200 rounded-xl flex items-center justify-between shadow-2xs">
                <span className="text-slate-600 text-xs font-medium">
                  Click <strong>"Run Test Cases"</strong> above to compile and execute your code against test cases.
                </span>
                <button
                  onClick={handleRunTestCases}
                  disabled={isExecuting || !studentCode.trim()}
                  className="px-3 py-1 bg-emerald-600 text-white rounded-lg font-bold text-xs hover:bg-emerald-700 flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
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
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 cursor-pointer ${
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
                        {selectedCase.passed ? 'PASSED ✓' : 'FAILED (Output Mismatch) ✗'}
                      </span>
                    </div>

                    {/* Output Mismatch Error Card */}
                    {!selectedCase.passed && (
                      <div className="p-3.5 bg-rose-50 border-2 border-rose-300 rounded-xl space-y-2 text-rose-950 font-sans shadow-xs">
                        <div className="flex items-center gap-2 font-bold text-rose-900 text-xs">
                          <XCircle className="w-4 h-4 text-rose-600 shrink-0" />
                          <span>Output Mismatch Error: Test Case #{selectedTestCaseIdx + 1} Failed</span>
                        </div>
                        <p className="text-[11px] text-rose-800 leading-relaxed">
                          The student's generated output does not match the expected output configured in the test admin panel.
                        </p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 font-mono text-xs">
                          <div className="p-2.5 bg-white rounded-lg border border-emerald-300 shadow-2xs">
                            <span className="text-[10px] text-emerald-700 font-bold block uppercase tracking-wider mb-0.5">Expected Output (Fed in Admin):</span>
                            <span className="text-emerald-800 font-bold whitespace-pre-wrap">{selectedCase.expected}</span>
                          </div>
                          <div className="p-2.5 bg-white rounded-lg border border-rose-300 shadow-2xs">
                            <span className="text-[10px] text-rose-600 font-bold block uppercase tracking-wider mb-0.5">Student's Output:</span>
                            <span className="text-rose-700 font-bold whitespace-pre-wrap">{selectedCase.actual || '[No output produced]'}</span>
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <span className="text-[10px] uppercase font-bold text-slate-500 block mb-1">Standard Input:</span>
                        <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200 text-slate-800 whitespace-pre-wrap text-xs">
                          {selectedCase.input || '(empty)'}
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
                  className="px-2.5 py-1 bg-slate-200 hover:bg-slate-300 active:scale-95 text-slate-800 text-[11px] font-bold rounded-lg transition-colors disabled:opacity-50 cursor-pointer shadow-2xs"
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

              {customMismatchError && (
                <div className="p-3 bg-rose-50 border-2 border-rose-300 rounded-xl space-y-1 text-rose-900 font-sans shadow-xs">
                  <div className="flex items-center gap-1.5 font-bold text-rose-900 text-xs">
                    <XCircle className="w-4 h-4 text-rose-600 shrink-0" />
                    <span>Output Mismatch Error</span>
                  </div>
                  <pre className="text-xs font-mono whitespace-pre-wrap text-rose-950 bg-white/80 p-2.5 rounded-lg border border-rose-200">{customMismatchError}</pre>
                </div>
              )}

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
      </div>
    </div>
  );
};
