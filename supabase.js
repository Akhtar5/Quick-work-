// supabase.js (ES module)
import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm";

const SUPABASE_URL = "https://fzkjrtudqirpefxsvilc.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ6a2pydHVkcWlycGVmeHN2aWxjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUzMjEyNjcsImV4cCI6MjA3MDg5NzI2N30.aSZaNoz5BXESVeYnRAU_cNuOmaN7mOi0nd5-FEN-fZk";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Small helpers
export const telLink = (num="") => `tel:${(num||"").replace(/\s+/g,"")}`;
export const smsLink = (num="") => `sms:${(num||"").replace(/\s+/g,"")}`;
export const toast = (msg) => alert(msg);

// Require auth on protected pages
export async function requireAuth() {
  const { data } = await supabase.auth.getSession();
  const user = data.session?.user;
  if (!user) window.location.href = "index.html";
  return user;
}
