'use client';

/**
 * Custom dropdowns for country + dial-code selection.
 * Uses a React-rendered list so flag emojis render correctly on all browsers/OS,
 * unlike native <select>/<datalist> which ignore emoji on Windows Chrome/Edge.
 */

import { useEffect, useRef, useState } from 'react';
import { ChevronDown, Search, X } from 'lucide-react';
import { COUNTRIES, type Country } from '@/data/countries';

function flagEmoji(code: string) {
  return Array.from(code.toUpperCase())
    .map(c => String.fromCodePoint(127397 + c.charCodeAt(0)))
    .join('');
}

// ─── Shared styles ────────────────────────────────────────────────────────────
const triggerCls =
  'flex w-full min-w-0 items-center gap-2 rounded-lg border border-[var(--border)] bg-[var(--bg)] px-3.5 py-3.5 text-sm text-[var(--text)] transition-colors focus:border-[var(--accent)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/20 cursor-pointer select-none';
const dropdownCls =
  'absolute z-50 mt-1 w-full min-w-[220px] rounded-lg border border-[var(--border)] bg-[var(--surface)] shadow-[0_8px_32px_rgba(0,0,0,0.28)] overflow-hidden';
const optionCls =
  'flex items-center gap-3 px-3.5 py-2.5 text-sm text-[var(--text)] cursor-pointer transition-colors hover:bg-[var(--accent-dim)] hover:text-[var(--accent)]';
const optionActiveCls = 'bg-[var(--accent-dim)] text-[var(--accent)]';

// ─── CountrySelect ────────────────────────────────────────────────────────────
// Full-width searchable dropdown: shows "🇮🇳 India" in list and trigger.

interface CountrySelectProps {
  value: string;           // ISO code
  onChange: (code: string) => void;
  id?: string;
}

export function CountrySelect({ value, onChange, id }: CountrySelectProps) {
  const [open, setOpen]       = useState(false);
  const [query, setQuery]     = useState('');
  const wrapRef               = useRef<HTMLDivElement>(null);
  const searchRef             = useRef<HTMLInputElement>(null);
  const listRef               = useRef<HTMLUListElement>(null);

  const selected = COUNTRIES.find(c => c.code === value) ?? null;

  const filtered = query.trim()
    ? COUNTRIES.filter(c =>
        c.name.toLowerCase().includes(query.toLowerCase()) ||
        c.code.toLowerCase().includes(query.toLowerCase()) ||
        c.dialCode.includes(query)
      )
    : COUNTRIES;

  // Close on outside click / Escape
  useEffect(() => {
    if (!open) return;
    function handleDown(e: MouseEvent) {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false);
    }
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false);
    }
    document.addEventListener('mousedown', handleDown);
    document.addEventListener('keydown', handleKey);
    return () => {
      document.removeEventListener('mousedown', handleDown);
      document.removeEventListener('keydown', handleKey);
    };
  }, [open]);

  // Focus search when opened, scroll selected item into view
  useEffect(() => {
    if (open) {
      setTimeout(() => searchRef.current?.focus(), 30);
      // Scroll selected option into view
      const el = listRef.current?.querySelector('[data-selected="true"]');
      el?.scrollIntoView({ block: 'nearest' });
    } else {
      setQuery('');
    }
  }, [open]);

  function pick(code: string) {
    onChange(code);
    setOpen(false);
  }

  return (
    <div ref={wrapRef} className="relative w-full">
      {/* Trigger */}
      <button
        type="button"
        id={id}
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen(o => !o)}
        className={triggerCls}
      >
        {selected ? (
          <>
            <span className="text-xl leading-none" aria-hidden="true">{flagEmoji(selected.code)}</span>
            <span className="flex-1 truncate text-left">{selected.name}</span>
          </>
        ) : (
          <span className="flex-1 truncate text-left text-[var(--text-muted)]/65">Search country…</span>
        )}
        <ChevronDown
          size={16}
          className={`ml-auto shrink-0 text-[var(--text-muted)] transition-transform ${open ? 'rotate-180' : ''}`}
          aria-hidden="true"
        />
      </button>

      {/* Dropdown */}
      {open && (
        <div className={dropdownCls}>
          {/* Search bar */}
          <div className="flex items-center gap-2 border-b border-[var(--border)] px-3 py-2">
            <Search size={14} className="shrink-0 text-[var(--text-muted)]" aria-hidden="true" />
            <input
              ref={searchRef}
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Search countries…"
              className="flex-1 bg-transparent text-sm text-[var(--text)] placeholder:text-[var(--text-muted)]/60 focus:outline-none"
              aria-label="Search countries"
            />
            {query && (
              <button type="button" onClick={() => setQuery('')} className="shrink-0 text-[var(--text-muted)] hover:text-[var(--accent)]" aria-label="Clear search">
                <X size={13} />
              </button>
            )}
          </div>

          {/* List */}
          <ul
            ref={listRef}
            role="listbox"
            aria-label="Countries"
            className="max-h-60 overflow-y-auto overscroll-contain"
          >
            {filtered.length === 0 ? (
              <li className="px-4 py-3 text-sm text-[var(--text-muted)]">No countries found.</li>
            ) : (
              filtered.map(c => (
                <li
                  key={c.code}
                  role="option"
                  aria-selected={c.code === value}
                  data-selected={c.code === value}
                  onClick={() => pick(c.code)}
                  className={`${optionCls} ${c.code === value ? optionActiveCls : ''}`}
                >
                  <span className="text-xl leading-none w-7 shrink-0 text-center" aria-hidden="true">
                    {flagEmoji(c.code)}
                  </span>
                  <span className="flex-1 truncate">{c.name}</span>
                  <span className="ml-auto shrink-0 font-mono text-xs text-[var(--text-muted)]">{c.dialCode}</span>
                </li>
              ))
            )}
          </ul>
        </div>
      )}
    </div>
  );
}

// ─── DialCodeSelect ───────────────────────────────────────────────────────────
// Compact dropdown (~112px): shows "🇮🇳 +91" in trigger and list.

interface DialCodeSelectProps {
  value: string;           // ISO code
  onChange: (code: string) => void;
}

export function DialCodeSelect({ value, onChange }: DialCodeSelectProps) {
  const [open, setOpen]   = useState(false);
  const [query, setQuery] = useState('');
  const wrapRef           = useRef<HTMLDivElement>(null);
  const searchRef         = useRef<HTMLInputElement>(null);
  const listRef           = useRef<HTMLUListElement>(null);

  const selected = COUNTRIES.find(c => c.code === value) ?? null;

  const filtered = query.trim()
    ? COUNTRIES.filter(c =>
        c.name.toLowerCase().includes(query.toLowerCase()) ||
        c.dialCode.includes(query) ||
        c.code.toLowerCase().includes(query.toLowerCase())
      )
    : COUNTRIES;

  useEffect(() => {
    if (!open) return;
    function handleDown(e: MouseEvent) {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false);
    }
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false);
    }
    document.addEventListener('mousedown', handleDown);
    document.addEventListener('keydown', handleKey);
    return () => {
      document.removeEventListener('mousedown', handleDown);
      document.removeEventListener('keydown', handleKey);
    };
  }, [open]);

  useEffect(() => {
    if (open) {
      setTimeout(() => searchRef.current?.focus(), 30);
      const el = listRef.current?.querySelector('[data-selected="true"]');
      el?.scrollIntoView({ block: 'nearest' });
    } else {
      setQuery('');
    }
  }, [open]);

  function pick(code: string) {
    onChange(code);
    setOpen(false);
  }

  return (
    // Position relative + z-index so dropdown overlaps the phone input
    <div ref={wrapRef} className="relative shrink-0" style={{ width: 112 }}>
      {/* Trigger */}
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label="Country calling code"
        onClick={() => setOpen(o => !o)}
        className={`${triggerCls} justify-between`}
      >
        {selected ? (
          <>
            <span className="text-xl leading-none" aria-hidden="true">{flagEmoji(selected.code)}</span>
            <span className="font-mono text-xs">{selected.dialCode}</span>
          </>
        ) : (
          <span className="font-mono text-xs text-[var(--text-muted)]/65">+___</span>
        )}
        <ChevronDown
          size={13}
          className={`shrink-0 text-[var(--text-muted)] transition-transform ${open ? 'rotate-180' : ''}`}
          aria-hidden="true"
        />
      </button>

      {/* Dropdown — wider than trigger so it's readable */}
      {open && (
        <div className={`${dropdownCls} left-0`} style={{ width: 260 }}>
          {/* Search */}
          <div className="flex items-center gap-2 border-b border-[var(--border)] px-3 py-2">
            <Search size={14} className="shrink-0 text-[var(--text-muted)]" aria-hidden="true" />
            <input
              ref={searchRef}
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Country or code…"
              className="flex-1 bg-transparent text-sm text-[var(--text)] placeholder:text-[var(--text-muted)]/60 focus:outline-none"
              aria-label="Search calling code"
            />
            {query && (
              <button type="button" onClick={() => setQuery('')} className="shrink-0 text-[var(--text-muted)] hover:text-[var(--accent)]" aria-label="Clear">
                <X size={13} />
              </button>
            )}
          </div>

          {/* List */}
          <ul
            ref={listRef}
            role="listbox"
            aria-label="Calling codes"
            className="max-h-60 overflow-y-auto overscroll-contain"
          >
            {filtered.length === 0 ? (
              <li className="px-4 py-3 text-sm text-[var(--text-muted)]">No results.</li>
            ) : (
              filtered.map(c => (
                <li
                  key={c.code}
                  role="option"
                  aria-selected={c.code === value}
                  data-selected={c.code === value}
                  onClick={() => pick(c.code)}
                  className={`${optionCls} ${c.code === value ? optionActiveCls : ''}`}
                >
                  <span className="text-xl leading-none w-7 shrink-0 text-center" aria-hidden="true">
                    {flagEmoji(c.code)}
                  </span>
                  <span className="flex-1 truncate text-xs">{c.name}</span>
                  <span className="ml-2 shrink-0 font-mono text-xs text-[var(--text-muted)]">{c.dialCode}</span>
                </li>
              ))
            )}
          </ul>
        </div>
      )}
    </div>
  );
}
