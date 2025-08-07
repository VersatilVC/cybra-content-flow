import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;
const OUTBOUND_WEBHOOK_SECRET = Deno.env.get("OUTBOUND_WEBHOOK_SECRET");

function json(data: any, init?: ResponseInit) {
  return new Response(JSON.stringify(data), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
    ...init,
  });
}

async function signPayload(payload: unknown): Promise<string | null> {
  try {
    if (!OUTBOUND_WEBHOOK_SECRET) return null;
    const enc = new TextEncoder();
    const key = await crypto.subtle.importKey(
      "raw",
      enc.encode(OUTBOUND_WEBHOOK_SECRET),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["sign"],
    );
    const signature = await crypto.subtle.sign("HMAC", key, enc.encode(JSON.stringify(payload)));
    const b = new Uint8Array(signature);
    return Array.from(b).map((x) => x.toString(16).padStart(2, "0")).join("");
  } catch {
    return null;
  }
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization") || "";
    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      global: { headers: { Authorization: authHeader } },
    });

    const { webhook_type, payload } = await req.json();

    if (!webhook_type || !payload) {
      return json({ error: "Missing webhook_type or payload" }, { status: 400 });
    }

    const allowedTypes = new Set([
      "knowledge_base",
      "derivative_generation",
      "idea_engine",
      "brief_creation",
      "auto_generation",
      "content_processing",
      "content_item_fix",
      "wordpress_publishing",
    ]);

    if (!allowedTypes.has(webhook_type)) {
      return json({ error: "Invalid webhook type" }, { status: 400 });
    }

    // Fetch active webhooks for this type (RLS will ensure caller can trigger)
    const { data: webhooks, error } = await supabase
      .from("webhook_configurations")
      .select("id,name,webhook_url,is_active,webhook_type,created_by")
      .eq("webhook_type", webhook_type)
      .eq("is_active", true);

    if (error) {
      console.error("Failed to fetch webhooks:", error);
      return json({ error: "Webhook configuration error" }, { status: 500 });
    }

    if (!webhooks || webhooks.length === 0) {
      return json({ ok: true, message: "No active webhooks for this type" });
    }

    const signature = await signPayload(payload);

    const results = await Promise.all(
      webhooks.map(async (wh) => {
        try {
          const resp = await fetch(wh.webhook_url, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              ...(signature ? { "X-Signature": signature } : {}),
            },
            body: JSON.stringify(payload),
          });
          const ok = resp.ok;
          const text = await resp.text();
          return { id: wh.id, ok, status: resp.status, body: text };
        } catch (e) {
          return { id: wh.id, ok: false, status: 0, body: String(e) };
        }
      }),
    );

    return json({ ok: true, results });
  } catch (e) {
    console.error("dispatch-webhook error:", e);
    return json({ error: "Unexpected error" }, { status: 500 });
  }
});