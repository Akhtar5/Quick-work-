import { supabase, requireAuth, telLink, smsLink, toast } from "./supabase.js";

const btnLogout    = document.getElementById("btnLogout");
const statusToggle = document.getElementById("statusToggle");
const statusText   = document.getElementById("statusText");
const reqWrap      = document.getElementById("mechanicRequests");

if (btnLogout) btnLogout.onclick = async ()=>{ await supabase.auth.signOut(); window.location.href="index.html"; };

(async function init(){
  const user = await requireAuth();
  // Must be mechanic; otherwise bounce
  const { data: prof } = await supabase.from("profiles").select("*").eq("id", user.id).single();
  if (prof?.role !== "mechanic") { window.location.href = "customer.html"; return; }

  // Set toggle initial state
  const st = (prof?.status || "offline");
  statusText.textContent = st;
  statusToggle.checked = (st === "online");

  statusToggle.onchange = async ()=>{
    const newStatus = statusToggle.checked ? "online" : "offline";
    const { error } = await supabase.from("profiles").update({ status: newStatus }).eq("id", user.id);
    if (error) { toast(error.message); statusToggle.checked = !statusToggle.checked; return; }
    statusText.textContent = newStatus;
  };

  await loadRequests();
})();

async function loadRequests(){
  const { data: sess } = await supabase.auth.getSession();
  const mid = sess.session?.user?.id;
  if (!mid) return;

  const { data, error } = await supabase
    .from("bookings")
    .select(`
      id, status, booking_time, details,
      customer:profiles!bookings_customer_id_fkey ( name, mobile )
    `)
    .eq("mechanic_id", mid)
    .order("booking_time", { ascending:false });

  if (error) { toast(error.message); return; }

  reqWrap.innerHTML = "";
  (data||[]).forEach(b=>{
    const card = document.createElement("div");
    card.className = "card card-item";
    card.innerHTML = `
      <h3>Request from ${b.customer?.name || "Customer"}</h3>
      <p>Status: <span class="badge">${b.status}</span></p>
      <p class="muted">${new Date(b.booking_time || b.created_at).toLocaleString()}</p>
      ${b.details ? `<p class="muted">Issue: ${b.details}</p>` : ""}
      <div class="flex-wrap">
        <a class="btn" href="${telLink(b.customer?.mobile)}">📞 Call</a>
        <a class="btn" href="${smsLink(b.customer?.mobile)}">✉ SMS</a>
      </div>
      <div class="flex-wrap">
        <button class="btn ok"     data-id="${b.id}" data-st="accepted">✅ Accept</button>
        <button class="btn danger" data-id="${b.id}" data-st="rejected">❌ Reject</button>
      </div>
    `;
    const [acceptBtn, rejectBtn] = card.querySelectorAll("button");
    acceptBtn.onclick = ()=> updateBooking(b.id, "accepted");
    rejectBtn.onclick = ()=> updateBooking(b.id, "rejected");
    reqWrap.appendChild(card);
  });
}

async function updateBooking(id, status){
  const { error } = await supabase.from("bookings").update({ status }).eq("id", id);
  if (error) { toast(error.message); return; }
  await loadRequests();
}
