// Referencias al DOM
const tituloInput = document.getElementById("titulo"); // Campo para el título de la nota
const contenidoInput = document.getElementById("contenido"); // Campo para el contenido de la nota
const categoriaSelect = document.getElementById("categoria"); // Selector de categoría
const btnAgregar = document.getElementById("btnAgregar"); // Botón para agregar nota
const contenedorNotas = document.getElementById("contenedorNotas"); // Contenedor donde se renderizan las notas
const btnEliminarTodas = document.getElementById("btnEliminarTodas"); // Botón para eliminar todas las notas
const btnAnterior = document.getElementById("btnAnterior"); // Botón para ir a la página anterior
const btnSiguiente = document.getElementById("btnSiguiente"); // Botón para ir a la página siguiente
const indicadorPagina = document.getElementById("indicadorPagina"); // Indicador de página actual
const guardarCambiosBtn = document.getElementById("guardarCambios"); // Botón para guardar cambios al editar
const editarTitulo = document.getElementById("editarTitulo"); // Campo de título en el modal de edición
const editarContenido = document.getElementById("editarContenido"); // Campo de contenido en el modal de edición

let notas = []; // Array que contiene las notas creadas
const notasPorPagina = 3; // Cantidad de notas a mostrar por página
let paginaActual = 1; // Página actual de la paginación
let indiceEditar = null; // Índice de la nota que se va a editar

// Guardar en localStorage
function guardarEnLocalStorage() {
  localStorage.setItem("notasGuardadas", JSON.stringify(notas)); // Guarda las notas en el almacenamiento local
}

// Cargar desde localStorage
function cargarNotas() {
  const notasGuardadas = localStorage.getItem("notasGuardadas"); // Obtiene las notas guardadas (si hay)
  if (notasGuardadas) {
    notas = JSON.parse(notasGuardadas); // Convierte de texto a array de objetos
    renderizarNotas(); // Muestra las notas en pantalla
  }
}

// Crear tarjeta de nota
function crearTarjetaNota(nota, index) {
  const divNota = document.createElement("div"); // Crea un nuevo div para la nota

  // Clases de color para el borde según categoría
  const coloresCategoria = {
    "Personal": "border-danger-subtle", // Rojo suave
    "Trabajo": "border-sucess-subtle", // (OJO: typo en 'success', puede no funcionar)
    "Estudio": "border-warning", // Amarillo
  };

  // Clases de fondo (estas clases deberían estar en tu CSS si no usas clases de Bootstrap)
  const fondoCategoria = {
    "Personal": "bg-personal",
    "Trabajo": "bg-trabajo",
    "Estudio": "bg-estudio",
  };

  const claseFondo = fondoCategoria[nota.categoria] || ""; // Aplica clase de fondo según categoría
  const claseColor = coloresCategoria[nota.categoria] || "border-dark"; // Aplica color de borde

  // Aplica clases a la tarjeta
  divNota.className = `card p-3 text-break mb-3 ${claseColor} ${claseFondo}`;
  divNota.style.width = "18rem"; // Ancho de la tarjeta
  divNota.style.borderWidth = "2px"; // Grosor del borde

  // Contenido interno de la tarjeta de nota
  divNota.innerHTML = `
    <div class="card-header text-center">${nota.categoria}</div>
    <div class="card-body text-center">
      ${nota.fecha ? `<p class="text-muted"><small>Registrada el: ${nota.fecha}</small></p>` : ""}
      <h5 class="card-title">${nota.titulo}</h5>
      <p class="card-text">${nota.contenido}</p>
      <button class="btn btn-primary btn-sm me-2">Editar</button>
      <button class="btn btn-danger btn-sm"><i class="bi bi-trash"></i></button>
    </div>
  `;

  contenedorNotas.appendChild(divNota); // Agrega la tarjeta al contenedor

  // Botón de eliminar nota
  const btnEliminar = divNota.querySelector(".btn-danger");
  btnEliminar.addEventListener("click", () => {
    if (confirm("¿Seguro que deseas eliminar esta nota?")) {
      notas.splice(index, 1); // Elimina del array
      guardarEnLocalStorage(); // Guarda el nuevo array
      renderizarNotas(); // Vuelve a renderizar
    }
  });

  // Botón de editar nota
  const btnEditar = divNota.querySelector(".btn-primary");
  btnEditar.addEventListener("click", () => {
    editarTitulo.value = nota.titulo; // Pone el título actual en el modal
    editarContenido.value = nota.contenido; // Pone el contenido actual en el modal
    indiceEditar = index; // Guarda el índice de la nota a editar

    const modal = new bootstrap.Modal(document.getElementById("modalEditar")); // Abre modal
    modal.show();
  });
}

// Guardar cambios de edición
guardarCambiosBtn.addEventListener("click", () => {
  const nuevoTitulo = editarTitulo.value.trim(); // Nuevo título del input
  const nuevoContenido = editarContenido.value.trim(); // Nuevo contenido del input

  if (!nuevoTitulo || !nuevoContenido) {
    alert("Completa ambos campos para guardar los cambios");
    return;
  }

  if (confirm("¿Deseas guardar los cambios a esta nota?")) {
    notas[indiceEditar].titulo = nuevoTitulo; // Actualiza título
    notas[indiceEditar].contenido = nuevoContenido; // Actualiza contenido
    guardarEnLocalStorage(); // Guarda en localStorage
    renderizarNotas(); // Vuelve a renderizar

    const modal = bootstrap.Modal.getInstance(document.getElementById("modalEditar")); // Cierra modal
    modal.hide();
    indiceEditar = null; // Limpia el índice
  }
});

// Renderizar notas según la página actual
function renderizarNotas() {
  contenedorNotas.innerHTML = ""; // Limpia contenedor

  const inicio = (paginaActual - 1) * notasPorPagina; // Índice inicial
  const fin = inicio + notasPorPagina; // Índice final
  const notasPagina = notas.slice(inicio, fin); // Extrae las notas de la página actual

  notasPagina.forEach((nota, i) => crearTarjetaNota(nota, inicio + i)); // Crea tarjetas para cada nota
  actualizarPaginacion(); // Actualiza botones de paginación
}

// Actualizar botones de paginación
function actualizarPaginacion() {
  const totalPaginas = Math.ceil(notas.length / notasPorPagina); // Total de páginas
  btnAnterior.disabled = paginaActual === 1; // Desactiva si estamos en la primera página
  btnSiguiente.disabled = paginaActual === totalPaginas || totalPaginas === 0; // Desactiva si estamos en la última o no hay notas
  indicadorPagina.textContent = `Página ${paginaActual}`; // Muestra página actual
}

// Evento: agregar nota nueva
btnAgregar.addEventListener("click", () => {
  const titulo = tituloInput.value.trim(); // Obtiene título del input
  const contenido = contenidoInput.value.trim(); // Obtiene contenido
  const categoria = categoriaSelect.value; // Obtiene categoría

  if (!titulo || !contenido || !categoria) {
    alert("Por favor completa todos los campos.");
    return;
  }

  const fecha = new Date().toLocaleString(); // Fecha actual formateada
  const nuevaNota = { titulo, contenido, categoria, fecha }; // Objeto de nota nueva

  notas.push(nuevaNota); // Añade la nota al array
  guardarEnLocalStorage(); // Guarda en localStorage
  paginaActual = Math.ceil(notas.length / notasPorPagina); // Ajusta a la última página
  renderizarNotas(); // Vuelve a mostrar las notas

  // Limpia los campos del formulario
  tituloInput.value = "";
  contenidoInput.value = "";
  categoriaSelect.value = "";
});

// Evento: eliminar todas las notas
btnEliminarTodas.addEventListener("click", () => {
  if (notas.length === 0) {
    alert("No hay notas para eliminar.");
    return;
  }

  if (confirm("¿Estás segura de que quieres eliminar TODAS las notas?")) {
    notas = []; // Limpia el array
    guardarEnLocalStorage(); // Guarda en localStorage
    renderizarNotas(); // Limpia la vista
    alert("Todas las notas han sido eliminadas.");
  }
});

// Evento: ir a la página anterior
btnAnterior.addEventListener("click", () => {
  if (paginaActual > 1) {
    paginaActual--; // Resta una página
    renderizarNotas(); // Muestra notas de la nueva página
  }
});

// Evento: ir a la página siguiente
btnSiguiente.addEventListener("click", () => {
  const totalPaginas = Math.ceil(notas.length / notasPorPagina); // Total de páginas
  if (paginaActual < totalPaginas) {
    paginaActual++; // Suma una página
    renderizarNotas(); // Muestra notas de la nueva página
  }
});

// Inicialización: cargar notas desde localStorage al cargar la página
cargarNotas();
