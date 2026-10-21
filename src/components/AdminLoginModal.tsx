import React, { useState } from 'react';
import { SmsLogo } from './SmsLogo';
import { 
  Lock, 
  User, 
  KeyRound, 
  Eye, 
  EyeOff, 
  AlertCircle, 
  CheckCircle2, 
  X, 
  ShieldCheck,
  ArrowRight
} from 'lucide-react';

interface AdminLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: () => void;
}

export const AdminLoginModal: React.FC<AdminLoginModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess,
}) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      // Validate via server or local credentials check
      const trimmedUser = username.trim();
      const trimmedPass = password.trim();

      // Check credentials: username = 'smsnqt26', password = '@SMSCSE'
      if (trimmedUser === 'smsnqt26' && trimmedPass === '@SMSCSE') {
        sessionStorage.setItem('sms_admin_logged_in', 'true');
        sessionStorage.setItem('sms_admin_user', 'smsnqt26');
        setIsLoading(false);
        onLoginSuccess();
        onClose();
        return;
      }

      // Try server endpoint
      const response = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: trimmedUser, password: trimmedPass }),
      });

      if (response.ok) {
        sessionStorage.setItem('sms_admin_logged_in', 'true');
        sessionStorage.setItem('sms_admin_user', trimmedUser);
        setIsLoading(false);
        onLoginSuccess();
        onClose();
      } else {
        setError('Invalid admin credentials. Please enter the authorized username and password.');
        setIsLoading(false);
      }
    } catch {
      // Fallback local verification
      if (username.trim() === 'smsnqt26' && password.trim() === '@SMSCSE') {
        sessionStorage.setItem('sms_admin_logged_in', 'true');
        sessionStorage.setItem('sms_admin_user', 'smsnqt26');
        onLoginSuccess();
        onClose();
      } else {
        setError('Invalid admin credentials. Username should be smsnqt26.');
      }
      setIsLoading(false);
    }
  };

  const handleFillCredentials = () => {
    setUsername('smsnqt26');
    setPassword('@SMSCSE');
    setError(null);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white border border-slate-200 rounded-3xl max-w-md w-full shadow-2xl p-6 md:p-8 relative text-slate-800">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          title="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="text-center space-y-3 pb-6 border-b border-slate-100">
          <div className="inline-block">
            <SmsLogo size="lg" />
          </div>
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-blue-50 text-blue-800 border border-blue-200 text-[11px] font-bold uppercase tracking-wider">
              <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
              Faculty & Administrator Portal
            </div>
            <h2 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight mt-1">
              Admin Authentication
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Sign in to view student submissions, scorecards, leaderboards, and modify question bank settings.
            </p>
          </div>
        </div>

        {/* Error Notification */}
        {error && (
          <div className="mt-4 p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <div className="leading-snug">{error}</div>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="mt-6 space-y-4 text-xs">
          <div>
            <label className="block text-slate-700 font-bold mb-1.5">
              Admin Username
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="smsnqt26"
                className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 font-medium"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-slate-700 font-bold">
                Admin Password
              </label>
              <button
                type="button"
                onClick={handleFillCredentials}
                className="text-[11px] text-blue-600 hover:text-blue-800 hover:underline font-semibold"
              >
                Auto-fill Authorized Credentials
              </button>
            </div>
            <div className="relative">
              <KeyRound className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-9 pr-10 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 font-medium"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                title={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 active:scale-98 text-white font-black text-sm rounded-xl shadow-md flex items-center justify-center gap-2 transition-all disabled:opacity-50"
            >
              {isLoading ? (
                <span>Authenticating Admin...</span>
              ) : (
                <>
                  <Lock className="w-4 h-4" />
                  <span>Sign In as Admin</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </form>

        {/* Security Notice Footer */}
        <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
          <span>SMS Lucknow Examination Cell</span>
          <span className="font-mono text-[10px] text-slate-400">AKTU Code: 423</span>
        </div>
      </div>
    </div>
  );
};
