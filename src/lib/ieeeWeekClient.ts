"use client";

export type PaymentStatus = "pending" | "submitted" | "verified" | "rejected";

export interface RegState {
  id: string;
  slug: string;
  teamName: string;
  paymentStatus: PaymentStatus;
  canPay: boolean;
  reason: string;
  amount: number | null;
  submittedAt: string;
}

const KEY = (slug: string) => `ieeew:reg:${slug}`;

/**
 * A convenience only. The browser remembers which registration it started so a returning visitor
 * lands on it again. The database is always asked for the real state, so clearing this loses nothing.
 */
export function rememberReg(slug: string, id: string) {
  try {
    localStorage.setItem(KEY(slug), id);
  } catch {
    /* private mode or blocked storage: the link in the address bar still works */
  }
}

export function recallReg(slug: string): string {
  try {
    return localStorage.getItem(KEY(slug)) ?? "";
  } catch {
    return "";
  }
}

export function forgetReg(slug: string) {
  try {
    localStorage.removeItem(KEY(slug));
  } catch {
    /* ignore */
  }
}

export async function fetchRegState(id: string): Promise<RegState | null> {
  try {
    const res = await fetch(`/api/ieee-week/register?id=${encodeURIComponent(id)}`, { cache: "no-store" });
    if (!res.ok) return null;
    const d = await res.json();
    return d?.success ? (d as RegState) : null;
  } catch {
    return null;
  }
}

/** Where a registration should go next, based on its real payment status. */
export function nextHref(s: Pick<RegState, "id" | "paymentStatus">, resumed = false): string {
  return `/ieee-week/register/payment?r=${s.id}${resumed ? "&resumed=1" : ""}`;
}

/** Small draft of the payment form so a reload or app switch does not make people retype. */
const DRAFT = (id: string) => `ieeew:draft:${id}`;
export interface PayDraft {
  plan: "ieee" | "non";
  tx: string;
  confirm: string;
  ieeeIds: string[];
}
export function saveDraft(id: string, d: PayDraft) {
  try {
    sessionStorage.setItem(DRAFT(id), JSON.stringify(d));
  } catch {
    /* ignore */
  }
}
export function loadDraft(id: string): PayDraft | null {
  try {
    const raw = sessionStorage.getItem(DRAFT(id));
    return raw ? (JSON.parse(raw) as PayDraft) : null;
  } catch {
    return null;
  }
}
export function clearDraft(id: string) {
  try {
    sessionStorage.removeItem(DRAFT(id));
  } catch {
    /* ignore */
  }
}
