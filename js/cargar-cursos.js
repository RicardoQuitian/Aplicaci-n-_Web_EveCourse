// ==============================
// CONFIGURACIÓN DE SUPABASE
// ==============================
const supabaseUrl = "https://aczbveqbxzwaygabuezx.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFjemJ2ZXFieHp3YXlnYWJ1ZXp4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg0Nzk3NzAsImV4cCI6MjA3NDA1NTc3MH0.xNxsTIdnKQ2CxsYSvJH9ywE9ESAKeLaIlqe0YJsDwFs";
const supabase = window.supabase.createClient(supabaseUrl, supabaseKey);



// ==============================
// CARGAR CURSOS EN INDEX.HTML (CAROUSEL)
// ==============================
async function cargarCursosDestacados() {
    try {
        const { data, error } = await supabase
            .from("servicio")
            .select(`
                *,
                categoria:id_categoria(nombre),
                promocion:id_promocion(nombre),
                usuario:id_usuario(nombre_usuario)
            `)
            .limit(3);

        if (error) throw error;

        const carouselInner = document.querySelector('.carousel-inner');
        if (!carouselInner) return;

        carouselInner.innerHTML = '';

        data.forEach((curso, index) => {
            const precioOriginal = curso.precio * 1.5;
            const descuento = Math.round(((precioOriginal - curso.precio) / precioOriginal) * 100);
            const estrellas = generarEstrellas(4.5);
            
            const slide = `
                <div class="carousel-item ${index === 0 ? 'active' : ''}">
                    <div class="hero-slide" style="background-image: url('${curso.imagen || 'https://picsum.photos/1200/500?random=' + index}');">
                        <div class="hero-overlay p-4 p-lg-5 ${index === 0 ? 'show' : ''}">
                            <span class="badge bg-primary mb-2">${curso.categoria?.nombre || 'General'}</span>
                            <h3 class="fw-bold text-white">${curso.nombre_curso}</h3>
                            <p class="text-light">${curso.descripcion.substring(0, 120)}...</p>
                            <div class="d-flex align-items-center mb-2 text-light">
                                <span>Por ${curso.usuario?.nombre_usuario || 'Instructor'}</span>
                            </div>
                            <div class="d-flex align-items-center text-light mb-3">
                                <span class="text-warning me-2">${estrellas}</span>
                                <span class="me-3">4.5</span>
                                <span><i class="fas fa-user-graduate me-1"></i> ${Math.floor(Math.random() * 10000) + 5000} estudiantes</span>
                            </div>
                            <div class="d-flex align-items-center mt-3">
                                <h4 class="text-white mb-0 me-2">€${curso.precio}</h4>
                                ${descuento > 0 ? `
                                    <span class="text-decoration-line-through text-light opacity-75">€${precioOriginal.toFixed(2)}</span>
                                    <span class="badge bg-danger ms-2">${descuento}%</span>
                                ` : ''}
                            </div>
                            <div class="mt-4">
                                <button class="btn btn-primary rounded-pill px-4 me-2" onclick="verDetalleCurso(${curso.id_servicio})">Ver Curso</button>
                                <button class="btn btn-light rounded-pill px-4" onclick="verDetalleCurso(${curso.id_servicio})">Preview</button>
                            </div>
                        </div>
                    </div>
                </div>
            `;
            carouselInner.innerHTML += slide;
        });

        console.log('Cursos destacados cargados en carousel');
    } catch (error) {
        console.error('Error al cargar cursos destacados:', error);
    }
}

// ==============================
// CARGAR CURSOS EN CURSOS.HTML (GRID)
// ==============================
async function cargarTodosCursos() {
    mostrarLoader();

    try {
        const { data, error } = await supabase
            .from("servicio")
            .select(`
                *,
                categoria:id_categoria(nombre),
                promocion:id_promocion(nombre),
                usuario:id_usuario(nombre_usuario)
            `)
            .order('id_servicio', { ascending: false });

        if (error) throw error;

        const gridCursos = document.getElementById('contenedor-cursos');
        if (!gridCursos) return;

        gridCursos.innerHTML = '';

        if (data.length === 0) {
            gridCursos.innerHTML = `
                <div class="col-12 text-center py-5">
                    <i class="fas fa-inbox fa-3x text-muted mb-3"></i>
                    <p class="text-muted">No hay cursos disponibles en este momento.</p>
                </div>
            `;
            ocultarLoader();
            return;
        }

        data.forEach((curso, index) => {
            const precioOriginal = curso.precio * 1.5;
            const descuento = Math.round(((precioOriginal - curso.precio) / precioOriginal) * 100);
            const rating = (Math.random() * 0.5 + 4.5).toFixed(1);
            const estudiantes = Math.floor(Math.random() * 10000) + 3000;
            const horas = Math.floor(Math.random() * 40) + 20;

            const tarjeta = `
                <div class="col-md-4">
                    <div class="card h-100 shadow-sm">
                        <div class="position-relative">
                            <img src="${curso.imagen || 'https://picsum.photos/400/250?random=' + index}" class="card-img-top" alt="${curso.nombre_curso}">
                            <div class="position-absolute top-0 start-0 m-2">
                                ${descuento > 0 ? `<span class="badge bg-danger">-${descuento}%</span>` : ''}
                                ${curso.promocion ? `<span class="badge bg-warning text-dark">${curso.promocion.nombre}</span>` : ''}
                                <span class="badge bg-primary">${curso.categoria?.nombre || 'General'}</span>
                            </div>
                        </div>
                        <div class="card-body">
                            <h5 class="card-title">${curso.nombre_curso}</h5>
                            <p class="card-text text-muted">Por ${curso.usuario?.nombre_usuario || 'Instructor'}</p>
                            <p class="text-warning mb-1">★ ${rating} (${estudiantes.toLocaleString()})</p>
                            <p class="text-muted small mb-1">${estudiantes.toLocaleString()} estudiantes • ${horas} horas</p>
                            <p class="text-muted small">Intermedio • Español</p>
                        </div>
                        <div class="card-footer d-flex justify-content-between align-items-center">
                            <span class="fw-bold text-success">€${curso.precio}</span>
                            <button class="btn btn-primary btn-sm" onclick="verDetalleCurso(${curso.id_servicio})">Ver Detalles</button>
                        </div>
                    </div>
                </div>
            `;
            gridCursos.innerHTML += tarjeta;
        });

        console.log(`${data.length} cursos cargados en grid`);
    } catch (error) {
        console.error('Error al cargar cursos:', error);
    } finally {
        ocultarLoader();
    }
}

    function mostrarLoader() {
    document.getElementById('loader').style.display = 'block';
    document.getElementById('contenedor-cursos').style.display = 'none';
    }

    function ocultarLoader() {
        document.getElementById('loader').style.display = 'none';
        document.getElementById('contenedor-cursos').style.display = 'flex';
    }

// ==============================
// CARGAR DETALLE DE UN CURSO
// ==============================
async function cargarDetalleCurso() {
    try {
        // Obtener ID del curso de la URL
        const urlParams = new URLSearchParams(window.location.search);
        const cursoId = urlParams.get('id');

        if (!cursoId) {
            window.location.href = 'cursos.html';
            return;
        }

        const { data, error } = await supabase
            .from("servicio")
            .select(`
                *,
                categoria:id_categoria(nombre),
                promocion:id_promocion(nombre),
                usuario:id_usuario(nombre_usuario)
            `)
            .eq('id_servicio', cursoId)
            .single();

        if (error) throw error;

        // Actualizar el contenido de la página
        const precioOriginal = data.precio * 1.5;
        const descuento = Math.round(((precioOriginal - data.precio) / precioOriginal) * 100);
        const rating = (Math.random() * 0.5 + 4.5).toFixed(1);
        const estudiantes = Math.floor(Math.random() * 10000) + 3000;
        const horas = Math.floor(Math.random() * 40) + 20;

        // Actualizar título y meta
        document.title = `${data.nombre_curso} - EveCourse`;

        // Actualizar header del curso
        const courseHeader = document.querySelector('.course-header');
        if (courseHeader) {
            courseHeader.innerHTML = `
                <div class="d-flex align-items-center mb-3">
                    <span class="badge bg-primary me-2">${data.categoria?.nombre || 'General'}</span>
                    ${descuento > 0 ? `<span class="badge bg-danger me-2">-${descuento}% OFF</span>` : ''}
                    ${data.promocion ? `<span class="badge bg-warning text-dark">${data.promocion.nombre}</span>` : ''}
                </div>
                <h1 class="fw-bold">${data.nombre_curso}</h1>
                <div class="d-flex align-items-center mb-3 text-muted">
                    <i class="fas fa-star text-warning me-1"></i>
                    <span class="me-3">${rating} (${estudiantes.toLocaleString()} estudiantes)</span>
                    <i class="fas fa-clock me-1"></i>
                    <span class="me-3">${horas} horas</span>
                    <i class="fas fa-globe me-1"></i>
                    <span class="me-3">Español</span>
                    <i class="fas fa-signal me-1"></i>
                    <span>Intermedio</span>
                </div>
                <p>${data.descripcion}</p>
                <p>Instructor: ${data.usuario?.nombre_usuario || 'Instructor Profesional'}</p>
                <div class="course-image mb-3">
                    <img src="${data.imagen || 'https://picsum.photos/1200/500?random=1'}" class="img-fluid rounded" alt="${data.nombre_curso}">
                </div>
                <div class="course-description p-4 bg-white shadow-sm rounded mt-3">
                    <h5 class="fw-bold mb-2">Descripción del curso</h5>
                    <p>${data.descripcion}</p>
                    <p>Este curso incluye contenido actualizado y práctico que te permitirá dominar las habilidades necesarias para destacar en el mercado laboral.</p>
                </div>
            `;
        }

        // Actualizar sidebar
        const courseSidebar = document.querySelector('.course-sidebar');
        if (courseSidebar) {
            courseSidebar.innerHTML = `
                <div class="mb-3 text-center">
                    <span class="h3 fw-bold">€${data.precio}</span>
                    ${descuento > 0 ? `
                        <span class="text-decoration-line-through text-muted">€${precioOriginal.toFixed(2)}</span>
                        <p class="text-danger mb-0">¡Oferta por tiempo limitado!</p>
                    ` : ''}
                </div>
                <button class="btn btn-primary w-100 mb-2">
                    <i class="fas fa-shopping-cart me-2"></i>Agregar al Carrito
                </button>
                <button class="btn btn-outline-secondary w-100 mb-3">
                    <i class="fas fa-gift me-2"></i>Regalar este curso
                </button>
                <div class="alert alert-success d-flex align-items-center" role="alert">
                    <i class="fas fa-check-circle me-2"></i>
                    <div>
                        Garantía de 30 días<br>
                        Reembolso completo si no estás satisfecho
                    </div>
                </div>
                <hr>
                <h5>Este curso incluye:</h5>
                <ul class="list-unstyled">
                    <li><i class="fas fa-clock me-2 text-primary"></i>${horas} horas de contenido</li>
                    <li><i class="fas fa-user me-2 text-primary"></i>Acceso de por vida</li>
                    <li><i class="fas fa-mobile-alt me-2 text-primary"></i>Acceso en móvil y TV</li>
                    <li><i class="fas fa-certificate me-2 text-primary"></i>Certificado de finalización</li>
                    <li><i class="fas fa-headset me-2 text-primary"></i>Soporte del instructor</li>
                </ul>
            `;
        }

        console.log('Detalle del curso cargado');
    } catch (error) {
        console.error('Error al cargar detalle del curso:', error);
        alert('Error al cargar el curso. Redirigiendo...');
        window.location.href = 'cursos.html';
    }
}

// ==============================
// VER DETALLE DE CURSO
// ==============================
function verDetalleCurso(id) {
    window.location.href = `servicio.html?id=${id}`;
}

// ==============================
// GENERAR ESTRELLAS
// ==============================
function generarEstrellas(rating) {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    let stars = '';
    
    for (let i = 0; i < fullStars; i++) {
        stars += '<i class="fas fa-star"></i>';
    }
    if (hasHalfStar) {
        stars += '<i class="fas fa-star-half-alt"></i>';
    }
    const emptyStars = 5 - Math.ceil(rating);
    for (let i = 0; i < emptyStars; i++) {
        stars += '<i class="far fa-star"></i>';
    }
    
    return stars;
}

// ==============================
// INICIALIZAR SEGÚN LA PÁGINA
// ==============================
document.addEventListener('DOMContentLoaded', () => {
    const currentPage = window.location.pathname.split('/').pop();
    
    if (currentPage === 'index.html' || currentPage === '') {
        cargarCursosDestacados();
    } else if (currentPage === 'cursos.html') {
        cargarTodosCursos();
    } else if (currentPage === 'servicio.html') {
        cargarDetalleCurso();
    }
});
