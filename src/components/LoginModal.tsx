import React, { useState } from 'react';
import { Eye, EyeOff, X, Lock, AlertCircle, ShieldCheck } from 'lucide-react';
import * as api from '../services/api';

interface LoginModalProps {
  onClose: () => void;
  onLoginSuccess: (user: api.AuthUser) => void;
  setupMode?: boolean;
}

export const LoginModal: React.FC<LoginModalProps> = ({ onClose, onLoginSuccess, setupMode = false }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setIsLoading(true);
      setErrorMessage(null);

      if (setupMode) {
        if (!fullName.trim() || !email.trim() || !username.trim() || !password.trim()) {
          setErrorMessage('Please complete every field to create the Chief Executive account.');
          return;
        }
        if (password.length < 6) {
          setErrorMessage('Passphrase must be at least 6 characters.');
          return;
        }
        if (password !== confirmPassword) {
          setErrorMessage('The two passphrases do not match.');
          return;
        }
        const res = await api.setupCeoAccount({
          name: fullName.trim(),
          email: email.trim(),
          username: username.trim(),
          password,
        });
        onLoginSuccess(res.user);
        return;
      }

      if (!username.trim() || !password.trim()) {
        setErrorMessage('Please enter your newsroom username or email and password.');
        return;
      }

      const res = await api.login(username.trim(), password);
      onLoginSuccess(res.user);
    } catch (err: any) {
      setErrorMessage(err.message || (setupMode ? 'Setup failed.' : 'Authentication failed. Check your newsroom credentials.'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden">
        
        {/* Header Bar */}
        <div className="bg-gradient-to-r from-red-600 to-red-800 p-6 text-white relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-full bg-black/20 hover:bg-black/40 text-white/90 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center space-x-3 mb-2">
            <div className="w-10 h-10 bg-white text-red-600 font-black rounded-lg flex items-center justify-center text-xl tracking-tighter shadow-md">
              ARN
            </div>
            <div>
              <div className="text-[10px] font-mono tracking-widest uppercase text-red-100 font-bold">
                Air Real News Media Network
              </div>
              <h2 className="text-xl font-bold font-sans">
                {setupMode ? 'Chief Executive Setup' : 'Staff & Editorial Portal'}
              </h2>
            </div>
          </div>
          <p className="text-xs text-red-100 font-sans leading-relaxed">
            {setupMode
              ? 'No Chief Executive account exists yet. Create the ARN owner account now — this one-time setup is only available until the first CEO is registered.'
              : 'Authorized newsroom access for ARN Chief Executive, Managing Editors, and Accredited Journalists.'}
          </p>
        </div>

        {/* Content Body */}
        <div className="p-6">
          {errorMessage && (
            <div className="mb-4 p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 rounded-lg flex items-start space-x-2.5 text-xs text-red-700 dark:text-red-300">
              <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0 text-red-600" />
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {setupMode && (
              <>
                <div>
                  <label className="block text-xs font-mono font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                    Full Name & Title
                  </label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Your Name"
                    required
                    autoFocus
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-red-600 transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                    Newsroom Email
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="e.g. chief@airrealnews.org"
                    required
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-red-600 transition"
                  />
                </div>
              </>
            )}

            <div>
              <label className="block text-xs font-mono font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                {setupMode ? 'Choose a Username' : 'Staff Username or Email'}
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder={setupMode ? 'e.g. chief.exec' : 'Enter authorized newsroom handle'}
                  required
                  autoFocus={!setupMode}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-red-600 transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-mono font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                Passphrase
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  required
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-red-600 transition pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {setupMode && (
              <div>
                <label className="block text-xs font-mono font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                  Confirm Passphrase
                </label>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••••••"
                  required
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-red-600 transition"
                />
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-2 py-3 bg-red-600 hover:bg-red-700 text-white font-bold font-mono text-xs uppercase tracking-wider rounded-lg shadow-md hover:shadow-lg transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>{setupMode ? 'Creating Account...' : 'Authenticating Session...'}</span>
                </>
              ) : (
                <>
                  {setupMode ? <ShieldCheck className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
                  <span>{setupMode ? 'Create Chief Executive Account' : 'Sign In to ARN Console'}</span>
                </>
              )}
            </button>
          </form>

        </div>

      </div>
    </div>
  );
};
