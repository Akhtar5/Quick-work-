// supabase.js
import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/dist/module/index.mjs";

const SUPABASE_URL = "https://fzkjrtudqirpefxsvilc.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_heR8LnS1cvq5NBXRXbrXfg_fZXViQBR";//

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true
  }
});

// Helper functions
export const telLink = (num = "") => `tel:${(num || "").replace(/\s*/g, "")}`;
export const smsLink = (num = "") => `sms:${(num || "").replace(/\s*/g, "")}`;
export const toast = (msg) => alert(msg);

// Auth check
export async function requireAuth() {
  const { data, error } = await supabase.auth.getSession();
  if (error || !data.session?.user) {
    window.location.href = "index.html";
    return null;
  }
  return data.session.user;
}
