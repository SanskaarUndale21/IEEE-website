import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { audit, jsonError, requireAdmin } from "@/lib/admin/auth";
import { dbError, ok } from "@/lib/admin/api";
import { BUCKETS, getSupabase } from "@/lib/supabase/server";
import { MAX_UPLOAD_BYTES, readImageUpload } from "@/lib/security/uploads";

export const dynamic = "force-dynamic";

/** Event image upload (public bucket). Returns the public URL. */
export async function POST(req: NextRequest) {
  const ctx = await requireAdmin(req, { mutation: true });
  if (ctx instanceof NextResponse) return ctx;

  if (Number(req.headers.get("content-length") ?? 0) > MAX_UPLOAD_BYTES + 64_000) {
    return jsonError("Image must be 4 MB or smaller", 413);
  }
  if (!(req.headers.get("content-type") ?? "").startsWith("multipart/form-data")) {
    return jsonError("Bad request", 400);
  }

  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return jsonError("Bad request", 400);
  }

  const upload = await readImageUpload(form.get("file"));
  if (!upload) return jsonError("No file", 400);
  if (!upload.ok) return jsonError(upload.error, 400);

  const db = getSupabase();
  const path = `${new Date().getFullYear()}/${randomUUID()}.${upload.kind.ext}`;
  const { error } = await db.storage
    .from(BUCKETS.eventImages)
    .upload(path, upload.bytes, { contentType: upload.kind.mime, upsert: false, cacheControl: "31536000" });
  if (error) return dbError(error);

  const { data } = db.storage.from(BUCKETS.eventImages).getPublicUrl(path);
  await audit(ctx, "event.upload_image", path);
  return ok({ url: data.publicUrl });
}
