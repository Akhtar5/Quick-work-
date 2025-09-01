// customer.js
import { supabase } from "./supabase.js";

// Fetch mechanics
async function loadMechanics() {
  const { data, error } = await supabase
    .from("mechanics")
    .select("*");

  if (error) {
    console.error("Error fetching mechanics:", error.message);
    return;
  }

  const list = document.getElementById("mechanicList");
  list.innerHTML = "";
  data.forEach(m => {
    const li = document.createElement("li");
    li.innerHTML = `
      <b>${m.name}</b> (${m.skill}) - ${m.status}
      <button onclick="startChat(${m.id})">Chat</button>
      <button onclick="startCall('${m.phone}')">Call</button>
    `;
    list.appendChild(li);
  });
}

// Example Chat/Call (connect with supabase realtime later)
function startChat(mechanicId) {
  alert("Chat started with mechanic ID: " + mechanicId);
}

function startCall(phone) {
  window.open(`tel:${phone}`);
}

window.loadMechanics = loadMechanics;
window.startChat = startChat;
window.startCall = startCall;
