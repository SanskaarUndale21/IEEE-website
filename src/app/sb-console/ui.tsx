"use client";

import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";

/* ───────── API caller type and list hook ───────── */

export type Call = (path: string, method?: string, body?: unknown) => Promise<any>;

export function useList<T>(call: Call, path: string) {
  const [items, setItems] = useState<T[] | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const load = useCallback(async () => {
    setLoading(true);
    try {
      setItems((await call(path)).items);
      setError("");
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }, [call, path]);
  useEffect(() => {
    load();
  }, [load]);
  return { items, error, reload: load, loading };
}

/* ───────── toasts ───────── */

type Toast = { id: number; text: string; bad?: boolean };
const ToastCtx = createContext<(text: string, bad?: boolean) => void>(() => {});
export const useToast = () => useContext(ToastCtx);

export function ToastHost({ children }: { children: React.ReactNode }) {
  const [list, setList] = useState<Toast[]>([]);
  const n = useRef(0);
  const push = useCallback((text: string, bad?: boolean) => {
    const id = ++n.current;
    setList((l) => [...l, { id, text, bad }]);
    setTimeout(() => setList((l) => l.filter((t) => t.id !== id)), bad ? 6000 : 2800);
  }, []);
  return (
    <ToastCtx.Provider value={push}>
      {children}
      <div className="adm-toasts" role="status" aria-live="polite">
        {list.map((t) => (
          <div key={t.id} className={`adm-toast ${t.bad ? "bad" : ""}`}>
            {t.text}
          </div>
        ))}
      </div>
    </ToastCtx.Provider>
  );
}

/* ───────── confirm / reason dialog ───────── */

export function Dialog({
  title,
  body,
  confirm,
  danger,
  askReason,
  reasonLabel = "Reason (optional)",
  onCancel,
  onConfirm,
}: {
  title: string;
  body?: string;
  confirm: string;
  danger?: boolean;
  askReason?: boolean;
  reasonLabel?: string;
  onCancel: () => void;
  onConfirm: (reason: string) => void | Promise<void>;
}) {
  const [reason, setReason] = useState("");
  const [busy, setBusy] = useState(false);
  useEffect(() => {
    const k = (e: KeyboardEvent) => e.key === "Escape" && onCancel();
    window.addEventListener("keydown", k);
    return () => window.removeEventListener("keydown", k);
  }, [onCancel]);
  return (
    <>
      <div className="adm-scrim" style={{ zIndex: 79 }} onClick={onCancel} />
      <div className="adm-modal" role="alertdialog" aria-modal="true" aria-label={title}>
        <h3>{title}</h3>
        {body && <p>{body}</p>}
        {askReason && (
          <>
            <label className="adm-label" htmlFor="adm-reason">
              {reasonLabel}
            </label>
            <textarea id="adm-reason" className="adm-input" value={reason} maxLength={200} onChange={(e) => setReason(e.target.value)} autoFocus />
          </>
        )}
        <div className="row">
          <button className="adm-btn" onClick={onCancel}>
            Cancel
          </button>
          <button
            className={`adm-btn ${danger ? "solid-bad" : "primary"}`}
            disabled={busy}
            onClick={async () => {
              setBusy(true);
              await onConfirm(reason.trim());
            }}
          >
            {busy ? "Working" : confirm}
          </button>
        </div>
      </div>
    </>
  );
}

/* ───────── small pieces ───────── */

export function Badge({ tone, children }: { tone: "ok" | "warn" | "bad" | "info" | "mute"; children: React.ReactNode }) {
  return <span className={`adm-badge ${tone}`}>{children}</span>;
}

export function SearchBox({ value, onChange, placeholder }: { value: string; onChange: (v: string) => void; placeholder: string }) {
  return (
    <div className="adm-search">
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden>
        <circle cx="11" cy="11" r="7" />
        <path d="M20 20l-3.5-3.5" />
      </svg>
      <input className="adm-input" type="search" value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} aria-label={placeholder} />
    </div>
  );
}

export function Chip({ active, onClick, count, children }: { active: boolean; onClick: () => void; count?: number; children: React.ReactNode }) {
  return (
    <button className="adm-chip" aria-pressed={active} onClick={onClick}>
      {children}
      {count !== undefined && <i>{count}</i>}
    </button>
  );
}

export function Switch({ on, label, onChange, disabled }: { on: boolean; label: string; onChange: (v: boolean) => void; disabled?: boolean }) {
  return <button type="button" role="switch" aria-checked={on} aria-label={label} className="adm-switch" disabled={disabled} onClick={(e) => { e.stopPropagation(); onChange(!on); }} />;
}

export function Empty({ title, hint }: { title: string; hint?: string }) {
  return (
    <div className="adm-empty">
      <b>{title}</b>
      {hint}
    </div>
  );
}

export function Skeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="adm-card adm-pad" style={{ display: "grid", gap: 14 }}>
      {Array.from({ length: rows }, (_, i) => (
        <div key={i} className="skeleton" style={{ width: `${60 + ((i * 13) % 35)}%` }} />
      ))}
    </div>
  );
}

export function CopyButton({ text, label = "Copy" }: { text: string; label?: string }) {
  const toast = useToast();
  return (
    <button
      type="button"
      className="adm-btn sm ghost"
      onClick={async (e) => {
        e.stopPropagation();
        try {
          await navigator.clipboard.writeText(text);
          toast("Copied");
        } catch {
          toast("Could not copy", true);
        }
      }}
    >
      {label}
    </button>
  );
}

export function Drawer({ title, sub, onClose, children, footer, onPrev, onNext }: {
  title: React.ReactNode;
  sub?: React.ReactNode;
  onClose: () => void;
  children: React.ReactNode;
  footer?: React.ReactNode;
  onPrev?: () => void;
  onNext?: () => void;
}) {
  useEffect(() => {
    const k = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement;
      if (/^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName)) return;
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowDown" || e.key === "j") onNext?.();
      if (e.key === "ArrowUp" || e.key === "k") onPrev?.();
    };
    window.addEventListener("keydown", k);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", k);
      document.body.style.overflow = prev;
    };
  }, [onClose, onNext, onPrev]);
  return (
    <>
      <div className="adm-scrim" onClick={onClose} />
      <aside className="adm-drawer" role="dialog" aria-modal="true">
        <header>
          <div style={{ minWidth: 0 }}>
            <h2>{title}</h2>
            {sub && <div style={{ marginTop: 4, color: "var(--a-muted)" }}>{sub}</div>}
          </div>
          <div style={{ display: "flex", gap: 6, flex: "none" }}>
            {onPrev && (
              <button className="adm-btn sm" onClick={onPrev} aria-label="Previous">
                Prev
              </button>
            )}
            {onNext && (
              <button className="adm-btn sm" onClick={onNext} aria-label="Next">
                Next
              </button>
            )}
            <button className="adm-btn sm" onClick={onClose} aria-label="Close">
              Close
            </button>
          </div>
        </header>
        <div className="body">{children}</div>
        {footer && <footer>{footer}</footer>}
      </aside>
    </>
  );
}
