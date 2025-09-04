import { supabase, requireAuth, telLink, smsLink, toast } from "./supabase.js";

const btnLogout = document.getElementById("btnLogout");
if (btnLogout) btnLogout.onclick = async ()=>{ await supabase.auth.signOut(); window.location.href="index.html"; };

const mechanicList = document.getElementById("mechanicList");
const customerBookings = document.getElementById("customerBookings");

(async function init(){
  const user = await requireAuth();
  // Must be customer; if mechanic, push them away
  const { data: prof } = await supabase.from("profiles").select("*").eq("id", user.id).single();
  if (prof?.role !== "customer") { window.location.href = "mechanic.html"; return; }

  await loadMechanics();
  await loadBookings();
})();

async function loadMechanics(){
  const { data:list, error } = await supabase
    .from("profiles")
    .select("id,name,department,mobile,status")
    .eq("role","mechanic")
    .order("status",{ascending:false});
  if (error) { toast(error.message); return; }

  mechanicList.innerHTML = "";
  (list||[]).forEach(m=>{
    const card = document.createElement("div");
    card.className = "card card-item";
    card.innerHTML = `
      <h3>${m.name}</h3>
      <p><span class="badge">${m.department || "General"}</span></p>
      <p class="muted">Status: <b>${m.status||"offline"}</b></p>
      <div class="flex-wrap">
        <a class="btn" href="${telLink(m.mobile)}">📞 Call</a>
        <a class="btn" href="${smsLink(m.mobile)}">✉ SMS</a>
      </div>
      <textarea id="bn_${m.id}" placeholder="Describe the issue (optional)"></textarea>
      <button class="btn" data-mid="${m.id}">🛠 Book</button>
    `;
    card.querySelector("button").onclick = ()=> bookMechanic(m.id);
    mechanicList.appendChild(card);
  });
}

async function bookMechanic(mechanicId){
  const { data: sess } = await supabase.auth.getSession();
  const customerId = sess.session?.user?.id;
  if (!customerId) { toast("Please login again."); return; }

  const notes = (document.getElementById(`bn_${mechanicId}`)?.value || "").trim();

  const { error } = await supabase.from("bookings").insert({
    customer_id: customerId,
    mechanic_id: mechanicId,
    status: "pending",
    details: notes || null
  });
  if (error) { toast(error.message); return; }

  toast("Booking request sent!");
  await loadBookings();
}

async function loadBookings(){
  const { data: sess } = await supabase.auth.getSession();
  const cid = sess.session?.user?.id;
  if (!cid) return;

  // If your foreign key names differ, adjust below
  const { data, error } = await supabase
    .from("bookings")
    .select(`
      id, status, booking_time, details,
      mechanic:profiles!bookings_mechanic_id_fkey ( name, mobile, department )
    `)
    .eq("customer_id", cid)
    .order("booking_time", { ascending:false });

  if (error) { toast(error.message); return; }

  customerBookings.innerHTML = "";
  (data||[]).forEach(b=>{
    const card = document.createElement("div");
    card.className = "card card-item";
    card.innerHTML = `
      <h3>${b.mechanic?.name || "Mechanic"}</h3>
      <p>${b.mechanic?.department || ""}</p>
      <p>Status: <span class="badge">${b.status}</span></p>
      <p class="muted">${new Date(b.booking_time || b.created_at).toLocaleString()}</p>
      <div class="flex-wrap">
        <a class="btn" href="${telLink(b.mechanic?.mobile)}">📞 Call</a>
        <a class="btn" href="${smsLink(b.mechanic?.mobile)}">✉ SMS</a>
      </div>
      ${b.details ? `<p class="muted">You wrote: ${b.details}</p>` : ""}
    `;
    customerBookings.appendChild(card);
  });
}
