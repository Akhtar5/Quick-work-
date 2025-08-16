
// Supabase connection
const SUPABASE_URL = "https://fzkjrtudqirpefxsvilc.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ6a2pydHVkcWlycGVmeHN2aWxjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUzMjEyNjcsImV4cCI6MjA3MDg5NzI2N30.aSZaNoz5BXESVeYnRAU_cNuOmaN7mOi0nd5-FEN-fZk";

const { createClient } = supabase;
const db = createClient(SUPABASE_URL, SUPABASE_KEY);

// Switch panels
function showPanel(panelId) {
  document.querySelectorAll(".panel").forEach(p => p.classList.remove("active"));
  document.getElementById(panelId).classList.add("active");
}

// Register mechanic
async function registerMechanic() {
  let name = document.getElementById("mName").value;
  let dept = document.getElementById("mDept").value;
  let phone = document.getElementById("mPhone").value;

  let { data, error } = await db.from("mechanics").insert([{ name, dept, phone, status: "offline" }]);
  if (error) {
    alert("Error: " + error.message);
  } else {
    alert("Mechanic Registered!");
  }
}

// Register customer
async function registerCustomer() {
  let name = document.getElementById("cName").value;
  let phone = document.getElementById("cPhone").value;

  let { data, error } = await db.from("customers").insert([{ name, phone }]);
  if (error) {
    alert("Error: " + error.message);
  } else {
    alert("Customer Registered!");
  }
}

// Fetch mechanics for customer panel
async function loadMechanics() {
  let { data, error } = await db.from("mechanics").select("*");
  if (error) {
    alert("Error: " + error.message);
    return;
  }

  let list = document.getElementById("mechanicList");
  list.innerHTML = "";
  data.forEach(m => {
    let card = `
      <div class="card">
        <h3>${m.name}</h3>
        <p>Dept: ${m.dept}</p>
        <p>Phone: ${m.phone}</p>
        <p>Status: ${m.status}</p>
        <button onclick="bookMechanic('${m.id}')">Book</button>
      </div>
    `;
    list.innerHTML += card;
  });
}

// Book mechanic
async function bookMechanic(id) {
  alert("Booking mechanic with ID: " + id);
}
