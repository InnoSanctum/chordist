'use client';

import React, { useState } from 'react';
import { Lock, KeyRound, AlertCircle, CheckCircle2 } from 'lucide-react';
import { checkCredentials, setAuthenticated } from '../lib/auth';

interface LoginModalProps {
  isOpen: boolean;
  onSuccess: () => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onSuccess }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (checkCredentials(username, password)) {
      setAuthenticated(true);
      setError(null);
      onSuccess();
    } else {
      setError('Invalid username or password. Please try again.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 select-none animate-fadeIn">
      <div className="bg-bg-surface border border-border-subtle rounded-3xl max-w-sm w-full p-6 shadow-2xl flex flex-col gap-5">
        {/* Top Header */}
        <div className="flex flex-col items-center text-center gap-2">
          <div className="w-12 h-12 rounded-2xl bg-accent-primary/20 border border-accent-primary/30 flex items-center justify-center text-accent-primary shadow-lg shadow-accent-primary/20">
            <Lock className="w-6 h-6" />
          </div>
          <h2 className="text-lg font-bold text-text-primary">Admin Access</h2>
          <p className="text-xs text-text-secondary leading-relaxed">
            Please log in to manage, edit, and play your chord pads.
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
              Username
            </label>
            <input
              type="text"
              required
              placeholder="admin"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="bg-bg-elevated border border-border-subtle rounded-xl px-3 py-2 text-sm text-text-primary outline-none focus:border-accent-primary"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-semibold text-text-secondary uppercase tracking-wider">
              Password
            </label>
            <input
              type="password"
              required
              placeholder="••••••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="bg-bg-elevated border border-border-subtle rounded-xl px-3 py-2 text-sm text-text-primary outline-none focus:border-accent-primary"
            />
          </div>

          <button
            type="submit"
            className="w-full mt-2 py-2.5 rounded-xl bg-accent-primary hover:bg-accent-hover text-white text-xs font-bold flex items-center justify-center gap-2 shadow-lg shadow-accent-primary/30 transition-all active:scale-95"
          >
            <KeyRound className="w-4 h-4" />
            <span>Unlock Chordist</span>
          </button>
        </form>
      </div>
    </div>
  );
};

