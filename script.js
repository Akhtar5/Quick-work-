function showSection(id) {
    document.querySelectorAll("section").forEach(sec => sec.classList.add("hidden"));
    document.getElementById(id).classList.remove("hidden");
}

function signup() {
    const name = document.getElementById("signupName").value;
    const email = document.getElementById("signupEmail").value;
    const password = document.getElementById("signupPassword").value;
    localStorage.setItem("user", JSON.stringify({ name, email, password }));
    alert("Signup successful! Please login.");
    showSection("login");
}

function login() {
    const email = document.getElementById("loginEmail").value;
    const password = document.getElementById("loginPassword").value;
    const user = JSON.parse(localStorage.getItem("user"));

    if (user && user.email === email && user.password === password) {
        alert("Login successful!");
        showSection("mechanics");
        loadMap();
    } else {
        alert("Invalid email or password");
    }
}

function loadMap() {
    const map = L.map('map').setView([23.6102, 85.2799], 13);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors'
    }).addTo(map);

    const mechanics = [
        { name: "Ravi Mechanic", lat: 23.6102, lng: 85.2799, phone: "9999999999" },
        { name: "Sohan Auto Works", lat: 23.6150, lng: 85.2805, phone: "8888888888" }
    ];

    mechanics.forEach(m => {
        L.marker([m.lat, m.lng]).addTo(map)
            .bindPopup(`<b>${m.name}</b><br>📞 ${m.phone}<br><a href="https://wa.me/91${m.phone}">WhatsApp</a>`);
    });
}
