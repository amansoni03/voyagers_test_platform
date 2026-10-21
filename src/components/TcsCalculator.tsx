import React, { useState } from 'react';
import { X, Minimize2, Move } from 'lucide-react';

interface TcsCalculatorProps {
  onClose: () => void;
}

export const TcsCalculator: React.FC<TcsCalculatorProps> = ({ onClose }) => {
  const [display, setDisplay] = useState('0');
  const [isRad, setIsRad] = useState(true);

  const handleNum = (num: string) => {
    if (display === '0' || display === 'Error') {
      setDisplay(num);
    } else {
      setDisplay(prev => prev + num);
    }
  };

  const handleOp = (op: string) => {
    if (display === 'Error') return;
    setDisplay(prev => prev + ' ' + op + ' ');
  };

  const handleClear = () => {
    setDisplay('0');
  };

  const handleBackspace = () => {
    if (display.length <= 1 || display === 'Error') {
      setDisplay('0');
    } else {
      setDisplay(prev => prev.trimEnd().slice(0, -1).trimEnd());
    }
  };

  const handleSci = (fn: string) => {
    try {
      const val = parseFloat(display);
      if (isNaN(val)) return;
      let result = 0;
      const angle = isRad ? val : (val * Math.PI) / 180;

      switch (fn) {
        case 'sin':
          result = Math.sin(angle);
          break;
        case 'cos':
          result = Math.cos(angle);
          break;
        case 'tan':
          result = Math.tan(angle);
          break;
        case 'ln':
          result = Math.log(val);
          break;
        case 'log':
          result = Math.log10(val);
          break;
        case 'sqrt':
          result = Math.sqrt(val);
          break;
        case 'sq':
          result = val * val;
          break;
        case 'cube':
          result = val * val * val;
          break;
        case 'inv':
          result = 1 / val;
          break;
        case 'fact': {
          let f = 1;
          for (let i = 2; i <= Math.min(val, 20); i++) f *= i;
          result = f;
          break;
        }
        case 'pi':
          result = Math.PI;
          break;
        case 'e':
          result = Math.E;
          break;
        default:
          return;
      }
      setDisplay(Number(result.toFixed(8)).toString());
    } catch {
      setDisplay('Error');
    }
  };

  const handleEvaluate = () => {
    try {
      const cleanExpr = display
        .replace(/×/g, '*')
        .replace(/÷/g, '/')
        .replace(/π/g, Math.PI.toString())
        .replace(/e/g, Math.E.toString());

      // eslint-disable-next-line no-eval
      const result = Function(`'use strict'; return (${cleanExpr})`)();
      if (isNaN(result) || !isFinite(result)) {
        setDisplay('Error');
      } else {
        setDisplay(Number(result.toFixed(8)).toString());
      }
    } catch {
      setDisplay('Error');
    }
  };

  return (
    <div className="fixed top-20 right-8 z-50 w-80 bg-white border border-slate-300 rounded-2xl shadow-2xl text-slate-800 overflow-hidden animate-in fade-in zoom-in-95 duration-150 select-none">
      {/* Title bar */}
      <div className="bg-slate-100 px-3 py-2 flex items-center justify-between border-b border-slate-200 text-xs font-semibold select-none cursor-move">
        <div className="flex items-center gap-1.5 text-blue-700 font-bold">
          <Move className="w-3.5 h-3.5" />
          <span>TCS iON Scientific Calculator</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsRad(!isRad)}
            className="px-1.5 py-0.5 rounded bg-slate-200 hover:bg-slate-300 text-[10px] text-slate-700 font-mono font-bold"
            title="Toggle Radian / Degree"
          >
            {isRad ? 'RAD' : 'DEG'}
          </button>
          <button
            onClick={onClose}
            className="p-1 hover:bg-slate-200 rounded transition-colors text-slate-500 hover:text-slate-800"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Screen Display in Crisp High Contrast Light Style */}
      <div className="p-3 bg-slate-50 border-b border-slate-200 text-right">
        <div className="font-mono text-xl text-blue-800 font-bold overflow-x-auto whitespace-nowrap scrollbar-none tracking-wider">
          {display}
        </div>
      </div>

      {/* Calculator Buttons Grid in Light Styling */}
      <div className="p-2.5 grid grid-cols-5 gap-1.5 text-xs font-medium bg-white">
        {/* Row 1: Sci */}
        <button onClick={() => handleSci('sin')} className="p-1.5 bg-slate-100 hover:bg-slate-200 rounded text-slate-700">sin</button>
        <button onClick={() => handleSci('cos')} className="p-1.5 bg-slate-100 hover:bg-slate-200 rounded text-slate-700">cos</button>
        <button onClick={() => handleSci('tan')} className="p-1.5 bg-slate-100 hover:bg-slate-200 rounded text-slate-700">tan</button>
        <button onClick={() => handleSci('sqrt')} className="p-1.5 bg-slate-100 hover:bg-slate-200 rounded text-slate-700">√</button>
        <button onClick={handleClear} className="p-1.5 bg-rose-100 hover:bg-rose-200 text-rose-800 font-bold rounded">C</button>

        {/* Row 2: Sci 2 */}
        <button onClick={() => handleSci('ln')} className="p-1.5 bg-slate-100 hover:bg-slate-200 rounded text-slate-700">ln</button>
        <button onClick={() => handleSci('log')} className="p-1.5 bg-slate-100 hover:bg-slate-200 rounded text-slate-700">log</button>
        <button onClick={() => handleSci('sq')} className="p-1.5 bg-slate-100 hover:bg-slate-200 rounded text-slate-700">x²</button>
        <button onClick={() => handleSci('inv')} className="p-1.5 bg-slate-100 hover:bg-slate-200 rounded text-slate-700">1/x</button>
        <button onClick={handleBackspace} className="p-1.5 bg-slate-200 hover:bg-slate-300 rounded text-slate-700">⌫</button>

        {/* Row 3: Numbers 7, 8, 9 */}
        <button onClick={() => handleSci('fact')} className="p-1.5 bg-slate-100 hover:bg-slate-200 rounded text-slate-700">n!</button>
        <button onClick={() => handleNum('7')} className="p-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded font-bold text-slate-800">7</button>
        <button onClick={() => handleNum('8')} className="p-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded font-bold text-slate-800">8</button>
        <button onClick={() => handleNum('9')} className="p-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded font-bold text-slate-800">9</button>
        <button onClick={() => handleOp('/')} className="p-1.5 bg-blue-100 hover:bg-blue-200 text-blue-800 rounded font-bold">÷</button>

        {/* Row 4: Numbers 4, 5, 6 */}
        <button onClick={() => handleSci('pi')} className="p-1.5 bg-slate-100 hover:bg-slate-200 rounded text-slate-700">π</button>
        <button onClick={() => handleNum('4')} className="p-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded font-bold text-slate-800">4</button>
        <button onClick={() => handleNum('5')} className="p-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded font-bold text-slate-800">5</button>
        <button onClick={() => handleNum('6')} className="p-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded font-bold text-slate-800">6</button>
        <button onClick={() => handleOp('*')} className="p-1.5 bg-blue-100 hover:bg-blue-200 text-blue-800 rounded font-bold">×</button>

        {/* Row 5: Numbers 1, 2, 3 */}
        <button onClick={() => handleSci('e')} className="p-1.5 bg-slate-100 hover:bg-slate-200 rounded text-slate-700">e</button>
        <button onClick={() => handleNum('1')} className="p-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded font-bold text-slate-800">1</button>
        <button onClick={() => handleNum('2')} className="p-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded font-bold text-slate-800">2</button>
        <button onClick={() => handleNum('3')} className="p-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded font-bold text-slate-800">3</button>
        <button onClick={() => handleOp('-')} className="p-1.5 bg-blue-100 hover:bg-blue-200 text-blue-800 rounded font-bold">−</button>

        {/* Row 6: 0, Dot, Equals */}
        <button onClick={() => handleOp('(')} className="p-1.5 bg-slate-100 hover:bg-slate-200 rounded text-slate-700">(</button>
        <button onClick={() => handleOp(')')} className="p-1.5 bg-slate-100 hover:bg-slate-200 rounded text-slate-700">)</button>
        <button onClick={() => handleNum('0')} className="p-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded font-bold text-slate-800">0</button>
        <button onClick={() => handleNum('.')} className="p-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded font-bold text-slate-800">.</button>
        <button onClick={() => handleOp('+')} className="p-1.5 bg-blue-100 hover:bg-blue-200 text-blue-800 rounded font-bold">+</button>
      </div>

      <div className="p-2 pt-0 flex gap-1.5 bg-white">
        <button
          onClick={handleEvaluate}
          className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg shadow-xs text-xs uppercase tracking-wider"
        >
          = Calculate
        </button>
      </div>
    </div>
  );
};
