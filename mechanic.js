// mechanic.js
import { supabase } from "./supabase.js";

// Profile Save
async function saveMechanicProfile(name, phone, skill) {
  const { data, error } = await supabase
    .from("mechanics")
    .insert([{ name, phone, skill, status: "offline" }]);

  if (error) {
    console.error("Profile save error:", error.message);
  } else {
    alert("Profile saved successfully!");
  }
}

// Status Toggle
async function toggleMechanicStatus(id, newStatus) {
  const { error } = await supabase
    .from("mechanics")
    .update({ status: newStatus })
    .eq("id", id);

  if (error) {
    console.error("Status update error:", error.message);
  }
}

// Example Chat/Call placeholder (later expand with Supabase Realtime)
function startChat(mechanicId) {
  alert("Chat started with mechanic ID: " + mechanicId);
}

function startCall(phone) {
  window.open(`tel:${phone}`);
}

// Make functions global (so HTML buttons can call them)
window.saveMechanicProfile = saveMechanicProfile;
window.toggleMechanicStatus = toggleMechanicStatus;
window.startChat = startChat;
window.startCall = startCall;
