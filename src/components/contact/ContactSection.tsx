'use client';

import { useEffect, useState, type FormEvent } from 'react';
import { ArrowUpRight, Mail, MessageCircle, Phone, X } from 'lucide-react';
import { profile } from '@/data/profile';
import { COUNTRIES } from '@/data/countries';
import Button from '@/components/ui/Button';
import { CountrySelect, DialCodeSelect } from './CountryDropdowns';

/*
 * Location data source: openadmindata.org (public, no API key, CORS-open)
 * URL pattern: https://api.openadmindata.org/api/v1/countries/{iso2_lower}.json
 * Response shape: { meta: { levels: [{ key, name_en }] }, data: { [key]: AdminRecord[] } }
 * AdminRecord: { id, name_en, slug?, parent_id? }
 * Coverage verified: IN, GB, US, DE, AU, CA, FR, JP, CN, PK, NG, ZA, MV and many more.
 * Countries without location data return 404 — handled with an informative message.
 */
const LOCATION_API = 'https://api.openadmindata.org/api/v1';

type AdminRecord = { id: string; name_en: string; slug?: string; parent_id?: string | null };
type LocationData = { meta: { levels: Array<{ key: string; name_en: string }> }; data: Record<string, AdminRecord[]> };
type ContactDraft = Record<string, string>;

const fieldCls = 'w-full min-w-0 rounded-lg border border-[var(--border)] bg-[var(--bg)] px-4 py-3.5 text-[var(--text)] placeholder:text-[var(--text-muted)]/65 transition-colors focus:border-[var(--accent)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/20';
const labelCls = 'mb-2 block font-mono text-[0.65rem] font-medium uppercase tracking-[0.16em] text-[var(--text-muted)]';

function flagEmoji(code: string) {
  return Array.from(code.toUpperCase()).map(c => String.fromCodePoint(127397 + c.charCodeAt(0))).join('');
}

function SocialIcon({ kind, size = 19 }: { kind: 'github' | 'instagram' | 'linkedin'; size?: number }) {
  if (kind === 'github') return <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2C6.477 2 2 6.484 2 12.021c0 4.428 2.865 8.185 6.839 9.504.5.092.682-.217.682-.482 0-.237-.009-.868-.013-1.703-2.782.605-3.369-1.342-3.369-1.342-.454-1.154-1.11-1.462-1.11-1.462-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0 1 12 6.844a9.59 9.59 0 0 1 2.504.337c1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0 0 22 12.021C22 6.484 17.522 2 12 2z" /></svg>;
  if (kind === 'linkedin') return <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 22.222 22.271V1.729C22.222.774 22.222 0 22.222 0h.003z" /></svg>;
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="5" /><circle cx="12" cy="12" r="4" /><circle cx="17.5" cy="6.7" r=".8" fill="currentColor" stroke="none" /></svg>;
}

function ContactDetail({ icon: Icon, label, value, href }: { icon: typeof Mail; label: string; value: string; href: string }) {
  return <a href={href} className="group flex min-w-0 items-center gap-4 border-b border-[var(--border)] py-4 transition-colors hover:text-[var(--accent)]"><span className="grid h-11 w-11 shrink-0 place-items-center rounded-full border border-[var(--border)] bg-[var(--surface-2)] text-[var(--accent)] group-hover:border-[var(--accent)]"><Icon size={18} aria-hidden="true" /></span><span className="min-w-0 flex-1"><span className="block font-mono text-[0.62rem] uppercase tracking-[0.16em] text-[var(--text-muted)]">{label}</span><span className="mt-1 block break-all text-sm font-medium text-[var(--text)] sm:text-base">{value}</span></span><ArrowUpRight size={16} className="shrink-0 text-[var(--text-muted)] group-hover:text-[var(--accent)]" aria-hidden="true" /></a>;
}

export default function ContactSection() {
  // ── Country selection ──────────────────────────────────────────────────────
  const [countryCode, setCountryCode] = useState('');
  const country = COUNTRIES.find(c => c.code === countryCode) ?? null;

  // ── Location data (openadmindata.org) ─────────────────────────────────────
  const [locationData, setLocationData]     = useState<LocationData | null>(null);
  const [loadedFor, setLoadedFor]           = useState('');   // which code was successfully loaded
  const [locLoading, setLocLoading]         = useState(false);
  const [locError, setLocError]             = useState('');
  const [locUnsupported, setLocUnsupported] = useState(false);
  const [retryKey, setRetryKey]             = useState(0);

  // ── Admin-area selections ──────────────────────────────────────────────────
  const [level1Id, setLevel1Id] = useState('');
  const [level2Id, setLevel2Id] = useState('');

  // ── Form / send-options state ──────────────────────────────────────────────
  const [sendOpen, setSendOpen]       = useState(false);
  const [draft, setDraft]             = useState<ContactDraft | null>(null);
  const [submitError, setSubmitError] = useState('');

  const whatsappNumber = profile.links.whatsapp;

  // ── Derived location data ─────────────────────────────────────────────────
  // Only use data whose loadedFor matches the current country to avoid
  // showing stale data from a previous selection while loading.
  const activeData = loadedFor === countryCode ? locationData : null;
  const levels     = activeData?.meta?.levels ?? [];
  const l1Key      = levels[0]?.key ?? '';
  const l2Key      = levels[1]?.key ?? '';
  const l1Label    = levels[0]?.name_en || 'State / Region';
  const l2Label    = levels[1]?.name_en || 'District / Local Area';
  const l1Items    = l1Key ? (activeData?.data?.[l1Key] ?? []) : [];
  const l2Items    = l2Key ? (activeData?.data?.[l2Key] ?? []) : [];
  const selectedL1 = l1Items.find(r => r.id === level1Id) ?? null;
  // Filter level-2 items whose parent_id matches the selected level-1 id
  const filteredL2 = level1Id
    ? l2Items.filter(r => r.parent_id === level1Id || r.parent_id === selectedL1?.id)
    : [];
  const hasL2Data  = !!l2Key;
  const l2Required = hasL2Data && filteredL2.length > 0;

  // ── Fetch location data when country changes ───────────────────────────────
  useEffect(() => {
    if (!countryCode) return;

    // Reset dependent selections immediately
    setLevel1Id('');
    setLevel2Id('');
    setLocationData(null);
    setLoadedFor('');
    setLocUnsupported(false);
    setLocError('');
    setLocLoading(true);

    const ctrl = new AbortController();
    fetch(`${LOCATION_API}/countries/${countryCode.toLowerCase()}.json`, { signal: ctrl.signal })
      .then(async res => {
        if (res.status === 404) {
          setLocUnsupported(true);
          return;
        }
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json: LocationData = await res.json();
        if (!json?.meta?.levels || !json?.data) throw new Error('Unexpected response format.');
        setLocationData(json);
        setLoadedFor(countryCode);
      })
      .catch((err: unknown) => {
        if (err instanceof Error && err.name === 'AbortError') return;
        setLocError(
          err instanceof Error ? err.message : 'Location data could not be loaded.'
        );
      })
      .finally(() => {
        if (!ctrl.signal.aborted) setLocLoading(false);
      });

    return () => ctrl.abort();
  }, [countryCode, retryKey]);

  // ── Escape closes send-options modal ──────────────────────────────────────
  useEffect(() => {
    if (!sendOpen) return;
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') setSendOpen(false); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [sendOpen]);

  // ── Country selection helper ──────────────────────────────────────────────
  function selectCountryByCode(code: string) {
    setCountryCode(code || '');
    if (!code) { setLevel1Id(''); setLevel2Id(''); }
  }

  // ── Form submission ───────────────────────────────────────────────────────
  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    // Validation: country required; level-1 required when data exists;
    // level-2 required only when it has options for the selected level-1.
    if (!country) { setSubmitError('Please select a country.'); return; }
    if (activeData && !locUnsupported && !level1Id) {
      setSubmitError(`Please select a ${l1Label.toLowerCase()}.`); return;
    }
    if (l2Required && !level2Id) {
      setSubmitError(`Please select a ${l2Label.toLowerCase()}.`); return;
    }
    setSubmitError('');

    const raw = Object.fromEntries(new FormData(e.currentTarget).entries());
    const values = Object.fromEntries(Object.entries(raw).map(([k, v]) => [k, String(v).trim()]));

    setDraft({
      ...values,
      country:  country.name,
      dialCode: country.dialCode,
      region:   selectedL1?.name_en ?? '',
      local:    filteredL2.find(r => r.id === level2Id)?.name_en ?? '',
    });
    setSendOpen(true);
  }

  // ── Message body ──────────────────────────────────────────────────────────
  const locationStr = draft
    ? [draft.local, draft.region, draft.country].filter(Boolean).join(', ')
    : '';

  const messageBody = draft
    ? `Hi Harshit,\n\n${draft.message || '(No message added)'}\n\nName: ${draft.firstName} ${draft.lastName}\nEmail: ${draft.email}\nPhone: ${draft.phone ? `${draft.dialCode} ${draft.phone}` : 'Not provided'}\nLocation: ${locationStr}${draft.company ? `\nCompany / institute: ${draft.company}` : ''}${draft.interest ? `\nRole / technical interest: ${draft.interest}` : ''}`
    : '';

  const emailHref = `mailto:${profile.links.email}?subject=${encodeURIComponent(`Portfolio message from ${draft?.firstName ?? ''} ${draft?.lastName ?? ''}`)}&body=${encodeURIComponent(messageBody)}`;
  const whatsappHref = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(messageBody)}`;

  return <>
    <main id="main-content" className="relative isolate overflow-hidden px-5 pb-20 pt-28 sm:px-8 sm:pb-24 sm:pt-32 lg:px-12">
      <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[30rem] bg-[radial-gradient(ellipse_at_50%_0%,var(--accent-dim),transparent_67%)] opacity-80" />
      <div className="mx-auto max-w-7xl">
        <header className="mx-auto mb-12 max-w-3xl text-center sm:mb-16">
          <p className="mb-4 inline-flex items-center gap-3 font-mono text-xs uppercase tracking-[0.24em] text-[var(--accent)]"><span className="h-px w-8 bg-[var(--accent)]/60" />Get in touch<span className="h-px w-8 bg-[var(--accent)]/60" /></p>
          <h1 className="font-display text-5xl uppercase leading-[0.92] tracking-wide text-[var(--text)] sm:text-6xl md:text-7xl" style={{ fontFamily: 'var(--font-display)' }}>Let&apos;s build something <span className="text-[var(--accent)]">worth shipping.</span></h1>
          <p className="mx-auto mt-6 max-w-2xl text-sm leading-7 text-[var(--text-muted)] sm:text-base">I&apos;m a developer passionate about building meaningful digital experiences through backend engineering, databases, cloud technologies, and AI. Whether it&apos;s exploring an idea, solving a technical challenge, or collaborating on something impactful, I&apos;m always open to connecting and building together.</p>
        </header>

        <div className="grid items-start gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16">
          {/* ── Left column ── */}
          <section aria-labelledby="contact-direct-heading" className="pt-2 lg:pt-5">
            <p className="font-mono text-[0.65rem] uppercase tracking-[0.2em] text-[var(--text-muted)]">Direct lines</p>
            <h2 id="contact-direct-heading" className="mt-3 font-display text-3xl uppercase tracking-wide text-[var(--text)] sm:text-4xl" style={{ fontFamily: 'var(--font-display)' }}>Find me here</h2>
            <h3 className="mt-6 font-mono text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-[var(--accent)]">Behind the code</h3>
            <p className="mt-2 max-w-lg text-sm leading-7 text-[var(--text-muted)]">Backend-focused developer with a growing interest in full-stack development. I enjoy working with databases, cloud infrastructure, AI-powered solutions, and building practical applications.</p>
            <div className="mt-5 rounded-xl border border-[var(--border)] bg-[var(--surface)]/70 p-4 sm:p-5">
              <h3 className="font-mono text-[0.65rem] font-semibold uppercase tracking-[0.16em] text-[var(--text)]">Currently exploring</h3>
              <ul className="mt-3 grid gap-2 text-sm text-[var(--text-muted)] sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
                {['Backend Development & Database Systems', 'Cloud Computing & DevOps', 'AI & Machine Learning', 'Full-Stack Development'].map(item => <li key={item} className="flex items-start gap-2"><span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--accent)]" />{item}</li>)}
              </ul>
            </div>
            <div className="mt-5">
              <ContactDetail icon={Mail} label="Email" value={profile.links.email} href={`mailto:${profile.links.email}`} />
              <ContactDetail icon={Phone} label="Phone / WhatsApp" value={profile.links.phone} href={`tel:${profile.links.phone.replace(/\s/g, '')}`} />
            </div>
            <div className="mt-6">
              <p className="font-mono text-[0.62rem] uppercase tracking-[0.18em] text-[var(--text-muted)]">Elsewhere online</p>
              <div className="mt-3 flex flex-wrap gap-3">
                <a href={profile.links.instagram} target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="grid h-12 w-12 place-items-center rounded-full border border-[var(--border)] bg-[var(--surface)] text-[var(--text-muted)] transition-all hover:-translate-y-1 hover:border-[var(--accent)] hover:text-[var(--accent)]"><SocialIcon kind="instagram" /></a>
                <a href={profile.links.linkedin} target="_blank" rel="noopener noreferrer" aria-label="LinkedIn" className="grid h-12 w-12 place-items-center rounded-full border border-[var(--border)] bg-[var(--surface)] text-[var(--text-muted)] transition-all hover:-translate-y-1 hover:border-[var(--accent)] hover:text-[var(--accent)]"><SocialIcon kind="linkedin" /></a>
                <a href={profile.links.github} target="_blank" rel="noopener noreferrer" aria-label="GitHub" className="grid h-12 w-12 place-items-center rounded-full border border-[var(--border)] bg-[var(--surface)] text-[var(--text-muted)] transition-all hover:-translate-y-1 hover:border-[var(--accent)] hover:text-[var(--accent)]"><SocialIcon kind="github" /></a>
              </div>
            </div>
          </section>

          {/* ── Right column — form ── */}
          <section aria-labelledby="contact-form-heading" className="min-w-0 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-[0_24px_80px_rgba(0,0,0,0.18)] sm:p-8 lg:p-10">
            <p className="font-mono text-[0.65rem] uppercase tracking-[0.2em] text-[var(--accent)]">A quick introduction</p>
            <h2 id="contact-form-heading" className="mt-3 font-display text-3xl uppercase tracking-wide text-[var(--text)] sm:text-4xl" style={{ fontFamily: 'var(--font-display)' }}>Start a conversation</h2>
            <p className="mt-2 text-sm leading-6 text-[var(--text-muted)]">Share a little context. Your email or WhatsApp app will open with the message ready for you to review.</p>

            <form onSubmit={handleSubmit} className="mt-7 flex min-w-0 flex-col gap-5">
              {/* Name row */}
              <div className="grid min-w-0 gap-5 sm:grid-cols-2">
                <div><label className={labelCls} htmlFor="cf-first">First name <span className="text-[var(--accent)]">*</span></label><input className={fieldCls} id="cf-first" name="firstName" type="text" autoComplete="given-name" placeholder="First name" required /></div>
                <div><label className={labelCls} htmlFor="cf-last">Last name <span className="text-[var(--accent)]">*</span></label><input className={fieldCls} id="cf-last" name="lastName" type="text" autoComplete="family-name" placeholder="Last name" required /></div>
              </div>

              {/* Email */}
              <div><label className={labelCls} htmlFor="cf-email">Email <span className="text-[var(--accent)]">*</span></label><input className={fieldCls} id="cf-email" name="email" type="email" autoComplete="email" placeholder="you@example.com" required /></div>

              {/* ── Country ── */}
              <div>
                <label className={labelCls} htmlFor="cf-country">Country <span className="text-[var(--accent)]">*</span></label>
                <CountrySelect
                  id="cf-country"
                  value={countryCode}
                  onChange={selectCountryByCode}
                />
                <input type="hidden" name="country" value={country?.name ?? ''} />
                <p id="cf-country-hint" className="mt-1.5 text-xs text-[var(--text-muted)]">
                  {country ? `${flagEmoji(country.code)} ${country.name} · ${country.dialCode}` : 'Select your country.'}
                </p>
              </div>

              {/* ── Phone with calling-code selector ── */}
              <div>
                <label className={labelCls} htmlFor="cf-phone">Phone number <span className="normal-case tracking-normal">(optional)</span></label>
                <div className="flex min-w-0 items-stretch gap-2">
                  <DialCodeSelect value={countryCode} onChange={selectCountryByCode} />
                  <input
                    className={`${fieldCls} flex-1 min-w-0`}
                    id="cf-phone"
                    name="phone"
                    type="tel"
                    inputMode="tel"
                    autoComplete="tel-national"
                    placeholder="Phone number"
                  />
                </div>
              </div>

              {/* ── Location fields — shown once a country is confirmed ── */}
              {countryCode && (
                <>
                  {/* Loading */}
                  {locLoading && (
                    <p role="status" className="text-xs text-[var(--text-muted)]">
                      Loading {l1Label.toLowerCase()} options for {country?.name}…
                    </p>
                  )}

                  {/* Error with retry */}
                  {locError && !locLoading && (
                    <div className="flex items-center justify-between gap-3 rounded-lg border border-[var(--border)] px-4 py-3 text-xs">
                      <span role="alert" className="text-[var(--accent)]">
                        Could not load location data for {country?.name}. {locError}
                      </span>
                      <button
                        type="button"
                        onClick={() => { setLocError(''); setLocLoading(true); setRetryKey(k => k + 1); }}
                        className="shrink-0 font-medium text-[var(--accent)] underline"
                      >
                        Retry
                      </button>
                    </div>
                  )}

                  {/* Unsupported country — form can still be submitted */}
                  {locUnsupported && !locLoading && (
                    <p className="rounded-lg border border-[var(--border)] px-4 py-3 text-xs text-[var(--text-muted)]">
                      Detailed region data is not available for {country?.name}. You can still submit the form with just your country.
                    </p>
                  )}

                  {/* Level-1 select (State / Region / Province / Nation…) */}
                  {!locLoading && !locError && !locUnsupported && l1Items.length > 0 && (
                    <div>
                      <label className={labelCls} htmlFor="cf-l1">
                        {l1Label} <span className="text-[var(--accent)]">*</span>
                      </label>
                      <select
                        className={fieldCls}
                        id="cf-l1"
                        name="region"
                        value={level1Id}
                        onChange={e => { setLevel1Id(e.target.value); setLevel2Id(''); }}
                        required
                      >
                        <option value="">Select a {l1Label.toLowerCase()}…</option>
                        {l1Items.map(r => <option key={r.id} value={r.id}>{r.name_en}</option>)}
                      </select>
                    </div>
                  )}

                  {/* Level-2 select (County / District / LGA / Prefecture…) */}
                  {!locLoading && !locError && !locUnsupported && level1Id && hasL2Data && (
                    <div>
                      <label className={labelCls} htmlFor="cf-l2">
                        {l2Label}
                        {l2Required && <span className="text-[var(--accent)]"> *</span>}
                        {!l2Required && <span className="normal-case tracking-normal"> (optional)</span>}
                      </label>
                      {filteredL2.length === 0 ? (
                        <p className="text-xs text-[var(--text-muted)]">No {l2Label.toLowerCase()} data available for this {l1Label.toLowerCase()}.</p>
                      ) : (
                        <select
                          className={fieldCls}
                          id="cf-l2"
                          name="local"
                          value={level2Id}
                          onChange={e => setLevel2Id(e.target.value)}
                          required={l2Required}
                        >
                          <option value="">Select a {l2Label.toLowerCase()}…</option>
                          {filteredL2.map(r => <option key={r.id} value={r.id}>{r.name_en}</option>)}
                        </select>
                      )}
                    </div>
                  )}
                </>
              )}

              {/* Optional fields */}
              <div><label className={labelCls} htmlFor="cf-company">Company / college / institute <span className="normal-case tracking-normal">(optional)</span></label><input className={fieldCls} id="cf-company" name="company" type="text" autoComplete="organization" placeholder="Company or institute name" /></div>
              <div><label className={labelCls} htmlFor="cf-interest">Job title / technical interest <span className="normal-case tracking-normal">(optional)</span></label><input className={fieldCls} id="cf-interest" name="interest" type="text" placeholder="Your role, project or technologies" /></div>
              <div><label className={labelCls} htmlFor="cf-message">Message <span className="normal-case tracking-normal">(optional)</span></label><textarea className={`${fieldCls} min-h-36 resize-y`} id="cf-message" name="message" rows={5} placeholder="Tell me about your idea, project, collaboration or opportunity…" /></div>

              <label className="flex cursor-pointer items-start gap-3 text-sm leading-6 text-[var(--text-muted)]">
                <input className="mt-1 h-4 w-4 shrink-0 accent-[var(--accent)]" name="consent" type="checkbox" required />
                <span>I consent to being contacted about this request. <span className="text-[var(--accent)]">*</span></span>
              </label>

              {submitError && <p role="alert" className="text-sm text-[var(--accent)]">{submitError}</p>}

              <Button type="submit" size="lg" className="mt-1 w-full gap-2 rounded-lg font-display text-lg uppercase tracking-wider sm:w-auto sm:self-start">
                Send request <ArrowUpRight size={18} />
              </Button>
              <p className="text-xs leading-5 text-[var(--text-muted)]">Your message is not sent from this website. Choose Email or WhatsApp, review the prefilled message, then send it in that app.</p>
            </form>
          </section>
        </div>
      </div>
    </main>

    {/* ── Send-options modal ── */}
    {sendOpen && draft && (
      <div
        className="fixed inset-0 z-[100] grid place-items-center bg-black/70 px-4 py-8 backdrop-blur-sm"
        onMouseDown={e => { if (e.target === e.currentTarget) setSendOpen(false); }}
      >
        <section role="dialog" aria-modal="true" aria-labelledby="send-options-title" className="w-full max-w-md rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 shadow-2xl sm:p-8">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="font-mono text-[0.62rem] uppercase tracking-[0.18em] text-[var(--accent)]">Request prepared</p>
              <h2 id="send-options-title" className="mt-2 font-display text-3xl uppercase text-[var(--text)]" style={{ fontFamily: 'var(--font-display)' }}>Choose a channel</h2>
              <p className="mt-2 text-sm leading-6 text-[var(--text-muted)]">Your note will open in the app you choose. Review it there before sending.</p>
            </div>
            <button type="button" onClick={() => setSendOpen(false)} aria-label="Close send options" className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-[var(--border)] text-[var(--text-muted)] hover:border-[var(--accent)] hover:text-[var(--accent)]"><X size={18} /></button>
          </div>
          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            <a href={emailHref} className="flex min-h-14 items-center justify-center gap-2 rounded-lg border border-[var(--border)] px-4 py-3 font-medium text-[var(--text)] hover:border-[var(--accent)] hover:bg-[var(--accent-dim)] hover:text-[var(--accent)]"><Mail size={18} />Email</a>
            <a href={whatsappHref} target="_blank" rel="noopener noreferrer" className="flex min-h-14 items-center justify-center gap-2 rounded-lg bg-[var(--accent)] px-4 py-3 font-medium text-white hover:opacity-90"><MessageCircle size={18} />WhatsApp</a>
          </div>
        </section>
      </div>
    )}
  </>;
}
