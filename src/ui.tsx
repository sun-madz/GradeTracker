import { useEffect, useState, type ReactNode } from 'react';
import type { Letter } from './types';
import { gradeTone, LETTERS } from './grading';

export function GradePill({ letter, confirmed, size = 'md' }: { letter: Letter | null; confirmed?: boolean; size?: 'md' | 'lg' }) {
  return (
    <span className={`pill tone-${gradeTone(letter)} ${confirmed ? 'solid' : 'soft'} ${size}`} title={confirmed ? 'From transcript' : 'Predicted'}>
      {letter ?? '–'}
    </span>
  );
}

export function NumInput({ value, onChange, placeholder, className, ariaLabel }: {
  value: number | null; onChange: (v: number | null) => void; placeholder?: string; className?: string; ariaLabel?: string;
}) {
  const [text, setText] = useState(value === null || value === undefined ? '' : String(value));
  useEffect(() => {
    const parsed = text.trim() === '' ? null : Number(text);
    if (parsed !== value) setText(value === null || value === undefined ? '' : String(value));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);
  return (
    <input
      className={`num ${className ?? ''}`} inputMode="decimal" value={text} placeholder={placeholder} aria-label={ariaLabel}
      onChange={(e) => {
        const t = e.target.value.replace(',', '.');
        if (!/^\d*\.?\d*$/.test(t)) return;
        setText(t);
        if (t === '' ) onChange(null);
        else if (!t.endsWith('.') && Number.isFinite(Number(t))) onChange(Number(t));
      }}
      onFocus={(e) => e.target.select()}
    />
  );
}

export function TopBar({ title, back, right }: { title?: string; back?: () => void; right?: ReactNode }) {
  return (
    <header className="topbar">
      <div className="topbar-side">{back && <button className="icon-btn" onClick={back} aria-label="Back"><Chevron dir="left" /></button>}</div>
      <div className="topbar-title">{title}</div>
      <div className="topbar-side right">{right}</div>
    </header>
  );
}

export function Sheet({ open, onClose, title, children }: { open: boolean; onClose: () => void; title: string; children: ReactNode }) {
  useEffect(() => {
    if (!open) return;
    const k = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', k);
    return () => window.removeEventListener('keydown', k);
  }, [open, onClose]);
  if (!open) return null;
  return (
    <div className="sheet-backdrop" onClick={onClose}>
      <div className="sheet" role="dialog" aria-label={title} onClick={(e) => e.stopPropagation()}>
        <div className="sheet-handle" />
        <div className="sheet-head"><h3>{title}</h3><button className="link" onClick={onClose}>Done</button></div>
        <div className="sheet-body">{children}</div>
      </div>
    </div>
  );
}

export function LetterPicker({ value, onChange, allowNone = true }: { value: Letter | null; onChange: (l: Letter | null) => void; allowNone?: boolean }) {
  return (
    <div className="letter-grid">
      {allowNone && <button className={`chip ${value === null ? 'on' : ''}`} onClick={() => onChange(null)}>None</button>}
      {LETTERS.map((l) => (
        <button key={l} className={`chip ${value === l ? 'on' : ''}`} onClick={() => onChange(l)}>{l}</button>
      ))}
    </div>
  );
}

export function Toggle({ on, onChange, label }: { on: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <button className="row toggle-row" onClick={() => onChange(!on)} role="switch" aria-checked={on}>
      <span>{label}</span><span className={`switch ${on ? 'on' : ''}`}><span /></span>
    </button>
  );
}

export function Chevron({ dir = 'right' }: { dir?: 'left' | 'right' }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      {dir === 'right' ? <path d="M9 6l6 6-6 6" /> : <path d="M15 6l-6 6 6 6" />}
    </svg>
  );
}

export function Icon({ name }: { name: 'grades' | 'book' | 'gear' | 'plus' | 'more' | 'trash' | 'cloud' }) {
  const p = { width: 22, height: 22, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.8, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const, 'aria-hidden': true };
  switch (name) {
    case 'grades': return <svg {...p}><path d="M4 20V10M10 20V4M16 20v-7M22 20H2" /></svg>;
    case 'book': return <svg {...p}><path d="M4 5a2 2 0 0 1 2-2h13v16H6a2 2 0 0 0-2 2V5z" /><path d="M8 7h7" /></svg>;
    case 'gear': return <svg {...p}><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z" /></svg>;
    case 'plus': return <svg {...p}><path d="M12 5v14M5 12h14" /></svg>;
    case 'more': return <svg {...p}><circle cx="5" cy="12" r="1" /><circle cx="12" cy="12" r="1" /><circle cx="19" cy="12" r="1" /></svg>;
    case 'trash': return <svg {...p}><path d="M3 6h18M8 6V4h8v2M6 6l1 14h10l1-14" /></svg>;
    case 'cloud': return <svg {...p}><path d="M17.5 19H7a5 5 0 1 1 1-9.9A6 6 0 0 1 19 11a4 4 0 0 1-1.5 8z" /></svg>;
  }
}
