// auth.js
import { supabase } from './supabase.js';
import { showCallPopup, showSMSPopup } from './utils.js';

// DOM Elements
const signupBox = document.getElementById("signupBox");
const loginBox = document.getElementById("loginBox");
const goLogin = document.getElementById("goLogin");
const goSignup = document.getElementById("goSignup");

if (goLogin) goLogin.onclick = (e) => {
  e.preventDefault();
  signupBox.classList.add("hidden");
  loginBox.classList.remove("hidden");
};

if (goSignup) goSignup.onclick = (e) => {
  e.preventDefault();
  loginBox.classList.add("hidden");
  signupBox.classList.remove("hidden");
};

const btnSignup = document.getElementById("btnSignup");
const btnLogin = document.getElementById("btnLogin");

if (btnSignup) btnSignup.addEventListener("click", doSignup);
if (btnLogin) btnLogin.addEventListener("click", doLogin);

// ✅ Redirect on login or session restore (SIGNED_IN + USER_RESTORED)
async function restore() {
  try {
    const { data } = await supabase.auth.getSession();
    const user = data.session?.user;

    if (!user) return;

    // Fetch role from profiles table
    const { data: prof, error } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (error) throw error;

    if (prof.role === 'mechanic') {
      window.location.href = '/mechanic/dashboard.html';
    } else if (prof.role === 'customer') {
      window.location.href = '/customer/home.html';
    }
  } catch (err) {
    console.error("Restore failed:", err);
  }
}

// ✅ Listen for auth state changes (login, logout, session restore)
supabase.auth.onAuthStateChange(async (event, session) => {
  if (event === 'SIGNED_IN' || event === 'USER_RESTORED') {
    await restore();
  }
});

// ✅ App load time check (extra safety)
window.addEventListener('load', async () => {
  await restore();
});

// ✅ Signup Function
async function doSignup() {
  const name = document.getElementById("su_name").value.trim();
  const email = document.getElementById("su_email").value.trim();
  const pass = document.getElementById("su_pass").value;
  const role = document.getElementById("su_role").value;
  const dept = document.getElementById("su_department").value.trim();
  const mobile = document.getElementById("su_mobile").value.trim();

  if (!name || !email || !pass || !role || !mobile) {
    toast("Please fill all required fields.");
    return;
  }

  if (role === "mechanic" && !dept) {
    toast("Department is required for Mechanics.");
    return;
  }

  const { data, error } = await supabase.auth.signUp({ email, password: pass });
  if (error) {
    toast(error.message);
    return;
  }

  const uid = data.user.id;

  // Insert profile
  const { perr } = await supabase.from('profiles').upsert({
    id: uid,
    name,
    role,
    department: dept || null,
    mobile,
    status: "offline",
    email
  }, { onConflict: "id" });

  if (perr) {
    toast("Profile save error: " + perr.message);
    return;
  }

  toast("Signup successful! Please login.");
  loginBox.classList.remove("hidden");
  signupBox.classList.add("hidden");
}

// ✅ Login Function
async function doLogin() {
  const email = document.getElementById("li_email").value.trim();
  const pass = document.getElementById("li_pass").value;

  const { data, error } = await supabase.auth.signInWithPassword({ email, password: pass });
  if (error) {
    toast(error.message);
    return;
  }

  const user = data.user;
  const { prof } = await supabase.from('profiles').select('role').eq('id', user.id).single();

  if (prof.role === 'mechanic') {
    window.location.href = '/mechanic/dashboard.html';
  } else if (prof.role === 'customer') {
    window.location.href = '/customer/home.html';
  }
}
