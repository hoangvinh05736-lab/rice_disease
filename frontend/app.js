// Load users from localStorage
function loadUsers() {
  return JSON.parse(localStorage.getItem("users") || "[]");
}

// Save updated list
function saveUsers(users) {
  localStorage.setItem("users", JSON.stringify(users));
}

// Save current user
function setCurrentUser(user) {
  localStorage.setItem("currentUser", JSON.stringify(user));
}

// Get current user
function getCurrentUser() {
  return JSON.parse(localStorage.getItem("currentUser"));
}

// DOM elements
const title = document.getElementById("title");
const nameProject = document.getElementById("nameProject");
const switchBtn = document.getElementById("switch");
const actionBtn = document.getElementById("action-btn");
const registerFields = document.getElementById("register-fields");
const message = document.getElementById("message");
const profile = document.getElementById("profile");
const profileName = document.getElementById("profile-name");
const rice_disease = document.getElementById("rice_disease");
const cirtus_disease = document.getElementById("cirtus_disease");

let mode = "login"; // login / register

// Switch between login & register
switchBtn.onclick = () => {
  if (mode === "login") {
    mode = "register";
    title.textContent = "Đăng ký";
    actionBtn.textContent = "Tạo tài khoản";
    registerFields.style.display = "block";
    switchBtn.textContent = "Đăng nhập";
  } else {
    mode = "login";
    title.textContent = "Đăng nhập";
    actionBtn.textContent = "Đăng nhập";
    registerFields.style.display = "none";
    switchBtn.textContent = "Đăng ký";
  }
  message.innerHTML = "";
};

// Action button
actionBtn.onclick = () => {
  const email = document.getElementById("email").value.trim();
  const pass = document.getElementById("password").value.trim();
  const username = document.getElementById("username")?.value.trim();

  if (mode === "register") {
    if (!username || !email || pass.length < 6) {
      message.innerHTML =
        "<p style='color:red;'>Hãy nhập đủ thông tin (mật khẩu >= 6 ký tự).</p>";
      return;
    }

    const users = loadUsers();
    if (users.some((u) => u.email === email)) {
      message.innerHTML = "<p style='color:red;'>Email đã tồn tại.</p>";
      return;
    }

    const newUser = { username, email, pass };
    users.push(newUser);
    saveUsers(users);
    setCurrentUser(newUser);

    message.innerHTML = "<p style='color:green;'>Đăng ký thành công!</p>";
    showProfile(newUser);
  } else {
    const users = loadUsers();
    const found = users.find((u) => u.email === email && u.pass === pass);

    if (!found) {
      message.innerHTML = "<p style='color:red;'>Sai email hoặc mật khẩu.</p>";
      return;
    }

    setCurrentUser(found);
    message.innerHTML = "<p style='color:green;'>Đăng nhập thành công!</p>";
    showProfile(found);
  }
};

//Chuẩn đoán ở lúa
rice_disease.onclick = () => {
  window.location.href = "rice.html";
};

// Hiển thị giao diện sau khi đăng nhập
function showProfile(user) {
  document.getElementById("title").style.display = "none";
  document.getElementById("nameProject").style.display = "flex";
  document.querySelector(".toggle").style.display = "none";
  actionBtn.style.display = "none";
  document.getElementById("email").style.display = "none";
  document.getElementById("password").style.display = "none";
  registerFields.style.display = "none";

  profile.style.display = "block";
  profileName.textContent = user.username;
}

// Đăng xuất
document.getElementById("logout").onclick = () => {
  localStorage.removeItem("currentUser");
  location.reload();
};

// Tự động đăng nhập nếu đã lưu
const savedUser = getCurrentUser();
if (savedUser) showProfile(savedUser);
