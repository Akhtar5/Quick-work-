// supabase.js (ES module)
import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm";

// 🔑 Supabase Config
const SUPABASE_URL = "https://fzkjrtudqirpfxsvilc.supabase.co";  
const SUPABASE_ANON_KEY = "sb_publishable_heR8LnS1cvq5NBXRXbrXfg_fZXViQBR";

// ✅ Client setup with session persistence & auto-refresh
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true
  }
});

// ✅ Helpers
export const telLink = (num = "") => `tel:${(num || "").replace(/\s*/g, "")}`;
export const smsLink = (num = "") => `sms:${(num || "").replace(/\s*/g, "")}`;
export const toast = (msg) => alert(msg);

// ✅ Require auth on protected pages
export async function requireAuth() {
  const { data, error } = await supabase.auth.getSession();

  if (error) {
    console.error("Session error:", error.message);
    window.location.href = "index.html"; // session error → back to login
    return null;
  }

  const user = data.session?.user;
  if (!user) {
    window.location.href = "index.html"; // no user → back to login
    return null;
  }

  return user; // logged-in user
}
