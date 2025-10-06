// ==============================
// VERIFICAR SESIÓN EN NAVBAR
// ==============================
document.addEventListener("DOMContentLoaded", () => {
    verificarSesion();
    inicializarAnimaciones();
});

// ==============================
// FUNCIÓN PARA VERIFICAR SESIÓN
// ==============================
function verificarSesion() {
    const usuarioStorage = localStorage.getItem("usuario");
    
    if (usuarioStorage) {
        const usuario = JSON.parse(usuarioStorage);
        actualizarNavbar(usuario);
    }
}

// ==============================
// ACTUALIZAR NAVBAR SEGÚN USUARIO
// ==============================
function actualizarNavbar(usuario) {
    const navbarNav = document.querySelector(".navbar-nav.mx-auto");
    const loginBtn = document.querySelector(".btn-login");
    
    if (!navbarNav || !loginBtn) return;

    // Si el usuario es admin (id_rol = 1), agregar enlace al panel
    if (usuario.id_rol === 1) {
        const adminLi = document.createElement("li");
        adminLi.className = "nav-item";
        adminLi.innerHTML = `
            <a class="nav-link nav-pill" href="admin-servicios.html">
                <i class="fas fa-cog me-1"></i>Admin
            </a>
        `;
        navbarNav.appendChild(adminLi);
    }

    // Cambiar botón de login por nombre de usuario
    loginBtn.innerHTML = `
        <i class="fas fa-user me-2"></i>${usuario.nombre_usuario}
    `;
    loginBtn.href = "#";
    loginBtn.title = "Click para cerrar sesión";
    
    // Agregar evento de cerrar sesión
    loginBtn.addEventListener("click", (e) => {
        e.preventDefault();
        cerrarSesion();
    });
}

// ==============================
// CERRAR SESIÓN
// ==============================
function cerrarSesion() {
    if (confirm("¿Deseas cerrar sesión?")) {
        localStorage.removeItem("usuario");
        window.location.href = "index.html";
    }
}

// ==============================
// ANIMACIONES (código existente)
// ==============================
function inicializarAnimaciones() {
    // 1. Contadores animados
    animarContadores();
    
    // 2. Animación en slides del carousel
    animarCarousel();
    
    // 3. Mostrar tarjetas con animación
    mostrarCards();
    
    // 4. Animación hover en botones
    animarBotones();
}

// Contadores animados
function animarContadores() {
    const contadores = document.querySelectorAll('.fw-bold.text-primary.animado');
    contadores.forEach(contador => {
        let max = parseInt(contador.textContent.replace(/\D/g, ''));
        let min = Math.floor(max * 0.8);
        let valor = min;
        contador.textContent = valor;
        
        setInterval(() => {
            let cambio = Math.floor(Math.random() * 40) - 20;
            valor += cambio;
            if (valor > max) valor = max;
            if (valor < min) valor = min;
            contador.textContent = valor;
        }, 500);
    });
}

// Animación carousel
function animarCarousel() {
    function animateSlide(slide) {
        if (!slide) return;
        const overlay = slide.querySelector('.hero-overlay');
        if (overlay) {
            overlay.classList.remove('show');
            setTimeout(() => overlay.classList.add('show'), 100);
        }
    }

    const carousel = document.getElementById('heroCarousel');
    if (carousel) {
        const slides = carousel.querySelectorAll('.carousel-item');
        carousel.addEventListener('slid.bs.carousel', (e) => {
            animateSlide(e.relatedTarget);
        });
        
        if (slides.length > 0) {
            animateSlide(slides[0]);
        }
    }
}

// Mostrar cards
function mostrarCards() {
    window.addEventListener('load', () => {
        const cards = document.querySelectorAll('.card');
        cards.forEach(card => card.classList.add('show'));
    });
}

// Animar botones
function animarBotones() {
    document.querySelectorAll('.btn').forEach(btn => {
        btn.addEventListener('mouseenter', () => {
            btn.style.transform = 'scale(1.05)';
            btn.style.transition = 'transform 0.3s ease';
        });
        btn.addEventListener('mouseleave', () => {
            btn.style.transform = 'scale(1)';
        });
    });
}