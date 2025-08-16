// supabase.js

// Supabase Client Import (CDN से)
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm'

// Aapka Project URL aur API key
const SUPABASE_URL = "https://fzkjrtudqirpefxsvilc.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ6a2pydHVkcWlycGVmeHN2aWxjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUzMjEyNjcsImV4cCI6MjA3MDg5NzI2N30.aSZaNoz5BXESVeYnRAU_cNuOmaN7mOi0nd5-FEN-fZk";

// Supabase client create
export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// Example: check connection
async function checkConnection() {
  const { data, error } = await supabase.from('your_table_name').select('*').limit(1);
  if (error) {
    console.error("Supabase Error:", error);
  } else {
    console.log("Supabase Connected ✅", data);
  }
}
checkConnection();
