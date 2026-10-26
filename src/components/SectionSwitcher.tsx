'use client';

import React, { useState } from 'react';
import { Plus, Trash2, Edit2, Check, X } from 'lucide-react';
import { SongSection } from '../types';

interface SectionSwitcherProps {
  sections: SongSection[];
  activeSectionId: string;
  onSelectSection: (id: string) => void;
  onAddSection: (name: string) => void;
  onRenameSection: (id: string, newName: string) => void;
  onDeleteSection: (id: string) => void;
}

export const SectionSwitcher: React.FC<SectionSwitcherProps> = ({
  sections,
  activeSectionId,
  onSelectSection,
  onAddSection,
  onRenameSection,
  onDeleteSection,
}) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [tempName, setTempName] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [newSectionName, setNewSectionName] = useState('');

  const handleStartRename = (sec: SongSection, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingId(sec.id);
    setTempName(sec.name);
  };

  const handleSaveRename = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (tempName.trim()) {
      onRenameSection(id, tempName.trim());
    }
    setEditingId(null);
  };

  const handleConfirmAdd = () => {
    if (newSectionName.trim()) {
      onAddSection(newSectionName.trim());
      setNewSectionName('');
      setIsAdding(false);
    }
  };

  return (
    <div className="h-12 bg-bg-app border-b border-border-subtle/60 px-3 md:px-5 flex items-center gap-2 overflow-x-auto no-scrollbar select-none">
      <span className="text-xs font-semibold text-text-secondary uppercase tracking-wider hidden sm:inline mr-1">
        Sections:
      </span>

      {sections.map((section) => {
        const isActive = section.id === activeSectionId;
        const isEditing = editingId === section.id;

        if (isEditing) {
          return (
            <div
              key={section.id}
              className="flex items-center gap-1 bg-bg-elevated px-2 py-1 rounded-xl border border-accent-primary"
            >
              <input
                type="text"
                value={tempName}
                onChange={(e) => setTempName(e.target.value)}
                autoFocus
                className="bg-transparent text-xs text-text-primary outline-none w-20 px-1 font-medium"
              />
              <button
                onClick={(e) => handleSaveRename(section.id, e)}
                className="p-1 hover:text-emerald-400 text-text-primary"
              >
                <Check className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setEditingId(null);
                }}
                className="p-1 hover:text-rose-400 text-text-secondary"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          );
        }

        return (
          <div
            key={section.id}
            onClick={() => onSelectSection(section.id)}
            className={`group relative flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold cursor-pointer transition-all duration-150 shrink-0 select-none ${
              isActive
                ? 'bg-accent-primary text-white shadow-md shadow-accent-primary/20 scale-[1.02]'
                : 'bg-bg-elevated text-text-secondary hover:text-text-primary hover:bg-border-subtle'
            }`}
          >
            <span>{section.name}</span>
            <span className="text-[10px] opacity-75 font-mono">({section.chords.length})</span>

            {/* Quick edit & delete icons on active section */}
            {isActive && sections.length > 1 && (
              <div className="flex items-center gap-1 ml-1 pl-1 border-l border-white/20">
                <button
                  onClick={(e) => handleStartRename(section, e)}
                  title="Rename section"
                  className="opacity-70 hover:opacity-100 p-0.5"
                >
                  <Edit2 className="w-2.5 h-2.5" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (confirm(`Delete section "${section.name}"?`)) {
                      onDeleteSection(section.id);
                    }
                  }}
                  title="Delete section"
                  className="opacity-70 hover:opacity-100 hover:text-rose-300 p-0.5"
                >
                  <Trash2 className="w-2.5 h-2.5" />
                </button>
              </div>
            )}
          </div>
        );
      })}

      {/* Add New Section */}
      {isAdding ? (
        <div className="flex items-center gap-1 bg-bg-elevated px-2 py-1 rounded-xl border border-accent-primary shrink-0">
          <input
            type="text"
            placeholder="e.g. Solo"
            value={newSectionName}
            onChange={(e) => setNewSectionName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleConfirmAdd()}
            autoFocus
            className="bg-transparent text-xs text-text-primary outline-none w-20 px-1 font-medium"
          />
          <button onClick={handleConfirmAdd} className="p-1 hover:text-emerald-400 text-text-primary">
            <Check className="w-3.5 h-3.5" />
          </button>
          <button onClick={() => setIsAdding(false)} className="p-1 hover:text-rose-400 text-text-secondary">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      ) : (
        <button
          onClick={() => setIsAdding(true)}
          className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-bg-surface hover:bg-bg-elevated text-text-secondary hover:text-accent-primary border border-border-subtle/60 text-xs font-medium transition-all shrink-0 active:scale-95"
        >
          <Plus className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Add Section</span>
        </button>
      )}
    </div>
  );
};
