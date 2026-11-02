// Edge function "hub": POST /ingest, GET /answers, POST /ack. Auth: header x-hub-token (sha256 compared with table hub_token).
import { createClient } from "jsr:@supabase/supabase-js@2";
const db = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
const cors = { "access-control-allow-origin": "*", "access-control-allow-headers": "x-hub-token, content-type", "access-control-allow-methods": "GET,POST,OPTIONS" };
const j = (o: unknown, s = 200) => new Response(JSON.stringify(o), { status: s, headers: { ...cors, "content-type": "application/json" } });
async function sha(s: string) {
  const b = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(s));
  return [...new Uint8Array(b)].map((x) => x.toString(16).padStart(2, "0")).join("");
}
const DROP = { id: "drop", label: "Fuck off, drop it", color: "#FF3B5C" };
function withDrop(opts: any[]) {
  const o = (Array.isArray(opts) ? opts : []).filter((x) => x && x.id !== "drop");
  return [...o, DROP];
}
Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: cors });
  const tok = req.headers.get("x-hub-token") || "";
  const { data: t } = await db.from("hub_token").select("token_sha256").eq("id", 1).single();
  if (!tok || !t || (await sha(tok)) !== t.token_sha256) return j({ error: "unauthorized" }, 401);
  const path = new URL(req.url).pathname.replace(/^.*\/hub/, "") || "/";
  try {
    if (req.method === "POST" && path.startsWith("/ingest")) {
      const b = await req.json();
      const row: any = {
        session_id: String(b.session_id || "unknown").slice(0, 200),
        project: String(b.project || "general").slice(0, 120),
        title: String(b.title || "(no title)").slice(0, 300),
        body: String(b.body || "").slice(0, 60000),
        options: withDrop(b.options),
        multi: !!b.multi,
        images: Array.isArray(b.images) ? b.images : [],
        links: Array.isArray(b.links) ? b.links : [],
        kind: b.kind || "agent",
      };
      if (b.external_id) row.external_id = String(b.external_id);
      if (b.sort_order != null) row.sort_order = b.sort_order;
      if (b.created_at) row.created_at = b.created_at;
      const { data, error } = await db.from("messages").upsert(row, { onConflict: "external_id", ignoreDuplicates: !!b.external_id }).select("id").maybeSingle();
      if (error) return j({ error: error.message }, 400);
      return j({ ok: true, id: data?.id ?? null });
    }
    if (req.method === "GET" && path.startsWith("/answers")) {
      const u = new URL(req.url);
      const unread = u.searchParams.get("unread") !== "0";
      const project = u.searchParams.get("project");
      let q = db.from("answers").select("message_id,picks,comment,answered_at,delivered_at,messages!inner(title,project,session_id,options)").order("answered_at", { ascending: false }).limit(100);
      if (unread) q = q.is("delivered_at", null);
      if (project) q = q.eq("messages.project", project);
      const { data, error } = await q;
      if (error) return j({ error: error.message }, 400);
      const out = (data || []).map((a: any) => {
        const labels = (a.picks || []).map((p: string) => (a.messages.options.find((o: any) => o.id === p)?.label) || p);
        return { message_id: a.message_id, title: a.messages.title, project: a.messages.project, session_id: a.messages.session_id, picks: a.picks, pick_labels: labels, dropped: (a.picks || []).includes("drop"), comment: a.comment, answered_at: a.answered_at };
      });
      if (u.searchParams.get("mark") === "1" && out.length) await db.from("answers").update({ delivered_at: new Date().toISOString() }).in("message_id", out.map((x: any) => x.message_id));
      return j({ answers: out });
    }
    if (req.method === "POST" && path.startsWith("/ack")) {
      const b = await req.json();
      await db.from("answers").update({ delivered_at: new Date().toISOString() }).in("message_id", b.ids || []);
      return j({ ok: true });
    }
    return j({ error: "not found", path }, 404);
  } catch (e) { return j({ error: String(e) }, 500); }
});
