'use client';

import React, { useState } from 'react';
import { X, Copy, Check, Share2, Globe, HeartHandshake } from 'lucide-react';
import { Song } from '../types';

interface ShareModalProps {
  song: Song;
  isOpen: boolean;
  onClose: () => void;
}

export const ShareModal: React.FC<ShareModalProps> = ({ song, isOpen, onClose }) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  // Generate share URL (using song ID or encoded JSON / shareCode)
  const origin = typeof window !== 'undefined' ? window.location.origin : '';
  const shareCode = song.shareCode || song.id;
  const shareUrl = `${origin}/s/${shareCode}`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
    }
  };

  const handleNativeShare = async () => {
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({
          title: `Chordist - ${song.title}`,
          text: `Check out the chord progression for "${song.title}" on Chordist!`,
          url: shareUrl,
        });
      } catch {
        // Share cancelled or unsupported
      }
    } else {
      handleCopy();
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 select-none">
      <div className="bg-bg-surface border border-border-subtle rounded-3xl max-w-md w-full p-5 md:p-6 shadow-2xl flex flex-col gap-5">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border-subtle pb-3">
          <div className="flex items-center gap-2">
            <Share2 className="w-5 h-5 text-accent-primary" />
            <h2 className="text-base font-bold text-text-primary">Share Song with Friends</h2>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl bg-bg-elevated hover:bg-border-subtle text-text-secondary hover:text-text-primary flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Card info */}
        <div className="bg-bg-elevated p-4 rounded-2xl border border-border-subtle flex flex-col gap-2">
          <div className="flex items-center gap-2 text-accent-primary font-bold text-sm">
            <Globe className="w-4 h-4" />
            <span>{song.title}</span>
          </div>
          <p className="text-xs text-text-secondary leading-relaxed">
            Anyone with this link can open and play this song instantly on phone, tablet, or PC, and fork a copy to their own library.
          </p>
        </div>

        {/* Share Link Input & Copy */}
        <div className="flex items-center gap-2 bg-bg-app p-2 rounded-2xl border border-border-subtle">
          <input
            type="text"
            readOnly
            value={shareUrl}
            className="bg-transparent text-xs font-mono text-text-primary outline-none px-2 flex-1 truncate"
          />
          <button
            onClick={handleCopy}
            className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all active:scale-95 ${
              copied
                ? 'bg-emerald-600 text-white'
                : 'bg-accent-primary hover:bg-accent-hover text-white'
            }`}
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5" />
                <span>Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copy</span>
              </>
            )}
          </button>
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-2">
          <button
            onClick={handleNativeShare}
            className="w-full py-2.5 rounded-xl bg-bg-elevated hover:bg-border-subtle text-text-primary text-xs font-bold border border-border-subtle flex items-center justify-center gap-2 transition-all active:scale-95"
          >
            <HeartHandshake className="w-4 h-4 text-accent-primary" />
            <span>Share via WhatsApp / Messages</span>
          </button>
        </div>
      </div>
    </div>
  );
};
