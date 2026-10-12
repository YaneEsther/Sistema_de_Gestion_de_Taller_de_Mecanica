const os = require("os");
const path = require("path");
const RepositorioMySQL = require("../core/RepositorioMySQL");
const { aObjetoCamel } = require("../core/mapeoCampos");
const GeneradorReportePDF = require("./GeneradorReportePDF");
const Factura = require("../models/Factura");

const ESTADOS_VALIDOS = ["pendiente", "pagada", "anulada"];


const ESTADOS_ORDEN_FACTURABLES = ["aprobada"];

// Los precios de servicios y repuestos se asumen SIN ITBIS.
const TASA_ITBIS = 0.18;

const redondear = (n) => Math.round((n + Number.EPSILON) * 100) / 100;

const SQL_ORDEN = `
  SELECT o.id, o.estado, v.cliente_id, c.nombre AS cliente_nombre,
         CONCAT_WS(' ', v.marca, v.modelo, v.placa) AS vehiculo
  FROM ordenes_trabajo o
  JOIN vehiculos v ON v.id = o.vehiculo_id
  JOIN clientes c ON c.id = v.cliente_id
  WHERE o.id = ?`;

class FacturaService {
  constructor(pool) {
    this.pool = pool;
    this.repositorio = new RepositorioMySQL(pool, "facturas");
    this.generadorPDF = new GeneradorReportePDF();
  }

  async _calcularTotales(db, ordenId) {
    const [servicios] = await db.query(
      `SELECT s.nombre, s.costo_mano_obra AS precio, os.cantidad
       FROM orden_servicios os
       JOIN servicios s ON s.id = os.servicio_id
       WHERE os.orden_id = ?`,
      [ordenId]
    );
    const [repuestos] = await db.query(
      `SELECT r.nombre, r.precio_unitario AS precio, orp.cantidad
       FROM orden_repuestos orp
       JOIN repuestos r ON r.id = orp.repuesto_id
       WHERE orp.orden_id = ?`,
      [ordenId]
    );

    const lineas = (filas) =>
      filas.map((f) => ({ nombre: f.nombre, precio: Number(f.precio), cantidad: Number(f.cantidad) }));
    const serviciosL = lineas(servicios);
    const repuestosL = lineas(repuestos);

    const subtotal = redondear(
      [...serviciosL, ...repuestosL].reduce((acc, l) => acc + l.precio * l.cantidad, 0)
    );
    const itbis = redondear(subtotal * TASA_ITBIS);
    const total = redondear(subtotal + itbis);

    return { servicios: serviciosL, repuestos: repuestosL, subtotal, itbis, total };
  }

  // Ordenes listas para facturar y que aun no tienen una factura activa
  async listarOrdenesFacturables() {
    const [filas] = await this.pool.query(
      `SELECT o.id, CONCAT_WS(' ', v.marca, v.modelo, v.placa) AS vehiculo,
              v.cliente_id, c.nombre AS cliente_nombre
       FROM ordenes_trabajo o
       JOIN vehiculos v ON v.id = o.vehiculo_id
       JOIN clientes c ON c.id = v.cliente_id
       WHERE o.estado IN (?)
         AND NOT EXISTS (
           SELECT 1 FROM facturas f WHERE f.orden_id = o.id AND f.estado <> 'anulada'
         )
       ORDER BY o.id DESC`,
      [ESTADOS_ORDEN_FACTURABLES]
    );
    return filas.map((f) => aObjetoCamel(f));
  }

  // Vista previa de la factura de una orden (servicios, repuestos, ITBIS y total)
  async obtenerDetalleOrden(ordenId) {
    ordenId = Number(ordenId);
    if (!Number.isInteger(ordenId) || ordenId <= 0) throw new Error("Orden de trabajo inválida");

    const [filas] = await this.pool.query(SQL_ORDEN, [ordenId]);
    const orden = aObjetoCamel(filas[0]);
    if (!orden) return null;
    if (!ESTADOS_ORDEN_FACTURABLES.includes(orden.estado)) {
      throw new Error(`La orden no está lista para facturar (estado: ${orden.estado})`);
    }

    const totales = await this._calcularTotales(this.pool, ordenId);
    return {
      ordenId: orden.id,
      vehiculo: orden.vehiculo,
      clienteId: orden.clienteId,
      clienteNombre: orden.clienteNombre,
      ...totales,
    };
  }

  // Solo recibe { ordenId }: cliente y total los calcula el servidor.
  async crearFactura(datos = {}) {
    const ordenId = Number(datos.ordenId);
    if (!Number.isInteger(ordenId) || ordenId <= 0) throw new Error("Orden de trabajo inválida");

    const conexion = await this.pool.getConnection();
    try {
      await conexion.beginTransaction();

      // Bloquea la orden para que dos facturaciones simultaneas no dupliquen la factura
      const [filas] = await conexion.query(`${SQL_ORDEN} FOR UPDATE`, [ordenId]);
      const orden = aObjetoCamel(filas[0]);

      if (!orden) throw new Error("Orden de trabajo no encontrada");
      if (!ESTADOS_ORDEN_FACTURABLES.includes(orden.estado)) {
        throw new Error(`La orden no se puede facturar (estado: ${orden.estado})`);
      }

      const [existentes] = await conexion.query(
        "SELECT id FROM facturas WHERE orden_id = ? AND estado <> 'anulada' LIMIT 1",
        [ordenId]
      );
      if (existentes.length > 0) throw new Error("Esta orden de trabajo ya tiene una factura");

      const { total } = await this._calcularTotales(conexion, ordenId);
      if (total <= 0) throw new Error("La orden no tiene servicios ni repuestos para facturar");

      const factura = new Factura({ ordenId, clienteId: orden.clienteId, total });
      const id = await new RepositorioMySQL(conexion, "facturas").guardar(factura);

      await conexion.query("UPDATE ordenes_trabajo SET estado = 'facturada' WHERE id = ?", [ordenId]);

      await conexion.commit();
      return { ...factura, id };
    } catch (error) {
      await conexion.rollback();
      throw error;
    } finally {
      conexion.release();
    }
  }

  async listarFacturas(estado) {
    if (estado) {
      if (!ESTADOS_VALIDOS.includes(estado)) throw new Error("Estado inválido");
      return this.repositorio.buscarPor("estado", estado);
    }
    return this.repositorio.listar();
  }

  async obtenerFactura(id) {
    return this.repositorio.buscarPorId(id);
  }

  async actualizarEstado(id, estado) {
    if (!ESTADOS_VALIDOS.includes(estado)) throw new Error("Estado inválido");
    return this.repositorio.actualizar(id, { estado });
  }

  async generarPDF(id) {
    const factura = await this.repositorio.buscarPorId(id);
    if (!factura) throw new Error("Factura no encontrada");

    const datos = [
      { nombre: "Factura #" + factura.id, descripcion: `Orden de trabajo: OT-${factura.ordenId}` },
      { nombre: "Cliente", descripcion: `Cliente: ${factura.clienteId}` },
      { nombre: "Total", descripcion: `RD$ ${Number(factura.total).toFixed(2)}` },
      { nombre: "Estado", descripcion: factura.estado },
    ];

    const ruta = path.join(os.tmpdir(), `factura_${factura.id}.pdf`);
    return this.generadorPDF.generar(datos, ruta);
  }
}

module.exports = FacturaService;