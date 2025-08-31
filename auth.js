function showSignup() {
  document.getElementById("login-box").style.display = "none";
  document.getElementById("signup-box").style.display = "block";
}

function showLogin() {
  document.getElementById("signup-box").style.display = "none";
  document.getElementById("login-box").style.display = "block";
}

function signupUser() {
  let name = document.getElementById("signup-name").value;
  let email = document.getElementById("signup-email").value;
  let password = document.getElementById("signup-password").value;
  let role = document.getElementById("signup-role").value;

  if (!name || !email || !password) {
    alert("Please fill all fields");
    return;
  }

  // 🔹 LocalStorage based user register (later Supabase se connect karenge)
  let users = JSON.parse(localStorage.getItem("users")) || [];
  if (users.find(u => u.email === email)) {
    alert("Email already exists");
    return;
  }

  users.push({ name, email, password, role });
  localStorage.setItem("users", JSON.stringify(users));

  alert("Signup successful! Please login.");
  showLogin();
}

function loginUser() {
  let email = document.getElementById("login-email").value;
  let password = document.getElementById("login-password").value;

  let users = JSON.parse(localStorage.getItem("users")) || [];
  let user = users.find(u => u.email === email && u.password === password);

  if (!user) {
    alert("Invalid email or password");
    return;
  }

  localStorage.setItem("loggedInUser", JSON.stringify(user));

  // 🔹 Redirect based on role
  if (user.role === "customer") {
    window.location.href = "customer.html";
  } else {
    window.location.href = "mechanic.html";
  }
}
