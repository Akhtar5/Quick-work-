// map.js

// Map को initialize करना
const map = L.map("map").setView([23.6102, 85.2799], 13); // Default Ranchi, Jharkhand

// Tile layer (OpenStreetMap free)
L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  attribution: "© OpenStreetMap contributors"
}).addTo(map);

// User ki current location show karna
if (navigator.geolocation) {
  navigator.geolocation.getCurrentPosition(
    (position) => {
      const lat = position.coords.latitude;
      const lng = position.coords.longitude;

      // Marker add karo
      L.marker([lat, lng])
        .addTo(map)
        .bindPopup("You are here")
        .openPopup();

      // Map ko user ke location pe le jao
      map.setView([lat, lng], 14);
    },
    () => {
      alert("Location access blocked. Default map loaded.");
    }
  );
}
