/* ==========================================================
   TallerGest - Modulo de Clientes (registro y listado)

   USAR_API = false -> los datos se guardan en el navegador (localStorage).
                       Sirve para probar la pantalla sin backend.
   USAR_API = true  -> usa la API REST del backend en /api/clientes.
   ========================================================== */

const USAR_API = false;
const API_URL = "http://localhost:3000/api/clientes";
const CLAVE_LOCAL = "tallergest_clientes";

/* ---------- Acceso a datos ---------- */

const almacenLocal = {
  leer() {
    try {
      return JSON.parse(localStorage.getItem(CLAVE_LOCAL)) || [];
    } catch (e) {
      return [];
    }
  },
  escribir(clientes) {
    localStorage.setItem(CLAVE_LOCAL, JSON.stringify(clientes));
  },
  async listar() {
    return this.leer();
  },
  async guardar(datos) {
    const clientes = this.leer();
    const nuevoId = clientes.length ? Math.max(...clientes.map((c) => c.id)) + 1 : 1;
    const cliente = { id: nuevoId, ...datos };
    clientes.push(cliente);
    this.escribir(clientes);
    return cliente;
  },
  async actualizar(id, datos) {
    const clientes = this.leer().map((c) => (c.id === id ? { ...c, ...datos } : c));
    this.escribir(clientes);
  },
  async eliminar(id) {
    this.escribir(this.leer().filter((c) => c.id !== id));
  },
};

const almacenApi = {
  async pedir(url, opciones = {}) {
    const respuesta = await fetch(url, {
      headers: { "Content-Type": "application/json" },
      ...opciones,
    });
    const datos = await respuesta.json();
    if (!respuesta.ok) throw new Error(datos.error || "Error en el servidor");
    return datos;
  },
  listar() {
    return this.pedir(API_URL);
  },
  guardar(datos) {
    return this.pedir(API_URL, { method: "POST", body: JSON.stringify(datos) });
  },
  actualizar(id, datos) {
    return this.pedir(`${API_URL}/${id}`, { method: "PUT", body: JSON.stringify(datos) });
  },
  eliminar(id) {
    return this.pedir(`${API_URL}/${id}`, { method: "DELETE" });
  },
};

const almacen = USAR_API ? almacenApi : almacenLocal;

/* ---------- Elementos de la pantalla ---------- */

const form = document.getElementById("formCliente");
const campoId = document.getElementById("clienteId");
const campoNombre = document.getElementById("nombre");
const campoTelefono = document.getElementById("telefono");
const campoCorreo = document.getElementById("correo");
const campoDireccion = document.getElementById("direccion");
const tituloFormulario = document.getElementById("tituloFormulario");
const btnGuardar = document.getElementById("btnGuardar");
const btnCancelar = document.getElementById("btnCancelar");
const mensaje = document.getElementById("mensaje");
const tabla = document.getElementById("tablaClientes");
const sinClientes = document.getElementById("sinClientes");

let clientesActuales = [];

/* ---------- Funciones de apoyo ---------- */

function mostrarMensaje(texto, tipo) {
  mensaje.textContent = texto;
  mensaje.className = "mensaje " + tipo;
}

function leerFormulario() {
  return {
    nombre: campoNombre.value.trim(),
    telefono: campoTelefono.value.trim() || null,
    correo: campoCorreo.value.trim() || null,
    direccion: campoDireccion.value.trim() || null,
  };
}

function validar(datos) {
  if (!datos.nombre) return "El nombre del cliente es obligatorio";
  if (datos.correo && !datos.correo.includes("@")) return "El correo no es valido";
  return null;
}

function limpiarFormulario() {
  form.reset();
  campoId.value = "";
  tituloFormulario.textContent = "Nuevo cliente";
  btnGuardar.textContent = "Registrar cliente";
  btnCancelar.hidden = true;
}

function crearCelda(texto) {
  const celda = document.createElement("td");
  celda.textContent = texto || "-";
  return celda;
}

function crearBoton(texto, clase, accion) {
  const boton = document.createElement("button");
  boton.type = "button";
  boton.textContent = texto;
  boton.className = clase;
  boton.addEventListener("click", accion);
  return boton;
}

/* ---------- Listado ---------- */

async function cargarClientes() {
  try {
    clientesActuales = await almacen.listar();
  } catch (error) {
    clientesActuales = [];
    mostrarMensaje("No se pudo cargar el listado: " + error.message, "error");
  }

  tabla.innerHTML = "";
  sinClientes.hidden = clientesActuales.length > 0;

  for (const cliente of clientesActuales) {
    const fila = document.createElement("tr");
    fila.appendChild(crearCelda(String(cliente.id)));
    fila.appendChild(crearCelda(cliente.nombre));
    fila.appendChild(crearCelda(cliente.telefono));
    fila.appendChild(crearCelda(cliente.correo));
    fila.appendChild(crearCelda(cliente.direccion));

    const acciones = document.createElement("td");
    acciones.className = "acciones";
    acciones.appendChild(crearBoton("Editar", "btn-secundario", () => editarCliente(cliente)));
    acciones.appendChild(crearBoton("Eliminar", "btn-eliminar", () => eliminarCliente(cliente)));
    fila.appendChild(acciones);

    tabla.appendChild(fila);
  }
}

/* ---------- Registrar / editar / eliminar ---------- */

function editarCliente(cliente) {
  campoId.value = cliente.id;
  campoNombre.value = cliente.nombre || "";
  campoTelefono.value = cliente.telefono || "";
  campoCorreo.value = cliente.correo || "";
  campoDireccion.value = cliente.direccion || "";
  tituloFormulario.textContent = "Editar cliente #" + cliente.id;
  btnGuardar.textContent = "Guardar cambios";
  btnCancelar.hidden = false;
  mostrarMensaje("", "");
  campoNombre.focus();
}

async function eliminarCliente(cliente) {
  if (!confirm("Eliminar al cliente " + cliente.nombre + "?")) return;

  try {
    await almacen.eliminar(cliente.id);
    if (Number(campoId.value) === cliente.id) limpiarFormulario();
    mostrarMensaje("Cliente eliminado", "ok");
    await cargarClientes();
  } catch (error) {
    mostrarMensaje(error.message, "error");
  }
}

form.addEventListener("submit", async (evento) => {
  evento.preventDefault();

  const datos = leerFormulario();
  const error = validar(datos);
  if (error) {
    mostrarMensaje(error, "error");
    return;
  }

  try {
    if (campoId.value) {
      await almacen.actualizar(Number(campoId.value), datos);
      mostrarMensaje("Datos del cliente actualizados", "ok");
    } else {
      await almacen.guardar(datos);
      mostrarMensaje("Cliente registrado", "ok");
    }
    limpiarFormulario();
    await cargarClientes();
  } catch (err) {
    mostrarMensaje(err.message, "error");
  }
});

btnCancelar.addEventListener("click", () => {
  limpiarFormulario();
  mostrarMensaje("", "");
});

cargarClientes();
