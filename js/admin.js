// ==============================
// CONFIGURACIÓN DE SUPABASE
// ==============================
const supabaseUrl = "https://aczbveqbxzwaygabuezx.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFjemJ2ZXFieHp3YXlnYWJ1ZXp4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg0Nzk3NzAsImV4cCI6MjA3NDA1NTc3MH0.xNxsTIdnKQ2CxsYSvJH9ywE9ESAKeLaIlqe0YJsDwFs";
const supabase = window.supabase.createClient(supabaseUrl, supabaseKey);

// Variables globales
let usuarioActual = null;
let categorias = [];
let promociones = [];
let modoEdicion = false;

// ==============================
// VERIFICAR AUTENTICACIÓN Y ROL
// ==============================
document.addEventListener("DOMContentLoaded", async () => {
    // Obtener usuario del localStorage
    const usuarioStorage = localStorage.getItem("usuario");
    
    if (!usuarioStorage) {
        mostrarNoAutorizado();
        return;
    }

    usuarioActual = JSON.parse(usuarioStorage);

    // Verificar si el usuario es admin (id_rol = 1)
    if (usuarioActual.id_rol !== 1) {
        mostrarNoAutorizado();
        return;
    }

    // Si es admin, mostrar el panel
    document.getElementById("adminPanel").classList.remove("d-none");
    document.getElementById("adminName").innerHTML = `<i class="fas fa-user-shield"></i> ${usuarioActual.nombre_usuario}`;

    // Cargar datos iniciales
    await cargarCategorias();
    await cargarPromociones();
    await cargarServicios();

    // Configurar eventos
    configurarEventos();
});

// ==============================
// MOSTRAR MENSAJE DE NO AUTORIZADO
// ==============================
function mostrarNoAutorizado() {
    document.getElementById("alertNoAuth").classList.remove("d-none");
    setTimeout(() => {
        window.location.href = "index.html";
    }, 3000);
}

// ==============================
// CARGAR CATEGORÍAS
// ==============================
async function cargarCategorias() {
    try {
        const { data, error } = await supabase
            .from("categoria")
            .select("*")
            .order("nombre");

        if (error) throw error;

        categorias = data;
        const select = document.getElementById("idCategoria");
        select.innerHTML = '<option value="">Seleccionar...</option>';
        
        categorias.forEach(cat => {
            select.innerHTML += `<option value="${cat.id_categoria}">${cat.nombre}</option>`;
        });
    } catch (error) {
        console.error("Error al cargar categorías:", error);
        mostrarAlerta("Error al cargar categorías", "danger");
    }
}

// ==============================
// CARGAR PROMOCIONES
// ==============================
async function cargarPromociones() {
    try {
        const { data, error } = await supabase
            .from("promocion")
            .select("*")
            .eq("estado", true)
            .order("nombre");

        if (error) throw error;

        promociones = data;
        const select = document.getElementById("idPromocion");
        select.innerHTML = '<option value="">Sin promoción</option>';
        
        promociones.forEach(promo => {
            select.innerHTML += `<option value="${promo.id_promocion}">${promo.nombre}</option>`;
        });
    } catch (error) {
        console.error("Error al cargar promociones:", error);
    }
}

// ==============================
// CARGAR SERVICIOS (READ)
// ==============================
async function cargarServicios() {
    try {
        const tbody = document.getElementById("tablaServicios");
        tbody.innerHTML = `
            <tr>
                <td colspan="7" class="text-center py-5">
                    <div class="spinner-border text-primary" role="status"></div>
                    <p class="mt-2 text-muted">Cargando servicios...</p>
                </td>
            </tr>
        `;

        const { data, error } = await supabase
            .from("servicio")
            .select(`
                *,
                categoria:id_categoria(nombre),
                promocion:id_promocion(nombre),
                usuario:id_usuario(nombre_usuario)
            `)
            .eq("id_usuario", usuarioActual.id_usuario)
            .order("id_servicio", { ascending: false });

        if (error) throw error;

        if (data.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="7" class="text-center py-5 text-muted">
                        <i class="fas fa-inbox fa-3x mb-3 d-block"></i>
                        No hay servicios registrados. ¡Crea el primero!
                    </td>
                </tr>
            `;
            return;
        }

        tbody.innerHTML = "";
        data.forEach(servicio => {
            const fila = crearFilaServicio(servicio);
            tbody.innerHTML += fila;
        });

    } catch (error) {
        console.error("Error al cargar servicios:", error);
        mostrarAlerta("Error al cargar servicios", "danger");
        document.getElementById("tablaServicios").innerHTML = `
            <tr>
                <td colspan="7" class="text-center text-danger">
                    Error al cargar los datos
                </td>
            </tr>
        `;
    }
}

// ==============================
// CREAR FILA DE TABLA
// ==============================
function crearFilaServicio(servicio) {
    const categoriaNombre = servicio.categoria?.nombre || "Sin categoría";
    const promoNombre = servicio.promocion?.nombre || "Sin promoción";
    
    return `
        <tr>
            <td>${servicio.id_servicio}</td>
            <td><strong>${servicio.nombre_curso}</strong></td>
            <td>${servicio.descripcion.substring(0, 50)}...</td>
            <td><span class="badge bg-success">€${servicio.precio}</span></td>
            <td><span class="badge bg-info text-dark">${categoriaNombre}</span></td>
            <td><span class="badge bg-warning text-dark">${promoNombre}</span></td>
            <td class="text-center">
                <button class="btn btn-sm btn-primary me-1" onclick="editarServicio(${servicio.id_servicio})">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn btn-sm btn-danger" onclick="confirmarEliminar(${servicio.id_servicio}, '${servicio.nombre_curso}')">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        </tr>
    `;
}

// ==============================
// CONFIGURAR EVENTOS
// ==============================
function configurarEventos() {
    // Botón guardar
    document.getElementById("btnGuardar").addEventListener("click", guardarServicio);

    // Botón cerrar sesión
    document.getElementById("btnLogout").addEventListener("click", () => {
        localStorage.removeItem("usuario");
        window.location.href = "index.html";
    });

    // Limpiar formulario al cerrar modal
    document.getElementById("modalServicio").addEventListener("hidden.bs.modal", () => {
        limpiarFormulario();
    });

    // Abrir modal para crear nuevo
    document.querySelector('[data-bs-target="#modalServicio"]').addEventListener("click", () => {
        modoEdicion = false;
        limpiarFormulario();
        document.getElementById("modalTitle").innerHTML = '<i class="fas fa-plus-circle me-2"></i>Nuevo Servicio';
    });
}

// ==============================
// GUARDAR SERVICIO (CREATE/UPDATE)
// ==============================
async function guardarServicio() {
    const btnGuardar = document.getElementById("btnGuardar");
    const servicioId = document.getElementById("servicioId").value;
    
    // Validar formulario
    const form = document.getElementById("formServicio");
    if (!form.checkValidity()) {
        form.reportValidity();
        return;
    }

    // Obtener valores
    const servicio = {
        nombre_curso: document.getElementById("nombreCurso").value.trim(),
        descripcion: document.getElementById("descripcion").value.trim(),
        precio: parseFloat(document.getElementById("precio").value),
        cantidad: parseInt(document.getElementById("cantidad").value),
        imagen: document.getElementById("imagen").value.trim() || null,
        id_categoria: parseInt(document.getElementById("idCategoria").value),
        id_promocion: document.getElementById("idPromocion").value ? parseInt(document.getElementById("idPromocion").value) : null,
        id_usuario: usuarioActual.id_usuario
    };

    // Deshabilitar botón
    btnGuardar.disabled = true;
    btnGuardar.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Guardando...';

    try {
        let resultado;

        if (modoEdicion && servicioId) {
            // ACTUALIZAR (UPDATE)
            const { data, error } = await supabase
                .from("servicio")
                .update(servicio)
                .eq("id_servicio", servicioId)
                .eq("id_usuario", usuarioActual.id_usuario)
                .select();

            if (error) throw error;
            resultado = data;
            mostrarAlerta("Servicio actualizado correctamente", "success");
        } else {
            // CREAR (CREATE)
            const { data, error } = await supabase
                .from("servicio")
                .insert([servicio])
                .select();

            if (error) throw error;
            resultado = data;
            mostrarAlerta("Servicio creado correctamente", "success");
        }

        // Cerrar modal y recargar tabla
        bootstrap.Modal.getInstance(document.getElementById("modalServicio")).hide();
        await cargarServicios();

    } catch (error) {
        console.error("Error al guardar:", error);
        mostrarAlerta("Error al guardar el servicio", "danger");
    } finally {
        btnGuardar.disabled = false;
        btnGuardar.innerHTML = '<i class="fas fa-save me-2"></i>Guardar';
    }
}

// ==============================
// EDITAR SERVICIO
// ==============================
async function editarServicio(id) {
    try {
        const { data, error } = await supabase
            .from("servicio")
            .select("*")
            .eq("id_servicio", id)
            .eq("id_usuario", usuarioActual.id_usuario)
            .single();

        if (error) throw error;

        // Llenar formulario
        modoEdicion = true;
        document.getElementById("servicioId").value = data.id_servicio;
        document.getElementById("nombreCurso").value = data.nombre_curso;
        document.getElementById("descripcion").value = data.descripcion;
        document.getElementById("precio").value = data.precio;
        document.getElementById("cantidad").value = data.cantidad;
        document.getElementById("imagen").value = data.imagen || "";
        document.getElementById("idCategoria").value = data.id_categoria;
        document.getElementById("idPromocion").value = data.id_promocion || "";

        // Cambiar título del modal
        document.getElementById("modalTitle").innerHTML = '<i class="fas fa-edit me-2"></i>Editar Servicio';

        // Abrir modal
        new bootstrap.Modal(document.getElementById("modalServicio")).show();

    } catch (error) {
        console.error("Error al cargar servicio:", error);
        mostrarAlerta("Error al cargar el servicio", "danger");
    }
}

// ==============================
// CONFIRMAR ELIMINAR
// ==============================
function confirmarEliminar(id, nombre) {
    if (confirm(`¿Estás seguro de eliminar el servicio "${nombre}"?\n\nEsta acción no se puede deshacer.`)) {
        eliminarServicio(id);
    }
}

// ==============================
// ELIMINAR SERVICIO (DELETE)
// ==============================
async function eliminarServicio(id) {
    try {
        const { error } = await supabase
            .from("servicio")
            .delete()
            .eq("id_servicio", id)
            .eq("id_usuario", usuarioActual.id_usuario);

        if (error) throw error;

        mostrarAlerta("Servicio eliminado correctamente", "success");
        await cargarServicios();

    } catch (error) {
        console.error("Error al eliminar:", error);
        mostrarAlerta("Error al eliminar el servicio", "danger");
    }
}

// ==============================
// LIMPIAR FORMULARIO
// ==============================
function limpiarFormulario() {
    document.getElementById("formServicio").reset();
    document.getElementById("servicioId").value = "";
    modoEdicion = false;
}

// ==============================
// MOSTRAR ALERTAS
// ==============================
function mostrarAlerta(mensaje, tipo) {
    const alertContainer = document.createElement("div");
    alertContainer.className = `alert alert-${tipo} alert-dismissible fade show position-fixed top-0 start-50 translate-middle-x mt-3`;
    alertContainer.style.zIndex = "9999";
    alertContainer.style.minWidth = "300px";
    alertContainer.innerHTML = `
        ${mensaje}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
    
    document.body.appendChild(alertContainer);
    
    setTimeout(() => {
        alertContainer.remove();
    }, 3000);
}