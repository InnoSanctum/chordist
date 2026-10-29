'use client';

import React, { useState } from 'react';
import { Lock, KeyRound, AlertCircle, UserPlus, Eye, EyeOff, Loader2 } from 'lucide-react';

export interface SessionUser {
  id: string;
  email: string;
}

interface LoginModalProps {
  isOpen: boolean;
  onSuccess: (user: SessionUser) => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onSuccess }) => {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  if (!isOpen) return null;

  const isRegister = mode === 'register';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (isRegister && password !== confirm) {
      setError('Passwords do not match.');
      return;
    }

    setBusy(true);
    try {
      const res = await fetch(isRegister ? '/api/auth/register' : '/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.user) {
        onSuccess(data.user);
      } else {
        setError(data.error || 'Something went wrong. Please try again.');
      }
    } catch {
      setError('Cannot reach the server. Check your connection.');
    } finally {
      setBusy(false);
    }
  };

  const switchMode = () => {
    setMode(isRegister ? 'login' : 'register');
    setError(null);
    setConfirm('');
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 select-none animate-fadeIn">
      <div className="bg-bg-surface border border-border-subtle rounded-3xl max-w-sm w-full p-6 shadow-2xl flex flex-col gap-5">
        {/* Top Header */}
        <div className="flex flex-col items-center text-center gap-2">
          <div className="w-12 h-12 rounded-2xl bg-accent-primary/20 border border-accent-primary/30 flex items-center justify-center text-accent-primary shadow-lg shadow-accent-primary/20">
            {isRegister ? <UserPlus className="w-6 h-6" /> : <Lock className="w-6 h-6" />}
          </div>
          <h2 className="text-lg font-bold text-text-primary">
            {isRegister ? 'Create Account' : 'Welcome to Chordister'}
          </h2>
          <p className="text-xs text-text-secondary leading-relaxed">
            {isRegister
              ? 'Your songs and pads sync to every device you log in from.'
              : 'Log in to play and edit your chord pads.'}
          </p>
        </div>

        {error && (
          <div className="flex items-center gap-2 p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-400 text-xs">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-3.5">
          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-semibold text-text-secondary uppercase tracking-wider">
              Email
            </label>
            <input
              type="email"
              name="email"
              autoComplete="username"
              inputMode="email"
              required
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="bg-bg-elevated border border-border-subtle rounded-xl px-3 py-2 text-sm text-text-primary outline-none focus:border-accent-primary"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-semibold text-text-secondary uppercase tracking-wider">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                autoComplete={isRegister ? 'new-password' : 'current-password'}
                required
                minLength={isRegister ? 6 : undefined}
                placeholder={isRegister ? 'At least 6 characters' : '••••••••'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-bg-elevated border border-border-subtle rounded-xl pl-3 pr-10 py-2 text-sm text-text-primary outline-none focus:border-accent-primary"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-text-secondary hover:text-text-primary"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {isRegister && (
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-semibold text-text-secondary uppercase tracking-wider">
                Confirm Password
              </label>
              <input
                type={showPassword ? 'text' : 'password'}
                name="confirm-password"
                autoComplete="new-password"
                required
                placeholder="Repeat password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                className="bg-bg-elevated border border-border-subtle rounded-xl px-3 py-2 text-sm text-text-primary outline-none focus:border-accent-primary"
              />
            </div>
          )}

          <button
            type="submit"
            disabled={busy}
            className="w-full mt-2 py-2.5 rounded-xl bg-accent-primary hover:bg-accent-hover disabled:opacity-60 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-lg shadow-accent-primary/30 transition-all active:scale-95"
          >
            {busy ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : isRegister ? (
              <UserPlus className="w-4 h-4" />
            ) : (
              <KeyRound className="w-4 h-4" />
            )}
            <span>{isRegister ? 'Create Account' : 'Log In'}</span>
          </button>
        </form>

        <button
          type="button"
          onClick={switchMode}
          className="text-xs text-text-secondary hover:text-accent-primary transition-colors"
        >
          {isRegister ? 'Already have an account? Log in' : 'New here? Create an account'}
        </button>
      </div>
    </div>
  );
};
