"use client";

import { useCallback, useEffect, useState } from "react";
import { useTheme } from "next-themes";
import "./admin.css";
import { Call, ToastHost } from "./ui";
import Registrations from "./Registrations";
import Events from "./Events";
import { Memberships, Queries } from "./Inbox";
import Overview from "./Overview";

type Tab = "overview" | "registrations" | "events" | "memberships" | "queries";

interface Props {
  basePath: string;
  authed: boolean;
  csrf: string;
  adminId: string;
}

export default function AdminApp({ basePath, authed, csrf, adminId }: Props) {
  const api = `${basePath}/api`;

  const call: Call = useCallback(
    async (path, method = "GET", body) => {
      const res = await fetch(`${api}/${path}`, {
        method,
        credentials: "same-origin",
        cache: "no-store",
        headers: {
          ...(body !== undefined ? { "Content-Type": "application/json" } : {}),
          ...(method !== "GET" ? { "x-csrf-token": csrf } : {}),
        },
        body: body !== undefined ? JSON.stringify(body) : undefined,
      });
      if (res.status === 401) {
        window.location.reload();
        throw new Error("Session expired");
      }
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Request failed");
      return data;
    },
    [api, csrf],
  );

  return (
    <div className="adm fixed inset-0 z-[9999] overflow-y-auto">
      <ToastHost>{authed ? <Dashboard call={call} api={api} csrf={csrf} adminId={adminId} /> : <Login api={api} />}</ToastHost>
    </div>
  );
}

/* ───────── login ───────── */

function Login({ api }: { api: string }) {
  const [ieeeId, setId] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setErr("");
    try {
      const res = await fetch(`${api}/login`, {
        method: "POST",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ieeeId, password }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Sign in failed");
      window.location.reload();
    } catch (x) {
      setErr((x as Error).message);
      setBusy(false);
      setPassword("");
    }
  };

  return (
    <main className="adm-login">
      <form onSubmit={submit} autoComplete="off" className="adm-card">
        <div>
          <h1 style={{ margin: 0, fontSize: 21 }}>IEEE SGBIT console</h1>
          <p style={{ margin: "4px 0 0", color: "var(--a-muted)" }}>Sign in to manage events and registrations.</p>
        </div>
        <div>
          <label className="adm-label" htmlFor="ieeeId">IEEE ID</label>
          <input id="ieeeId" className="adm-input" inputMode="numeric" value={ieeeId} onChange={(e) => setId(e.target.value)} required autoComplete="off" />
        </div>
        <div>
          <label className="adm-label" htmlFor="pw">Password</label>
          <input id="pw" className="adm-input" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required autoComplete="off" />
        </div>
        <button disabled={busy} className="adm-btn primary" style={{ minHeight: 42 }}>{busy ? "Checking" : "Sign in"}</button>
        {err && <p role="alert" style={{ margin: 0, color: "var(--a-bad)", textAlign: "center" }}>{err}</p>}
      </form>
    </main>
  );
}

/* ───────── shell ───────── */

const TABS: { id: Tab; label: string }[] = [
  { id: "overview", label: "Overview" },
  { id: "registrations", label: "Registrations" },
  { id: "events", label: "Events" },
  { id: "memberships", label: "Memberships" },
  { id: "queries", label: "Queries" },
];

function Dashboard({ call, csrf, api, adminId }: { call: Call; csrf: string; api: string; adminId: string }) {
  const [tab, setTab] = useState<Tab>("registrations");
  const [badge, setBadge] = useState<Partial<Record<Tab, number>>>({});
  const { resolvedTheme, setTheme } = useTheme();

  useEffect(() => {
    let alive = true;
    const load = () =>
      call("overview")
        .then((d) => alive && setBadge({ registrations: d.pendingRegistrations, memberships: d.pendingMemberships, queries: d.openQueries }))
        .catch(() => {});
    load();
    const t = setInterval(load, 60_000);
    return () => {
      alive = false;
      clearInterval(t);
    };
  }, [call, tab]);

  const logout = async () => {
    try {
      await call("logout", "POST", {});
    } catch {}
    window.location.reload();
  };

  return (
    <div className="adm-shell">
      <nav className="adm-side" aria-label="Console sections">
        <div className="adm-brand"><b>IEEE SGBIT</b><span>Admin console</span></div>
        {TABS.map((t) => (
          <button key={t.id} className="adm-nav" aria-current={tab === t.id ? "page" : undefined} onClick={() => setTab(t.id)}>
            {t.label}
            {badge[t.id] ? <span className="adm-count" aria-label={`${badge[t.id]} waiting`}>{badge[t.id]}</span> : null}
          </button>
        ))}
        <div className="adm-side-foot">
          <span>Web Master, ID {adminId}</span>
          <button className="adm-btn sm" onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}>{resolvedTheme === "dark" ? "Light mode" : "Dark mode"}</button>
          <button className="adm-btn sm" onClick={logout}>Log out</button>
        </div>
      </nav>

      <main className="adm-main">
        {tab === "overview" && <Overview call={call} go={setTab} />}
        {tab === "registrations" && <Registrations call={call} />}
        {tab === "events" && <Events call={call} csrf={csrf} api={api} />}
        {tab === "memberships" && <Memberships call={call} />}
        {tab === "queries" && <Queries call={call} />}
        <div className="adm-mobile-foot">
          <button className="adm-btn sm" onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}>Theme</button>
          <button className="adm-btn sm" onClick={logout}>Log out</button>
        </div>
      </main>
    </div>
  );
}
