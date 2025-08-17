/* ========= CONFIG ========= */
const SUPABASE_URL = "https://fzkjrtudqirpefxsvilc.supabase.co";
const SUPABASE_ANON = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ6a2pydHVkcWlycGVmeHN2aWxjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUzMjEyNjcsImV4cCI6MjA3MDg5NzI2N30.aSZaNoz5BXESVeYnRAU_cNuOmaN7mOi0nd5-FEN-fZk";
const sb = supabase.createClient(SUPABASE_URL, SUPABASE_ANON);

/* ========= DOM HELPERS ========= */
const $ = (s, el=document)=> el.querySelector(s);
const $$ = (s, el=document)=> [...el.querySelectorAll(s)];
const toast = (m)=> { $('#authMsg')?.innerText = m; console.log(m); }

/* ========= GLOBAL ========= */
let me = null;          // profiles row of current user
let mechMap, mechMarker;
let custPos = null;     // {lat,lng}
let ratingCtx = { booking_id:null, mechanic_id:null };

/* ========= INIT ========= */
document.addEventListener('DOMContentLoaded', async () => {
  bindAuthButtons();
  bindCustomerButtons();
  bindMechanicButtons();
  await restoreSession();
});

/* ========= AUTH ========= */
function bindAuthButtons(){
  $('#btnRegister').onclick = async () => {
    const name = $('#regName').value.trim();
    const phone = $('#regPhone').value.trim();
    const role  = $('#regRole').value;
    const dept  = $('#regDept').value.trim();
    const email = $('#regEmail').value.trim();
    const pass  = $('#regPass').value;

    if(!name || !email || !pass){ toast('Fill name, email, password'); return }
    const { data, error } = await sb.auth.signUp({ email, password: pass,
      options:{ data:{ name, phone, role, department:dept } }
    });
    if(error){ toast(error.message); return }
    toast('Signup OK. Please verify email, then login.');
  };

  $('#btnLogin').onclick = async () => {
    const email = $('#logEmail').value.trim();
    const pass  = $('#logPass').value;
    const { data, error } = await sb.auth.signInWithPassword({ email, password:pass });
    if(error){ toast(error.message); return }
    await afterLogin();
  };

  $('#btnReset').onclick = async ()=>{
    const email = prompt('Enter your registered email');
    if(!email) return;
    const { error } = await sb.auth.resetPasswordForEmail(email, {
      redirectTo: location.origin + location.pathname
    });
    toast(error ? error.message : 'Reset link sent (check email).');
  };

  $('#btnLogout').onclick = async ()=>{ await sb.auth.signOut(); location.reload(); }
  $('#btnHome').onclick = ()=> showOnly('#screen-auth');
}

async function restoreSession(){
  const { data:{ session } } = await sb.auth.getSession();
  if(session){ await afterLogin(); }
}

async function afterLogin(){
  // fetch or create profile row
  const { data:{ user } } = await sb.auth.getUser();
  if(!user){ toast('No user'); return }

  // Try to read profiles
  let { data:prof, error } = await sb.from('profiles').select('*').eq('id', user.id).single();

  // If not present, create from user_metadata
  if(!prof){
    const meta = user.user_metadata || {};
    const row = {
      id: user.id, name: meta.name || 'User', phone: meta.phone||'',
      role: meta.role || 'customer', department: meta.department||'',
      online: false
    };
    const ins = await sb.from('profiles').insert(row).select().single();
    prof = ins.data; error = ins.error;
  }
  if(error){ toast(error.message); return }

  me = prof;
  $('#helloUser').innerText = `Welcome, ${me.name} (${me.role})`;
  $('#topbar').style.display = 'flex';

  if(me.role === 'mechanic'){ await openMechanicPanel(); }
  else { await openCustomerPanel(); }

  showOnly(me.role === 'mechanic' ? '#panel-mech' : '#panel-cust');
}

/* ========= MECHANIC ========= */
function bindMechanicButtons(){
  $('#toggleOnline').onchange = async (e)=>{
    await sb.from('profiles').update({ online: e.target.checked }).eq('id', me.id);
  };
  $('#btnUpdateLoc').onclick = shareMyLocationAsMechanic;
}

async function openMechanicPanel(){
  // Profile card
  $('#mechProfile').innerHTML = `
    <div><b>${me.name}</b> <span class="badge">${me.department||'No dept'}</span></div>
    <div>Phone: <a href="tel:${me.phone||''}">${me.phone||'NA'}</a></div>
    <div>Rating: <span id="myRating">${me.rating??'—'}</span></div>
  `;
  $('#toggleOnline').checked = !!me.online;

  // Map
  initMechMap();
  // Realtime bookings for me
  loadMechanicBookings();
  sb.channel('mech_bookings_'+me.id)
    .on('postgres_changes',{event:'INSERT',schema:'public',table:'bookings',filter:`mechanic_id=eq.${me.id}`}, loadMechanicBookings)
    .on('postgres_changes',{event:'UPDATE',schema:'public',table:'bookings',filter:`mechanic_id=eq.${me.id}`}, loadMechanicBookings)
    .subscribe();
}

function initMechMap(){
  if(mechMap) return;
  mechMap = L.map('mechMap').setView([20.59,78.96], 4);
  L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19 }).addTo(mechMap);
  mechMarker = L.marker([20.59,78.96]).addTo(mechMap).bindPopup('You');
  if(me.lat && me.lng){
    mechMarker.setLatLng([me.lat, me.lng]);
    mechMap.setView([me.lat, me.lng], 14);
  }
}

async function shareMyLocationAsMechanic(){
  try{
    const pos = await getPosition();
    await sb.from('profiles').update({ lat: pos.lat, lng: pos.lng }).eq('id', me.id);
    mechMarker.setLatLng([pos.lat, pos.lng]);
    mechMap.setView([pos.lat, pos.lng], 15);
    toast('Location updated');
  }catch(e){ toast('Location denied'); }
}

async function loadMechanicBookings(){
  const { data } = await sb.from('bookings').select('*, profiles!bookings_customer_id_fkey(name,phone)').eq('mechanic_id', me.id).order('created_at',{ascending:false});
  const ul = $('#mechBookings'); ul.innerHTML='';
  (data||[]).forEach(b=>{
    const li = document.createElement('li');
    li.innerHTML = `
      <div><b>${b.profiles?.name||'Customer'}</b> <small class="badge">${b.status}</small></div>
      <div class="row">
        <a class="btn ghost" href="tel:${b.profiles?.phone||''}">Call</a>
        <a class="btn ghost" href="sms:${b.profiles?.phone||''}">SMS</a>
        ${b.status==='pending' ? `
          <button class="btn primary btn-acc" data-id="${b.id}">Accept</button>
          <button class="btn danger btn-rej" data-id="${b.id}">Reject</button>` : ``}
        ${b.status==='accepted' ? `<button class="btn secondary btn-done" data-id="${b.id}">Mark Done</button>`:``}
      </div>
    `;
    ul.appendChild(li);
  });

  $$('.btn-acc').forEach(x=>x.onclick=()=>updateBooking(x.dataset.id,'accepted'));
  $$('.btn-rej').forEach(x=>x.onclick=()=>updateBooking(x.dataset.id,'rejected'));
  $$('.btn-done').forEach(x=>x.onclick=()=>updateBooking(x.dataset.id,'completed'));
}

async function updateBooking(id,status){
  await sb.from('bookings').update({ status }).eq('id', id);
}

/* ========= CUSTOMER ========= */
function bindCustomerButtons(){
  $('#btnRefresh').onclick = loadMechanics;
  $('#btnShareLoc').onclick = async ()=>{
    try{ custPos = await getPosition(); $('#custLocStatus').innerText = `Location: ${custPos.lat.toFixed(4)}, ${custPos.lng.toFixed(4)}`; loadMechanics(); }
    catch(e){ $('#custLocStatus').innerText='Location denied'; }
  };
}

async function openCustomerPanel(){
  // listen to my bookings
  const { data:{ user } } = await sb.auth.getUser();
  loadMyBookings();
  sb.channel('cust_bookings_'+user.id)
    .on('postgres_changes',{event:'INSERT',schema:'public',table:'bookings',filter:`customer_id=eq.${user.id}`}, loadMyBookings)
    .on('postgres_changes',{event:'UPDATE',schema:'public',table:'bookings',filter:`customer_id=eq.${user.id}`}, loadMyBookings)
    .subscribe();

  await loadMechanics();
}

async function loadMechanics(){
  const dept = $('#filterDept').value.trim();
  let q = sb.from('profiles').select('id,name,phone,department,online,lat,lng,rating,role').eq('role','mechanic');
  if(dept) q = q.ilike('department', `%${dept}%`);
  const { data } = await q.order('online',{ascending:false});
  const ul = $('#mechList'); ul.innerHTML='';

  (data||[]).forEach(m=>{
    const dist = custPos && m.lat && m.lng ? (haversine(custPos.lat,custPos.lng,m.lat,m.lng)).toFixed(1)+' km' : '—';
    const li = document.createElement('li');
    li.innerHTML = `
      <div class="row" style="justify-content:space-between">
        <div><b>${m.name}</b> <span class="badge">${m.department||'—'}</span> ${m.online?'<span class="badge">online</span>':''}</div>
        <div>⭐ ${m.rating??'—'} • ${dist}</div>
      </div>
      <div class="row">
        <button class="btn primary btn-book" data-id="${m.id}">Book</button>
        <a class="btn ghost" href="tel:${m.phone||''}">Call</a>
        <a class="btn ghost" href="sms:${m.phone||''}">SMS</a>
      </div>
    `;
    ul.appendChild(li);
  });

  $$('.btn-book').forEach(x=>x.onclick = ()=> createBooking(x.dataset.id));
}

async function createBooking(mechanic_id){
  const { data:{ user } } = await sb.auth.getUser();
  const pos = custPos || await getPosition().catch(()=>null);
  const payload = {
    customer_id: user.id,
    mechanic_id,
    status: 'pending',
    customer_lat: pos?.lat ?? null,
    customer_lng: pos?.lng ?? null
  };
  const { error } = await sb.from('bookings').insert(payload);
  toast(error ? error.message : 'Booking placed (pending).');
}

async function loadMyBookings(){
  const { data:{ user } } = await sb.auth.getUser();
  const { data } = await sb.from('bookings').select('*, m:profiles!bookings_mechanic_id_fkey(name,phone)').eq('customer_id', user.id).order('created_at',{ascending:false});
  const ul = $('#myBookings'); ul.innerHTML = '';
  (data||[]).forEach(b=>{
    const li = document.createElement('li');
    li.innerHTML = `
      <div><b>${b.m?.name||'Mechanic'}</b> <small class="badge">${b.status}</small></div>
      <div class="row">
        <a class="btn ghost" href="tel:${b.m?.phone||''}">Call</a>
        <a class="btn ghost" href="sms:${b.m?.phone||''}">SMS</a>
        ${b.status==='completed' ? `<button class="btn secondary btn-rate" data-bid="${b.id}" data-mid="${b.mechanic_id}">Rate</button>`:''}
      </div>
    `;
    ul.appendChild(li);
  });
  $$('.btn-rate').forEach(x=>x.onclick=()=>{
    ratingCtx.booking_id = x.dataset.bid; ratingCtx.mechanic_id = x.dataset.mid;
    $('#rateDlg').showModal();
  });

  // submit rating
  $('#btnSubmitRating').onclick = async (e)=>{
    e.preventDefault();
    const stars = parseInt($('#rateStars').value,10);
    const comment = $('#rateComment').value.trim();
    const { data:{ user } } = await sb.auth.getUser();
    await sb.from('ratings').insert({
      booking_id: ratingCtx.booking_id, mechanic_id: ratingCtx.mechanic_id,
      customer_id: user.id, stars, comment
    });
    $('#rateDlg').close();
    toast('Thanks for rating');
  };
}

/* ========= UTILS ========= */
function showOnly(sel){
  $('#screen-auth').style.display = 'none';
  $('#panel-mech').style.display = 'none';
  $('#panel-cust').style.display = 'none';
  $('#topbar').style.display = sel==='#screen-auth' ? 'none':'flex';
  $(sel).style.display = sel==='#screen-auth' ? 'block' : 'block';
}

function getPosition(){
  return new Promise((resolve,reject)=>{
    if(!navigator.geolocation) return reject('No geolocation');
    navigator.geolocation.getCurrentPosition(
      (pos)=> resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      (err)=> reject(err), { enableHighAccuracy:true, timeout:10000 }
    );
  });
}

function haversine(lat1,lon1,lat2,lon2){
  const R=6371,d2r=Math.PI/180;
  const dlat=(lat2-lat1)*d2r, dlon=(lon2-lon1)*d2r;
  const a=Math.sin(dlat/2)**2 + Math.cos(lat1*d2r)*Math.cos(lat2*d2r)*Math.sin(dlon/2)**2;
  return 2*R*Math.asin(Math.sqrt(a));
}
