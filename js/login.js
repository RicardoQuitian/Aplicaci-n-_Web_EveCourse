// ===============================
// CONFIGURACIÓN DE SUPABASE
// ===============================
const supabaseUrl = "https://aczbveqbxzwaygabuezx.supabase.co";
const supabaseKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFjemJ2ZXFieHp3YXlnYWJ1ZXp4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg0Nzk3NzAsImV4cCI6MjA3NDA1NTc3MH0.xNxsTIdnKQ2CxsYSvJH9ywE9ESAKeLaIlqe0YJsDwFs";
const supabase = window.supabase.createClient(supabaseUrl, supabaseKey);

// ===============================
// FUNCIÓN DE LOGIN
// ===============================
document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("loginForm");
  const emailInput = document.getElementById("email");
  const passwordInput = document.getElementById("password");
  const btnLogin = document.getElementById("btnLogin");
  const spinner = document.getElementById("spinner");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = emailInput.value.trim();
    const password = passwordInput.value.trim();

    if (!email || !password) {
      showAlert("Por favor completa todos los campos", "warning");
      return;
    }

    btnLogin.disabled = true;
    spinner.style.display = "block";

    try {
      const { data, error } = await supabase
        .from("usuario")
        .select("*")
        .eq("email", email)
        .eq("contrasena", password)
        .single();

      if (error || !data) {
        showAlert("Correo o contraseña incorrectos", "danger");
      } else {
        showAlert("Inicio de sesión exitoso", "success");
        localStorage.setItem("usuario", JSON.stringify(data));
        setTimeout(() => {
          window.location.href = "index.html";
        }, 1500);
      }
    } catch (err) {
      console.error("Error:", err);
      showAlert("Error al iniciar sesión", "danger");
    } finally {
      btnLogin.disabled = false;
      spinner.style.display = "none";
    }
  });
});

// ===============================
// ALERTAS DE BOOTSTRAP
// ===============================
function showAlert(message, type) {
  const alertBox = document.createElement("div");
  alertBox.className = `alert alert-${type} mt-3 text-center`;
  alertBox.textContent = message;
  alertBox.style.borderRadius = "8px";
  alertBox.style.fontWeight = "500";

  const loginBox = document.querySelector(".login-box");
  loginBox.appendChild(alertBox);

  setTimeout(() => alertBox.remove(), 3000);
}

// ===============================
// MOSTRAR / OCULTAR CONTRASEÑA
// ===============================
document.querySelector(".toggle-password").addEventListener("click", function () {
  const input = document.getElementById("password");
  const icon = this.querySelector("i");
  if (input.type === "password") {
    input.type = "text";
    icon.classList.remove("fa-eye");
    icon.classList.add("fa-eye-slash");
  } else {
    input.type = "password";
    icon.classList.remove("fa-eye-slash");
    icon.classList.add("fa-eye");
  }
});
