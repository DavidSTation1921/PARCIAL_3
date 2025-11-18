// Precios de las categorías de boletos
const PRECIOS = {
    vip: 50.00,
    butacas: 30.00,
    generales: 15.00
};

// Almacenamiento de ventas
let ventas = [];
let resumen = {
    vip: { cantidad: 0, total: 0 },
    butacas: { cantidad: 0, total: 0 },
    generales: { cantidad: 0, total: 0 },
    totalGeneral: { cantidad: 0, total: 0 }
};

// Elementos del DOM
const ventaForm = document.getElementById('ventaForm');
const nombreInput = document.getElementById('nombre');
const categoriaSelect = document.getElementById('categoria');
const cantidadInput = document.getElementById('cantidad');
const limpiarBtn = document.getElementById('limpiar');
const ventasTable = document.getElementById('ventasTable').querySelector('tbody');

// Inicialización de la aplicación
document.addEventListener('DOMContentLoaded', function() {
    inicializarAplicacion();
});

/**
 * Inicializa la aplicación cargando datos previos y configurando event listeners
 */
function inicializarAplicacion() {
    // Cargar datos del localStorage si existen
    cargarDatos();
    
    // Configurar event listeners
    ventaForm.addEventListener('submit', procesarVenta);
    limpiarBtn.addEventListener('click', limpiarFormulario);
    
    // Configurar validaciones en tiempo real
    configurarValidacionesTiempoReal();
    
    // Actualizar la interfaz con los datos cargados
    actualizarInterfaz();
    
    console.log('Aplicación de venta de boletos inicializada correctamente');
}

/**
 * Configura las validaciones en tiempo real para los campos
 */
function configurarValidacionesTiempoReal() {
    // Validación del nombre en tiempo real
    nombreInput.addEventListener('input', function(e) {
        validarNombreTiempoReal(e.target);
    });
    
    // Validación de la cantidad en tiempo real
    cantidadInput.addEventListener('input', function(e) {
        validarCantidadTiempoReal(e.target);
    });
    
    // Prevenir entrada de caracteres no válidos en el nombre
    nombreInput.addEventListener('keypress', function(e) {
        if (!validarCaracterNombre(e.key)) {
            e.preventDefault();
            mostrarErrorTemporal(nombreInput, 'Solo se permiten letras y espacios');
        }
    });
    
    // Prevenir entrada de caracteres no válidos en la cantidad
    cantidadInput.addEventListener('keypress', function(e) {
        if (!validarCaracterCantidad(e.key)) {
            e.preventDefault();
            mostrarErrorTemporal(cantidadInput, 'Solo se permiten números');
        }
    });
}

/**
 * Valida el nombre en tiempo real mientras el usuario escribe
 * @param {HTMLInputElement} input - Campo de nombre
 */
function validarNombreTiempoReal(input) {
    const valor = input.value;
    const nombreRegex = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]*$/;
    
    if (!nombreRegex.test(valor)) {
        // Remover caracteres no válidos
        input.value = valor.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ\s]/g, '');
        mostrarErrorTemporal(input, 'Solo se permiten letras y espacios');
    }
    
    // Actualizar estado visual
    actualizarEstadoCampo(input, nombreRegex.test(valor) && valor.length > 0);
}

/**
 * Valida la cantidad en tiempo real mientras el usuario escribe
 * @param {HTMLInputElement} input - Campo de cantidad
 */
function validarCantidadTiempoReal(input) {
    const valor = input.value;
    
    // Remover caracteres no válidos (e, E, ., +, -)
    const valorLimpio = valor.replace(/[eE.\-+]/g, '');
    
    if (valor !== valorLimpio) {
        input.value = valorLimpio;
        mostrarErrorTemporal(input, 'No se permiten letras ni puntos decimales');
    }
    
    // Validar que sea un número entero positivo
    const esValido = /^\d*$/.test(valorLimpio) && (valorLimpio === '' || parseInt(valorLimpio) > 0);
    actualizarEstadoCampo(input, esValido);
}

/**
 * Valida un caracter individual para el campo nombre
 * @param {string} caracter - Caracter a validar
 * @returns {boolean} True si el caracter es válido
 */
function validarCaracterNombre(caracter) {
    const nombreRegex = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]$/;
    return nombreRegex.test(caracter);
}

/**
 * Valida un caracter individual para el campo cantidad
 * @param {string} caracter - Caracter a validar
 * @returns {boolean} True si el caracter es válido
 */
function validarCaracterCantidad(caracter) {
    // Permitir solo números y teclas de control
    const cantidadRegex = /^[\d]$/;
    const teclasControl = ['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'Tab', 'Enter'];
    
    return cantidadRegex.test(caracter) || teclasControl.includes(caracter);
}

/**
 * Muestra un error temporal en un campo específico
 * @param {HTMLInputElement} input - Campo donde mostrar el error
 * @param {string} mensaje - Mensaje de error
 */
function mostrarErrorTemporal(input, mensaje) {
    // Crear elemento de error
    let errorElement = input.parentNode.querySelector('.error-mensaje');
    
    if (!errorElement) {
        errorElement = document.createElement('div');
        errorElement.className = 'error-mensaje';
        input.parentNode.appendChild(errorElement);
    }
    
    errorElement.textContent = mensaje;
    errorElement.style.display = 'block';
    
    // Remover el mensaje después de 3 segundos
    setTimeout(() => {
        errorElement.style.display = 'none';
    }, 3000);
}

/**
 * Actualiza el estado visual de un campo (válido/inválido)
 * @param {HTMLInputElement} input - Campo a actualizar
 * @param {boolean} esValido - Si el campo es válido
 */
function actualizarEstadoCampo(input, esValido) {
    if (esValido) {
        input.classList.remove('campo-invalido');
        input.classList.add('campo-valido');
    } else {
        input.classList.remove('campo-valido');
        input.classList.add('campo-invalido');
    }
}

/**
 * Procesa el formulario de venta cuando se envía
 * @param {Event} event - Evento del formulario
 */
function procesarVenta(event) {
    event.preventDefault();
    
    // Validar el formulario
    if (!validarFormulario()) {
        return;
    }
    
    // Obtener datos del formulario
    const venta = {
        id: Date.now(), // ID único basado en timestamp
        nombre: nombreInput.value.trim(),
        categoria: categoriaSelect.value,
        cantidad: parseInt(cantidadInput.value),
        fecha: new Date().toLocaleString()
    };
    
    // Calcular total de la venta
    venta.total = calcularTotal(venta.categoria, venta.cantidad);
    
    // Agregar venta al registro
    agregarVenta(venta);
    
    // Actualizar resumen
    actualizarResumen(venta);
    
    // Actualizar interfaz
    actualizarInterfaz();
    
    // Mostrar notificación
    mostrarNotificacion(`Venta registrada exitosamente para ${venta.nombre}`);
    
    // Limpiar formulario
    limpiarFormulario();
}

/**
 * Valida el formulario antes de procesar la venta
 * @returns {boolean} True si el formulario es válido
 */
function validarFormulario() {
    let esValido = true;
    
    // Validar nombre
    if (!validarNombreCompleto(nombreInput.value)) {
        mostrarErrorCampo(nombreInput, 'El nombre solo puede contener letras y espacios (mínimo 2 caracteres)');
        esValido = false;
    } else {
        limpiarErrorCampo(nombreInput);
    }
    
    // Validar categoría
    if (categoriaSelect.value === '') {
        mostrarErrorCampo(categoriaSelect, 'Por favor seleccione una categoría de boletos');
        esValido = false;
    } else {
        limpiarErrorCampo(categoriaSelect);
    }
    
    // Validar cantidad
    if (!validarCantidadCompleta(cantidadInput.value)) {
        mostrarErrorCampo(cantidadInput, 'La cantidad debe ser un número entero mayor a 0');
        esValido = false;
    } else {
        limpiarErrorCampo(cantidadInput);
    }
    
    if (!esValido) {
        mostrarNotificacion('Por favor corrija los errores en el formulario', 'error');
    }
    
    return esValido;
}

/**
 * Valida el nombre completo del cliente
 * @param {string} nombre - Nombre a validar
 * @returns {boolean} True si el nombre es válido
 */
function validarNombreCompleto(nombre) {
    const nombreRegex = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]{2,}$/;
    return nombreRegex.test(nombre.trim());
}

/**
 * Valida la cantidad completa
 * @param {string} cantidad - Cantidad a validar
 * @returns {boolean} True si la cantidad es válida
 */
function validarCantidadCompleta(cantidad) {
    const cantidadRegex = /^\d+$/;
    return cantidadRegex.test(cantidad) && parseInt(cantidad) > 0;
}

/**
 * Muestra un error en un campo específico
 * @param {HTMLElement} elemento - Elemento donde mostrar el error
 * @param {string} mensaje - Mensaje de error
 */
function mostrarErrorCampo(elemento, mensaje) {
    // Limpiar errores previos
    limpiarErrorCampo(elemento);
    
    // Agregar clase de error
    elemento.classList.add('campo-invalido');
    
    // Crear elemento de error
    const errorElement = document.createElement('div');
    errorElement.className = 'error-mensaje';
    errorElement.textContent = mensaje;
    
    elemento.parentNode.appendChild(errorElement);
}

/**
 * Limpia el error de un campo
 * @param {HTMLElement} elemento - Elemento a limpiar
 */
function limpiarErrorCampo(elemento) {
    elemento.classList.remove('campo-invalido');
    elemento.classList.remove('campo-valido');
    
    const errorElement = elemento.parentNode.querySelector('.error-mensaje');
    if (errorElement) {
        errorElement.remove();
    }
}

/**
 * Calcula el total de una venta
 * @param {string} categoria - Categoría del boleto
 * @param {number} cantidad - Cantidad de boletos
 * @returns {number} Total de la venta
 */
function calcularTotal(categoria, cantidad) {
    return PRECIOS[categoria] * cantidad;
}

/**
 * Agrega una venta al registro
 * @param {Object} venta - Objeto de venta
 */
function agregarVenta(venta) {
    ventas.push(venta);
    guardarDatos();
}

/**
 * Elimina una venta del registro
 * @param {number} id - ID de la venta a eliminar
 */
function eliminarVenta(id) {
    // Encontrar la venta a eliminar
    const ventaIndex = ventas.findIndex(venta => venta.id === id);
    
    if (ventaIndex === -1) {
        mostrarError('No se encontró la venta a eliminar');
        return;
    }
    
    const venta = ventas[ventaIndex];
    
    // Restar del resumen
    resumen[venta.categoria].cantidad -= venta.cantidad;
    resumen[venta.categoria].total -= venta.total;
    resumen.totalGeneral.cantidad -= venta.cantidad;
    resumen.totalGeneral.total -= venta.total;
    
    // Eliminar del array
    ventas.splice(ventaIndex, 1);
    
    // Guardar cambios
    guardarDatos();
    
    // Actualizar interfaz
    actualizarInterfaz();
    
    // Mostrar notificación
    mostrarNotificacion(`Venta eliminada exitosamente`);
}

/**
 * Actualiza el resumen general con una nueva venta
 * @param {Object} venta - Objeto de venta
 */
function actualizarResumen(venta) {
    // Actualizar categoría específica
    resumen[venta.categoria].cantidad += venta.cantidad;
    resumen[venta.categoria].total += venta.total;
    
    // Actualizar total general
    resumen.totalGeneral.cantidad += venta.cantidad;
    resumen.totalGeneral.total += venta.total;
    
    guardarDatos();
}

/**
 * Actualiza toda la interfaz de usuario
 */
function actualizarInterfaz() {
    actualizarResumenVisual();
    actualizarTablaVentas();
    actualizarTotalGeneral();
}

/**
 * Actualiza las tarjetas de resumen por categoría
 */
function actualizarResumenVisual() {
    // VIP
    document.querySelector('.vip-card .cantidad').textContent = 
        `${resumen.vip.cantidad} boletos`;
    document.querySelector('.vip-card .total').textContent = 
        `$${resumen.vip.total.toFixed(2)}`;
    
    // Butacas
    document.querySelector('.butacas-card .cantidad').textContent = 
        `${resumen.butacas.cantidad} boletos`;
    document.querySelector('.butacas-card .total').textContent = 
        `$${resumen.butacas.total.toFixed(2)}`;
    
    // Generales
    document.querySelector('.generales-card .cantidad').textContent = 
        `${resumen.generales.cantidad} boletos`;
    document.querySelector('.generales-card .total').textContent = 
        `$${resumen.generales.total.toFixed(2)}`;
}

/**
 * Actualiza la tabla de historial de ventas
 */
function actualizarTablaVentas() {
    // Limpiar tabla
    ventasTable.innerHTML = '';
    
    // Si no hay ventas, mostrar mensaje
    if (ventas.length === 0) {
        const fila = document.createElement('tr');
        fila.innerHTML = `
            <td colspan="5" style="text-align: center; color: var(--text-light); padding: 20px;">
                No hay ventas registradas
            </td>
        `;
        ventasTable.appendChild(fila);
        return;
    }
    
    // Agregar filas para cada venta
    ventas.forEach(venta => {
        const fila = document.createElement('tr');
        
        fila.innerHTML = `
            <td>${venta.nombre}</td>
            <td>${obtenerNombreCategoria(venta.categoria)}</td>
            <td>${venta.cantidad}</td>
            <td>$${venta.total.toFixed(2)}</td>
            <td class="acciones-cell">
                <button class="btn-eliminar" onclick="eliminarVenta(${venta.id})" title="Eliminar venta">
                    🗑️ Eliminar
                </button>
            </td>
        `;
        
        // Agregar animación de entrada
        fila.style.animation = 'fadeInUp 0.5s ease';
        ventasTable.appendChild(fila);
    });
}

/**
 * Actualiza la sección de total general
 */
function actualizarTotalGeneral() {
    document.getElementById('totalBoletos').textContent = resumen.totalGeneral.cantidad;
    document.getElementById('ingresoTotal').textContent = resumen.totalGeneral.total.toFixed(2);
}

/**
 * Obtiene el nombre completo de la categoría
 * @param {string} categoria - Clave de la categoría
 * @returns {string} Nombre completo de la categoría
 */
function obtenerNombreCategoria(categoria) {
    const nombres = {
        vip: 'Puestos VIP',
        butacas: 'Puestos Butacas',
        generales: 'Puestos Generales'
    };
    return nombres[categoria] || categoria;
}

/**
 * Limpia el formulario de venta
 */
function limpiarFormulario() {
    ventaForm.reset();
    
    // Limpiar estados visuales de los campos
    limpiarErrorCampo(nombreInput);
    limpiarErrorCampo(categoriaSelect);
    limpiarErrorCampo(cantidadInput);
    
    nombreInput.focus();
}

/**
 * Limpia todos los datos (nueva función)
 */
function limpiarTodosLosDatos() {
    if (confirm('¿Está seguro de que desea eliminar todos los datos? Esta acción no se puede deshacer.')) {
        ventas = [];
        resumen = {
            vip: { cantidad: 0, total: 0 },
            butacas: { cantidad: 0, total: 0 },
            generales: { cantidad: 0, total: 0 },
            totalGeneral: { cantidad: 0, total: 0 }
        };
        
        // Limpiar localStorage
        localStorage.removeItem('eventosPanamaData');
        
        // Actualizar interfaz
        actualizarInterfaz();
        
        mostrarNotificacion('Todos los datos han sido eliminados');
    }
}

/**
 * Muestra una notificación temporal
 * @param {string} mensaje - Mensaje a mostrar
 * @param {string} tipo - Tipo de notificación (success, error, warning)
 */
function mostrarNotificacion(mensaje, tipo = 'success') {
    // Crear elemento de notificación
    const notificacion = document.createElement('div');
    notificacion.className = 'notification';
    notificacion.textContent = mensaje;
    
    // Estilo según el tipo
    if (tipo === 'error') {
        notificacion.style.background = 'linear-gradient(135deg, #ef476f, #e63946)';
    } else if (tipo === 'warning') {
        notificacion.style.background = 'linear-gradient(135deg, #ffd166, #f4a261)';
    } else {
        notificacion.style.background = 'linear-gradient(135deg, var(--success), #2a9d8f)';
    }
    
    // Agregar al documento
    document.body.appendChild(notificacion);
    
    // Remover después de 3 segundos
    setTimeout(() => {
        notificacion.style.animation = 'fadeOut 0.5s ease';
        setTimeout(() => {
            if (document.body.contains(notificacion)) {
                document.body.removeChild(notificacion);
            }
        }, 500);
    }, 3000);
}

/**
 * Muestra un mensaje de error
 * @param {string} mensaje - Mensaje de error
 */
function mostrarError(mensaje) {
    mostrarNotificacion(`Error: ${mensaje}`, 'error');
}

/**
 * Guarda los datos en localStorage
 */
function guardarDatos() {
    const datos = {
        ventas: ventas,
        resumen: resumen,
        timestamp: new Date().toISOString()
    };
    localStorage.setItem('eventosPanamaData', JSON.stringify(datos));
}

/**
 * Carga los datos desde localStorage
 */
function cargarDatos() {
    const datosGuardados = localStorage.getItem('eventosPanamaData');
    if (datosGuardados) {
        try {
            const datos = JSON.parse(datosGuardados);
            ventas = datos.ventas || [];
            resumen = datos.resumen || {
                vip: { cantidad: 0, total: 0 },
                butacas: { cantidad: 0, total: 0 },
                generales: { cantidad: 0, total: 0 },
                totalGeneral: { cantidad: 0, total: 0 }
            };
        } catch (error) {
            console.error('Error al cargar datos:', error);
            // Si hay error, limpiar los datos corruptos
            localStorage.removeItem('eventosPanamaData');
            ventas = [];
            resumen = {
                vip: { cantidad: 0, total: 0 },
                butacas: { cantidad: 0, total: 0 },
                generales: { cantidad: 0, total: 0 },
                totalGeneral: { cantidad: 0, total: 0 }
            };
        }
    }
}

// Agregar animación de fadeOut para las notificaciones
const style = document.createElement('style');
style.textContent = `
    @keyframes fadeOut {
        from { opacity: 1; transform: translateX(0); }
        to { opacity: 0; transform: translateX(100px); }
    }
`;
document.head.appendChild(style);

// Agregar botón para limpiar todos los datos al HTML dinámicamente
document.addEventListener('DOMContentLoaded', function() {
    const buttonGroup = document.querySelector('.button-group');
    const clearAllButton = document.createElement('button');
    clearAllButton.type = 'button';
    clearAllButton.className = 'btn-danger';
    clearAllButton.textContent = 'Limpiar Todo';
    clearAllButton.onclick = limpiarTodosLosDatos;
    buttonGroup.appendChild(clearAllButton);
});