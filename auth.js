import { supabase, toast } from "./supabase.js";

const signupBox = document.getElementById("signupBox");
const loginBox  = document.getElementById("loginBox");
const goLogin   = document.getElementById("goLogin");
const goSignup  = document.getElementById("goSignup");

if (goLogin)  goLogin.onclick  = (e)=>{ e.preventDefault(); signupBox.classList.add("hidden"); loginBox.classList.remove("hidden"); };
if (goSignup) goSignup.onclick = (e)=>{ e.preventDefault(); loginBox.classList.add("hidden"); signupBox.classList.remove("hidden"); };

const btnSignup = document.getElementById("btnSignup");
const btnLogin  = document.getElementById("btnLogin");

if (btnSignup) btnSignup.addEventListener("click", doSignup);
if (btnLogin)  btnLogin.addEventListener("click", doLogin);

// Redirect if already logged in
(async function restore(){
  const { data } = await supabase.auth.getSession();
  const user = data.session?.user;
  if (!user) return;
  const { data: prof } = await supabase.from("profiles").select("*").eq("id", user.id).maybeSingle();
  if (prof?.role === "mechanic") window.location.href = "mechanic.html";
  else if (prof?.role === "customer") window.location.href = "customer.html";
})();

async function doSignup(){
  const name  = document.getElementById("su_name").value.trim();
  const email = document.getElementById("su_email").value.trim();
  const pass  = document.getElementById("su_pass").value;
  const role  = document.getElementById("su_role").value;
  const dept  = document.getElementById("su_department").value.trim();
  const mobile= document.getElementById("su_mobile").value.trim();

  if(!name || !email || !pass || !role || !mobile){
    toast("Please fill all required fields.");
    return;
  }
  if(role==="mechanic" && !dept){
    toast("Department is required for Mechanics.");
    return;
  }

  const { data, error } = await supabase.auth.signUp({ email, password: pass });
  if (error) { toast(error.message); return; }
  const uid = data.user?.id;
  if (!uid) { toast("Signup failed. Try again."); return; }

  // Upsert profile (make sure your 'profiles' has id uuid PK referencing auth.users)
  const { error: perr } = await supabase.from("profiles").upsert({
    id: uid,
    name, role,
    department: dept || null,
    mobile,
    status: "offline",
    email
  }, { onConflict: "id" });

  if (perr) { toast("Profile save error: " + perr.message); return; }

  toast("Signup successful! Please login.");
  loginBox.classList.remove("hidden");
  signupBox.classList.add("hidden");
}

async function doLogin(){
  const email = document.getElementById("li_email").value.trim();
  const pass  = document.getElementById("li_pass").value;

  const { data, error } = await supabase.auth.signInWithPassword({ email, password: pass });
  if (error) { toast(error.message); return; }

  const user = data.user;
  const { data: prof } = await supabase.from("profiles").select("*").eq("id", user.id).single();

  if (prof?.role === "mechanic") window.location.href = "mechanic.html";
  else window.location.href = "customer.html";
}
