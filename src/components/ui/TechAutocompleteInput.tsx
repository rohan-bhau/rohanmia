'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Plus, Sparkles, ChevronDown } from 'lucide-react';
import TechBadge from './TechBadge';
import { getAvailableTechSuggestions, TechSuggestion } from '@/actions/adminStack';

interface TechAutocompleteInputProps {
  onAddTech: (techName: string) => void;
  placeholder?: string;
  className?: string;
  buttonText?: string;
}

export default function TechAutocompleteInput({
  onAddTech,
  placeholder = 'Type tech name (e.g. Next.js, Docker, PostgreSQL)...',
  className = '',
  buttonText = 'Add'
}: TechAutocompleteInputProps) {
  const [query, setQuery] = useState('');
  const [allSuggestions, setAllSuggestions] = useState<TechSuggestion[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Fetch suggestions from database
  useEffect(() => {
    let isMounted = true;
    getAvailableTechSuggestions().then((items) => {
      if (isMounted && Array.isArray(items)) {
        setAllSuggestions(items);
      }
    }).catch(console.error);
    return () => {
      isMounted = false;
    };
  }, []);

  // Filter suggestions based on query
  const filteredSuggestions = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) {
      return allSuggestions.slice(0, 8); // show popular 8 by default when focused
    }
    return allSuggestions.filter((item) =>
      item.name.toLowerCase().includes(q)
    ).slice(0, 10);
  }, [allSuggestions, query]);

  // Click outside to close
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
        setHighlightedIndex(-1);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (name: string) => {
    if (!name.trim()) return;
    onAddTech(name.trim());
    setQuery('');
    setIsOpen(false);
    setHighlightedIndex(-1);
    inputRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setIsOpen(true);
      setHighlightedIndex((prev) =>
        prev < filteredSuggestions.length - 1 ? prev + 1 : 0
      );
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setIsOpen(true);
      setHighlightedIndex((prev) =>
        prev > 0 ? prev - 1 : filteredSuggestions.length - 1
      );
    } else if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      if (isOpen && highlightedIndex >= 0 && filteredSuggestions[highlightedIndex]) {
        handleSelect(filteredSuggestions[highlightedIndex].name);
      } else if (query.trim()) {
        handleSelect(query);
      }
    } else if (e.key === 'Escape') {
      setIsOpen(false);
      setHighlightedIndex(-1);
    }
  };

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <div className="flex gap-2">
        <div className="relative flex-1">
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setIsOpen(true);
              setHighlightedIndex(-1);
            }}
            onFocus={() => setIsOpen(true)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            className="w-full px-3.5 py-2 rounded-xl bg-white/[0.04] border border-white/[0.08] text-xs text-white placeholder:text-neutral-500 focus:outline-none focus:border-white/30 font-mono transition-all pr-8"
          />
          <button
            type="button"
            tabIndex={-1}
            onClick={() => {
              setIsOpen(!isOpen);
              inputRef.current?.focus();
            }}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-neutral-300 transition-colors"
          >
            <ChevronDown size={14} className={`transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
          </button>
        </div>

        <button
          type="button"
          onClick={() => {
            if (query.trim()) {
              handleSelect(query);
            }
          }}
          disabled={!query.trim()}
          className="px-4 py-2 rounded-xl bg-white/[0.08] hover:bg-white/[0.15] text-xs font-mono text-white transition-all cursor-pointer border border-white/10 flex items-center gap-1.5 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <Plus size={13} />
          <span>{buttonText}</span>
        </button>
      </div>

      {/* Autocomplete Dropdown */}
      {isOpen && filteredSuggestions.length > 0 && (
        <div className="absolute left-0 right-0 top-full mt-1.5 z-50 rounded-2xl bg-[#0e1017]/95 backdrop-blur-xl border border-white/[0.12] shadow-2xl shadow-black/80 overflow-hidden max-h-64 overflow-y-auto">
          <div className="px-3 py-1.5 border-b border-white/[0.06] flex items-center justify-between text-[10px] font-mono text-neutral-400 bg-white/[0.02]">
            <span className="flex items-center gap-1.5">
              <Sparkles size={11} className="text-amber-400" />
              <span>Suggested Technologies (from DB)</span>
            </span>
            <span>&uarr;&darr; to navigate &bull; Enter to pick</span>
          </div>

          <div className="p-1 space-y-0.5">
            {filteredSuggestions.map((item, idx) => {
              const isSelected = idx === highlightedIndex;
              return (
                <div
                  key={item.name}
                  onClick={() => handleSelect(item.name)}
                  onMouseEnter={() => setHighlightedIndex(idx)}
                  className={`flex items-center justify-between px-2.5 py-1.5 rounded-xl cursor-pointer transition-colors text-xs ${
                    isSelected
                      ? 'bg-white/[0.12] text-white'
                      : 'hover:bg-white/[0.06] text-neutral-300'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <TechBadge name={item.name} size="sm" />
                  </div>
                  {item.category_name && (
                    <span className="text-[10px] font-mono text-neutral-500">
                      {item.category_name}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
