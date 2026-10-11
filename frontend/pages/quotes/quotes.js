/* ==========================================================
   TallerGest · Módulo de Cotizaciones
   Clases: Cotizacion, DetalleCotizacion, AprobacionCliente
   Servicio: CotizacionService (único punto de acceso a datos)
 
   USAR_API = false  -> funciona solo en el navegador (localStorage), sirve
                        para probar y mostrar el módulo sin backend.
   USAR_API = true   -> usa la API REST del backend (contrato en LEEME.md).
   Las pantallas no cambian en ningún caso: solo usan CotizacionService.
   ========================================================== */
 
const ITBIS = 0.18;
// Cambiar a true cuando el backend esté listo
const USAR_API = false;
const API_URL = 'http://localhost:3000/api/cotizaciones';
const CLAVE = 'tallergest_cotizaciones';
 
const formatoRD = (n) =>
  'RD$ ' + n.toLocaleString('es-DO', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
 
// Evita que texto escrito por el usuario se interprete como HTML
const escapar = (t) =>
  String(t ?? '').replace(/[&<>"']/g, (c) =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
 
class DetalleCotizacion {
  constructor(descripcion = '', cantidad = 1, costoUnitario = 0) {
    this.descripcion = descripcion;
    this.cantidad = cantidad;
    this.costoUnitario = costoUnitario;
  }
  getSubtotal() {
    return this.cantidad * this.costoUnitario;
  }
}
 
class AprobacionCliente {
  constructor(aprobado = false, observaciones = '') {
    this.aprobado = aprobado;
    this.fecha = new Date().toISOString();
    this.observaciones = observaciones;
  }
}
 
class Cotizacion {
  constructor(cliente = '', vehiculo = '', diasVigencia = 15) {
    this.id = null;
    this.cliente = cliente;
    this.vehiculo = vehiculo;
    this.fecha = new Date().toISOString();
    this.vigencia = new Date(Date.now() + diasVigencia * 86400000).toISOString();
    this.detalles = [];
    this.subtotal = 0;
    this.itbis = 0;
    this.total = 0;
    this.estado = 'borrador'; // borrador | enviada | aprobada | rechazada | vencida
    this.aprobacion = null;
  }
 
  agregarDetalle(detalle) {
    this.detalles.push(detalle);
    this.calcularTotal();
  }
 
  calcularTotal() {
    this.subtotal = this.detalles.reduce((suma, d) => suma + d.getSubtotal(), 0);
    this.itbis = this.subtotal * ITBIS;
    this.total = this.subtotal + this.itbis;
    return this.total;
  }
 
  estaVigente() {
    return new Date() <= new Date(this.vigencia);
  }
 
  registrarAprobacion(aprobado, observaciones = '') {
    this.aprobacion = new AprobacionCliente(aprobado, observaciones);
    this.estado = aprobado ? 'aprobada' : 'rechazada';
  }
 
  // Reconstruye una Cotizacion (con sus métodos) a partir de un objeto plano / JSON
  static desdeObjeto(o) {
    const c = Object.assign(new Cotizacion(), o);
    c.detalles = (o.detalles || []).map((d) => Object.assign(new DetalleCotizacion(), d));
    if (o.aprobacion) c.aprobacion = Object.assign(new AprobacionCliente(), o.aprobacion);
    return c;
  }
}
 
// Llamada HTTP común: lanza Error con el mensaje del backend si algo falla
async function pedir(url, opciones = {}) {
  const resp = await fetch(url, {
    headers: { 'Content-Type': 'application/json' },
    ...opciones,
  });
  if (!resp.ok) {
    let mensaje = `Error del servidor (${resp.status}).`;
    try {
      const datos = await resp.json();
      if (datos.mensaje) mensaje = datos.mensaje;
    } catch (_) { /* la respuesta no era JSON */ }
    const error = new Error(mensaje);
    error.status = resp.status;
    throw error;
  }
  return resp.status === 204 ? null : resp.json();
}
 
const ServicioApi = {
  async listar() {
    const datos = await pedir(API_URL);
    return datos.map(Cotizacion.desdeObjeto);
  },
 
  async obtener(id) {
    try {
      return Cotizacion.desdeObjeto(await pedir(`${API_URL}/${Number(id)}`));
    } catch (e) {
      if (e.status === 404) return null;
      throw e;
    }
  },
 
  // Crea (POST) si no tiene id, o actualiza (PUT). Devuelve la cotización guardada.
  async guardar(cotizacion) {
    const nueva = cotizacion.id === null;
    const datos = await pedir(nueva ? API_URL : `${API_URL}/${cotizacion.id}`, {
      method: nueva ? 'POST' : 'PUT',
      body: JSON.stringify(cotizacion),
    });
    return Cotizacion.desdeObjeto(datos);
  },
 
  // El backend valida estado y vigencia, y responde con la cotización actualizada
  async responder(id, aprobado, observaciones = '') {
    const datos = await pedir(`${API_URL}/${Number(id)}/aprobacion`, {
      method: 'POST',
      body: JSON.stringify({ aprobado, observaciones }),
    });
    return Cotizacion.desdeObjeto(datos);
  },
};
 
// Modo sin backend: guarda en el navegador y aplica las mismas reglas que la API
const ServicioLocal = {
  async listar() {
    let datos = [];
    try {
      datos = JSON.parse(localStorage.getItem(CLAVE) || '[]');
    } catch (_) {
      datos = [];
    }
    return datos.map(Cotizacion.desdeObjeto);
  },
 
  async obtener(id) {
    const todas = await this.listar();
    return todas.find((c) => c.id === Number(id)) || null;
  },
 
  async guardar(cotizacion) {
    const todas = await this.listar();
    if (cotizacion.id === null) {
      cotizacion.id = todas.length ? Math.max(...todas.map((c) => c.id)) + 1 : 1;
    }
    const i = todas.findIndex((c) => c.id === cotizacion.id);
    if (i >= 0) todas[i] = cotizacion;
    else todas.push(cotizacion);
    localStorage.setItem(CLAVE, JSON.stringify(todas));
    return cotizacion;
  },
 
  async responder(id, aprobado, observaciones = '') {
    const c = await this.obtener(id);
    if (!c) throw new Error('La cotización no existe.');
    if (c.estado !== 'enviada') throw new Error('Esta cotización no está pendiente de respuesta.');
    if (!c.estaVigente()) {
      c.estado = 'vencida';
      await this.guardar(c);
      throw new Error('La cotización está vencida.');
    }
    c.registrarAprobacion(aprobado, observaciones);
    return this.guardar(c);
  },
};
 
// Único punto de acceso a datos que usan las pantallas
const CotizacionService = USAR_API ? ServicioApi : ServicioLocal;
 