// customer.js
import { supabase } from './supabase.js';
import { showCallPopup, showSMSPopup } from './utils.js';

document.addEventListener('DOMContentLoaded', async () => {
  const user = await requireAuth();
  if (!user) return;

  // Load mechanics
  await loadMechanics();

  // Load bookings
  await loadBookings();

  // Logout button
  document.getElementById('btnLogout').onclick = async () => {
    await supabase.auth.signOut();
    window.location.href = 'index.html';
  };
});

async function loadMechanics() {
  const { data, error } = await supabase
    .from('mechanic_details')
    .select(`
      *,
      profiles (full_name, phone, is_online)
    `);

  const list = document.getElementById('mechanicList');
  list.innerHTML = '';

  data.forEach(m => {
    const statusColor = m.profiles.is_online ? 'green' : 'red';
    const statusText = m.profiles.is_online ? 'Online' : 'Offline';

    list.innerHTML += `
      <div class="card">
        <h3>${m.shop_name}</h3>
        <p>By: ${m.profiles.full_name}</p>
        <p>📍 ${m.address}</p>
        <p><span style="color: ${statusColor}">${statusText}</span></p>
        <button onclick="showCallPopup('${m.profiles.phone}')">📞 Call</button>
        <button onclick="showSMSPopup('${m.profiles.phone}')">💬 SMS</button>
        <button onclick="bookService('${m.user_id}')">✅ Book</button>
      </div>
    `;
  });
}

async function loadBookings() {
  const user = (await supabase.auth.getUser()).data.user;
  const { data, error } = await supabase
    .from('bookings')
    .select('*')
    .eq('customer_id', user.id);

  const list = document.getElementById('customerBookings');
  list.innerHTML = '';

  data.forEach(b => {
    list.innerHTML += `
      <div class="card">
        <p>Service: ${b.service_type}</p>
        <p>Status: ${b.status}</p>
        <p>Mechanic: ${b.mechanic_id}</p>
      </div>
    `;
  });
}
