import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getPageSession } from "@/lib/admin/auth";
import AdminApp from "./AdminApp";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Console",
  robots: { index: false, follow: false, nocache: true, noarchive: true, nosnippet: true },
};

export default async function ConsolePage() {
  const state = await getPageSession();
  // Not reached through the secret path (or admin not configured): behave like any unknown URL.
  if (!state) notFound();

  return (
    <AdminApp
      basePath={state.cfg.basePath}
      authed={Boolean(state.session)}
      csrf={state.session?.csrf ?? ""}
      adminId={state.session?.sub ?? ""}
    />
  );
}
