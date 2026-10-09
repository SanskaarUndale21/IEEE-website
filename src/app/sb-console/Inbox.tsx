"use client";

import { useMemo, useState } from "react";
import { Badge, Call, Chip, CopyButton, Dialog, Drawer, Empty, SearchBox, Skeleton, useList, useToast } from "./ui";
import { Membership, QueryRow, Status, downloadCsv, fmtDate, fmtLong } from "./model";

const TONE = { pending: "warn", approved: "ok", rejected: "bad", open: "warn", resolved: "ok" } as const;

/* ───────── memberships ───────── */

export function Memberships({ call }: { call: Call }) {
  const { items, error, reload } = useList<Membership>(call, "memberships");
  const toast = useToast();
  const [status, setStatus] = useState<Status | "all">("pending");
  const [q, setQ] = useState("");
  const [sem, setSem] = useState("all");
  const [open, setOpen] = useState<string | null>(null);
  const [dialog, setDialog] = useState<null | { id: string; kind: "reject" | "delete" }>(null);
  const [showSecret, setShowSecret] = useState(false);

  const all = useMemo(() => items ?? [], [items]);
  const counts = useMemo(() => {
    const c: Record<string, number> = { all: all.length, pending: 0, approved: 0, rejected: 0 };
    for (const m of all) c[m.status]++;
    return c;
  }, [all]);
  const semesters = useMemo(() => Array.from(new Set(all.map((m) => m.semester).filter(Boolean))).sort(), [all]);
  const shown = all.filter((m) => {
    if (status !== "all" && m.status !== status) return false;
    if (sem !== "all" && m.semester !== sem) return false;
    const n = q.trim().toLowerCase();
    return !n || `${m.name} ${m.email} ${m.contact} ${m.branch}`.toLowerCase().includes(n);
  });
  const cur = all.find((m) => m.id === open) ?? null;
  const idx = shown.findIndex((m) => m.id === open);

  const review = async (id: string, s: Status, note = "") => {
    try {
      await call("memberships", "PATCH", { id, status: s, note });
      toast(`Marked ${s}`);
      await reload();
    } catch (e) {
      toast((e as Error).message, true);
    }
  };

  return (
    <>
      <div className="adm-head">
        <div><h1>Memberships</h1><p>Applications to join IEEE SGBIT from the Join page.</p></div>
        <div style={{ display: "flex", gap: 8 }}>
          <button className="adm-btn" onClick={reload}>Refresh</button>
          <button
            className="adm-btn primary"
            disabled={!shown.length}
            onClick={() => downloadCsv(`memberships-${new Date().toISOString().slice(0, 10)}.csv`, [["Submitted", "Name", "Email", "Phone", "Branch", "Semester", "DOB", "Status"], ...shown.map((m) => [m.created_at, m.name, m.email, m.contact, m.branch, m.semester, m.dob ?? "", m.status])])}
          >
            Export CSV
          </button>
        </div>
      </div>

      <div className="adm-chips">
        {(["pending", "approved", "rejected", "all"] as const).map((k) => (
          <Chip key={k} active={status === k} onClick={() => setStatus(k)} count={counts[k]}>{k === "all" ? "All" : k[0].toUpperCase() + k.slice(1)}</Chip>
        ))}
      </div>
      <div className="adm-toolbar">
        <SearchBox value={q} onChange={setQ} placeholder="Search name, email, phone or branch" />
        <select className="adm-input" value={sem} onChange={(e) => setSem(e.target.value)} aria-label="Semester">
          <option value="all">All semesters</option>
          {semesters.map((s) => <option key={s} value={s}>Semester {s}</option>)}
        </select>
        <span style={{ marginLeft: "auto", color: "var(--a-muted)" }}>{shown.length} of {all.length}</span>
      </div>

      {error && <div className="adm-flag bad" role="alert">{error}</div>}
      {!items ? <Skeleton /> : shown.length === 0 ? (
        <div className="adm-card"><Empty title="Nothing here" hint="No applications match this filter." /></div>
      ) : (
        <div className="adm-tablewrap">
          <table className="adm-table" style={{ minWidth: 760 }}>
            <thead><tr><th>Name</th><th>Contact</th><th>Branch</th><th>Semester</th><th>Status</th><th>Applied</th></tr></thead>
            <tbody>
              {shown.map((m) => (
                <tr key={m.id} className="adm-row" tabIndex={0} onClick={() => { setOpen(m.id); setShowSecret(false); }} onKeyDown={(e) => e.key === "Enter" && setOpen(m.id)}>
                  <td className="adm-cell-title">{m.name}</td>
                  <td>{m.contact}<span className="adm-cell-sub">{m.email}</span></td>
                  <td>{m.branch}</td>
                  <td>{m.semester}</td>
                  <td><Badge tone={TONE[m.status]}>{m.status[0].toUpperCase() + m.status.slice(1)}</Badge></td>
                  <td style={{ whiteSpace: "nowrap" }}>{fmtDate(m.created_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {cur && (
        <Drawer
          title={cur.name}
          sub={<><Badge tone={TONE[cur.status]}>{cur.status}</Badge> <span>{idx >= 0 ? `${idx + 1} of ${shown.length}` : ""}</span></>}
          onClose={() => setOpen(null)}
          onPrev={idx > 0 ? () => setOpen(shown[idx - 1].id) : undefined}
          onNext={idx >= 0 && idx < shown.length - 1 ? () => setOpen(shown[idx + 1].id) : undefined}
          footer={
            <>
              <button className="adm-btn ok" disabled={cur.status === "approved"} onClick={() => review(cur.id, "approved")}>Approve</button>
              <button className="adm-btn bad" disabled={cur.status === "rejected"} onClick={() => setDialog({ id: cur.id, kind: "reject" })}>Reject</button>
              {cur.status !== "pending" && <button className="adm-btn" onClick={() => review(cur.id, "pending")}>Back to pending</button>}
              <button className="adm-btn ghost" style={{ marginLeft: "auto" }} onClick={() => setDialog({ id: cur.id, kind: "delete" })}>Delete</button>
            </>
          }
        >
          <section className="adm-sec">
            <h3>Applicant</h3>
            <dl className="adm-kv">
              <dt>Email</dt><dd>{cur.email} <CopyButton text={cur.email} /></dd>
              <dt>Phone</dt><dd>{cur.contact} <CopyButton text={cur.contact} /></dd>
              <dt>Branch</dt><dd>{cur.branch}</dd>
              <dt>Semester</dt><dd>{cur.semester}</dd>
              <dt>Date of birth</dt><dd>{cur.dob ?? "-"}</dd>
              <dt>Applied</dt><dd>{fmtLong(cur.created_at)}</dd>
            </dl>
          </section>
          {(cur.security_question || cur.security_answer) && (
            <section className="adm-sec">
              <h3>Security question</h3>
              <dl className="adm-kv">
                <dt>Question</dt><dd>{cur.security_question || "-"}</dd>
                <dt>Answer</dt><dd>{showSecret ? cur.security_answer || "-" : "Hidden"} <button className="adm-btn sm ghost" onClick={() => setShowSecret((v) => !v)}>{showSecret ? "Hide" : "Show"}</button></dd>
              </dl>
            </section>
          )}
          {cur.admin_note && <section className="adm-sec"><h3>Note</h3>{cur.admin_note}</section>}
        </Drawer>
      )}

      {dialog && (
        <Dialog
          title={dialog.kind === "delete" ? "Delete this application?" : "Reject this application?"}
          body={dialog.kind === "delete" ? "It cannot be undone." : undefined}
          confirm={dialog.kind === "delete" ? "Delete" : "Reject"}
          danger
          askReason={dialog.kind === "reject"}
          onCancel={() => setDialog(null)}
          onConfirm={async (reason) => {
            const d = dialog;
            setDialog(null);
            if (d.kind === "reject") await review(d.id, "rejected", reason);
            else {
              try { await call("memberships", "DELETE", { id: d.id }); toast("Deleted"); setOpen(null); await reload(); } catch (e) { toast((e as Error).message, true); }
            }
          }}
        />
      )}
    </>
  );
}

/* ───────── queries ───────── */

export function Queries({ call }: { call: Call }) {
  const { items, error, reload } = useList<QueryRow>(call, "queries");
  const toast = useToast();
  const [status, setStatus] = useState<"open" | "resolved" | "all">("open");
  const [q, setQ] = useState("");
  const [del, setDel] = useState<string | null>(null);

  const all = items ?? [];
  const counts = { open: all.filter((x) => x.status === "open").length, resolved: all.filter((x) => x.status === "resolved").length, all: all.length };
  const shown = all.filter((x) => (status === "all" || x.status === status) && (!q.trim() || `${x.email} ${x.phone} ${x.topic}`.toLowerCase().includes(q.trim().toLowerCase())));

  const flip = async (x: QueryRow) => {
    try {
      await call("queries", "PATCH", { id: x.id, status: x.status === "open" ? "resolved" : "open" });
      toast(x.status === "open" ? "Marked resolved" : "Reopened");
      await reload();
    } catch (e) {
      toast((e as Error).message, true);
    }
  };

  return (
    <>
      <div className="adm-head">
        <div><h1>Queries</h1><p>Messages sent from the Contact form.</p></div>
        <button className="adm-btn" onClick={reload}>Refresh</button>
      </div>
      <div className="adm-chips">
        {(["open", "resolved", "all"] as const).map((k) => <Chip key={k} active={status === k} onClick={() => setStatus(k)} count={counts[k]}>{k[0].toUpperCase() + k.slice(1)}</Chip>)}
      </div>
      <div className="adm-toolbar"><SearchBox value={q} onChange={setQ} placeholder="Search email, phone or message" /></div>

      {error && <div className="adm-flag bad" role="alert">{error}</div>}
      {!items ? <Skeleton /> : shown.length === 0 ? (
        <div className="adm-card"><Empty title={status === "open" ? "Inbox is clear" : "Nothing here"} hint="No queries match this filter." /></div>
      ) : (
        <div style={{ display: "grid", gap: 10 }}>
          {shown.map((x) => (
            <article key={x.id} className="adm-card adm-pad">
              <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
                <div>
                  <b>{x.email || x.phone}</b> <Badge tone={TONE[x.status]}>{x.status}</Badge>
                  <div style={{ color: "var(--a-muted)", fontSize: 13 }}>{[x.email, x.phone].filter(Boolean).join(" · ")} · {fmtLong(x.created_at)}</div>
                </div>
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                  {x.email && <a className="adm-btn sm" href={`mailto:${x.email}`}>Reply by email</a>}
                  {x.phone && <a className="adm-btn sm" href={`tel:${x.phone}`}>Call</a>}
                  <button className={`adm-btn sm ${x.status === "open" ? "ok" : ""}`} onClick={() => flip(x)}>{x.status === "open" ? "Mark resolved" : "Reopen"}</button>
                  <button className="adm-btn sm ghost" onClick={() => setDel(x.id)}>Delete</button>
                </div>
              </div>
              <p style={{ margin: "10px 0 0", whiteSpace: "pre-wrap", overflowWrap: "anywhere" }}>{x.topic || "(no message)"}</p>
            </article>
          ))}
        </div>
      )}

      {del && (
        <Dialog
          title="Delete this query?"
          body="It cannot be undone."
          confirm="Delete"
          danger
          onCancel={() => setDel(null)}
          onConfirm={async () => {
            const id = del;
            setDel(null);
            try { await call("queries", "DELETE", { id }); toast("Deleted"); await reload(); } catch (e) { toast((e as Error).message, true); }
          }}
        />
      )}
    </>
  );
}
