import "server-only";

/**
 * One place that turns a stored registration into the state the pages show.
 * Nothing here trusts the browser: the state is read from the database row.
 *
 *  pending    team saved, no payment submitted yet
 *  submitted  payment reference and screenshot sent, waiting for an admin to check it
 *  verified   an admin approved it (status = approved). Only admins can set this.
 *  rejected   an admin rejected it. The team may send a corrected payment.
 */
export type PaymentStatus = "pending" | "submitted" | "verified" | "rejected";

export interface RegRow {
  id: string;
  status: "pending" | "approved" | "rejected";
  transaction_id: string;
  admin_note: string | null;
  team_name: string;
  created_at: string;
  reviewed_at: string | null;
}

export function paymentStatusOf(r: Pick<RegRow, "status" | "transaction_id">): PaymentStatus {
  if (r.status === "approved") return "verified";
  if (r.status === "rejected") return "rejected";
  return r.transaction_id ? "submitted" : "pending";
}

/** The "Admin: ..." line an admin leaves when rejecting. Safe to show to the team. */
export function adminReason(note: string | null | undefined): string {
  for (const line of String(note ?? "").split("\n")) if (line.startsWith("Admin: ")) return line.slice(7).slice(0, 200);
  return "";
}

/** The amount recorded when the payment was submitted ("Rs 79"). */
export function paidAmount(note: string | null | undefined): number | null {
  const m = /\[Payment submitted\][^\n]*Rs\s*(\d+)/i.exec(String(note ?? ""));
  return m ? Number(m[1]) : null;
}

export function publicState(r: RegRow, slug: string) {
  const payment = paymentStatusOf(r);
  return {
    id: r.id,
    slug,
    teamName: r.team_name,
    paymentStatus: payment,
    // kept for older pages
    paid: payment !== "pending",
    canPay: payment === "pending" || payment === "rejected",
    reason: payment === "rejected" ? adminReason(r.admin_note) : "",
    amount: paidAmount(r.admin_note),
    submittedAt: r.reviewed_at ?? r.created_at,
  };
}
