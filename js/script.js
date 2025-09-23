
// 1. Contadores animados
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


// 2. Animación en slides del carousel
function animateSlide(slide) {
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
    animateSlide(slides[0]);
}


// 3. Mostrar tarjetas con animación al cargar
window.addEventListener('load', () => {
    const cards = document.querySelectorAll('.card');
    cards.forEach(card => card.classList.add('show'));
});


// 4. Animación hover en botones
document.querySelectorAll('.btn').forEach(btn => {
    btn.addEventListener('mouseenter', () => {
        btn.style.transform = 'scale(1.05)';
        btn.style.transition = 'transform 0.3s ease';
    });
    btn.addEventListener('mouseleave', () => {
        btn.style.transform = 'scale(1)';
    });
});
