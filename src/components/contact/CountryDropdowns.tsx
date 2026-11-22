'use client';

/**
 * Custom dropdowns for country + dial-code selection.
 * Flag images: Twemoji SVGs stored locally at /assets/flags/{iso2_lower}.svg
 * Twemoji © Twitter / jdecked — CC BY 4.0 (https://creativecommons.org/licenses/by/4.0/)
 * Source: https://github.com/jdecked/twemoji
 */

import { useEffect, useRef, useState } from 'react';
import { ChevronDown, Search, X } from 'lucide-react';
import { COUNTRIES } from '@/data/countries';

// ─── Flag image component ─────────────────────────────────────────────────────
function Flag({ code, size = 20 }: { code: string; size?: number }) {
  const src = `/assets/flags/${code.toLowerCase()}.svg`;
  return (
    <img
      src={src}
      alt={code}
      width={size}
      height={size}
      style={{ width: size, height: size, objectFit: 'contain', display: 'inline-block', flexShrink: 0 }}
      // Fallback: hide broken image, show nothing (flag just disappears gracefully)
      onError={e => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }}
      aria-hidden="true"
      draggable={false}
    />
  );
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
// Full-width searchable dropdown: flag image + country name in every row.

interface CountrySelectProps {
  value: string;        // ISO code
  onChange: (code: string) => void;
  id?: string;
}

export function CountrySelect({ value, onChange, id }: CountrySelectProps) {
  const [open, setOpen]   = useState(false);
  const [query, setQuery] = useState('');
  const wrapRef           = useRef<HTMLDivElement>(null);
  const searchRef         = useRef<HTMLInputElement>(null);
  const listRef           = useRef<HTMLUListElement>(null);

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
    function onDown(e: MouseEvent) {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false);
    }
    function onKey(e: KeyboardEvent) { if (e.key === 'Escape') setOpen(false); }
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => { document.removeEventListener('mousedown', onDown); document.removeEventListener('keydown', onKey); };
  }, [open]);

  // Auto-focus search, scroll selected into view
  useEffect(() => {
    if (open) {
      setTimeout(() => searchRef.current?.focus(), 30);
      const el = listRef.current?.querySelector('[data-selected="true"]');
      el?.scrollIntoView({ block: 'nearest' });
    } else {
      setQuery('');
    }
  }, [open]);

  function pick(code: string) { onChange(code); setOpen(false); }

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
            <Flag code={selected.code} size={20} />
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

      {/* Dropdown panel */}
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
              <button type="button" onClick={() => setQuery('')} aria-label="Clear search"
                className="shrink-0 text-[var(--text-muted)] hover:text-[var(--accent)]">
                <X size={13} />
              </button>
            )}
          </div>

          {/* List */}
          <ul ref={listRef} role="listbox" aria-label="Countries"
            className="max-h-60 overflow-y-auto overscroll-contain">
            {filtered.length === 0 ? (
              <li className="px-4 py-3 text-sm text-[var(--text-muted)]">No countries found.</li>
            ) : filtered.map(c => (
              <li
                key={c.code}
                role="option"
                aria-selected={c.code === value}
                data-selected={c.code === value}
                onClick={() => pick(c.code)}
                className={`${optionCls} ${c.code === value ? optionActiveCls : ''}`}
              >
                <Flag code={c.code} size={20} />
                <span className="flex-1 truncate">{c.name}</span>
                <span className="ml-auto shrink-0 font-mono text-xs text-[var(--text-muted)]">{c.dialCode}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

// ─── DialCodeSelect ───────────────────────────────────────────────────────────
// Compact 112px trigger showing flag + dial code. Dropdown is wider (260px)
// and shows flag + country name + dial code per row.

interface DialCodeSelectProps {
  value: string;        // ISO code
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
    function onDown(e: MouseEvent) {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false);
    }
    function onKey(e: KeyboardEvent) { if (e.key === 'Escape') setOpen(false); }
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => { document.removeEventListener('mousedown', onDown); document.removeEventListener('keydown', onKey); };
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

  function pick(code: string) { onChange(code); setOpen(false); }

  return (
    <div ref={wrapRef} className="relative shrink-0" style={{ width: 112 }}>
      {/* Trigger — flag + dial code only */}
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label="Country calling code"
        onClick={() => setOpen(o => !o)}
        className={`${triggerCls} justify-between px-3`}
      >
        {selected ? (
          <>
            <Flag code={selected.code} size={18} />
            <span className="font-mono text-xs">{selected.dialCode}</span>
          </>
        ) : (
          <span className="font-mono text-xs text-[var(--text-muted)]/65">+___</span>
        )}
        <ChevronDown
          size={12}
          className={`shrink-0 text-[var(--text-muted)] transition-transform ${open ? 'rotate-180' : ''}`}
          aria-hidden="true"
        />
      </button>

      {/* Dropdown — wider than trigger */}
      {open && (
        <div className={`${dropdownCls} left-0`} style={{ width: 268 }}>
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
              <button type="button" onClick={() => setQuery('')} aria-label="Clear"
                className="shrink-0 text-[var(--text-muted)] hover:text-[var(--accent)]">
                <X size={13} />
              </button>
            )}
          </div>

          {/* List */}
          <ul ref={listRef} role="listbox" aria-label="Calling codes"
            className="max-h-60 overflow-y-auto overscroll-contain">
            {filtered.length === 0 ? (
              <li className="px-4 py-3 text-sm text-[var(--text-muted)]">No results.</li>
            ) : filtered.map(c => (
              <li
                key={c.code}
                role="option"
                aria-selected={c.code === value}
                data-selected={c.code === value}
                onClick={() => pick(c.code)}
                className={`${optionCls} ${c.code === value ? optionActiveCls : ''}`}
              >
                <Flag code={c.code} size={20} />
                <span className="flex-1 truncate text-xs">{c.name}</span>
                <span className="ml-2 shrink-0 font-mono text-xs text-[var(--text-muted)]">{c.dialCode}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
