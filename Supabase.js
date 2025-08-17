// supabase.js

// 🔹 Supabase credentials (replace with your own)
const SUPABASE_URL = "https://fzkjrtudqirpefxsvilc.supabase.co";
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ6a2pydHVkcWlycGVmeHN2aWxjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUzMjEyNjcsImV4cCI6MjA3MDg5NzI2N30.aSZaNoz5BXESVeYnRAU_cNuOmaN7mOi0nd5-FEN-fZk";

// create client
export const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

//
// 🔹 Signup
//
export async function signup() {
  const email = document.getElementById("signup-email").value;
  const password = document.getElementById("signup-password").value;

  const { data, error } = await supabase.auth.signUp({ email, password });

  if (error) {
    alert("❌ Signup Error: " + error.message);
  } else {
    alert("✅ Signup successful! Confirm email: " + email);
  }
}

//
// 🔹 Login
//
export async function login() {
  const email = document.getElementById("login-email").value;
  const password = document.getElementById("login-password").value;

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    alert("❌ Login Error: " + error.message);
  } else {
    alert("✅ Login successful!");
    window.location.href = "dashboard.html"; // redirect
  }
}

//
// 🔹 Logout
//
export async function logout() {
  const { error } = await supabase.auth.signOut();
  if (error) {
    alert("❌ Logout Error: " + error.message);
  } else {
    alert("✅ Logged out!");
    window.location.href = "index.html";
  }
}

//
// 🔹 Get Current User
//
export async function getUser() {
  const { data, error } = await supabase.auth.getUser();
  if (error) {
    alert("❌ Error: " + error.message);
  } else {
    if (data.user) {
      alert("👤 User: " + data.user.email);
    } else {
      alert("⚠️ No user logged in.");
    }
  }
}
