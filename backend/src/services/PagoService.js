const RepositorioMySQL = require("../core/RepositorioMySQL");
const { aObjetoCamel } = require("../core/mapeoCampos");
const PasarelaPagoStripe = require("./PasarelaPagoStripe");
const Pago = require("../models/Pago");

const METODOS_VALIDOS = ["Efectivo", "Tarjeta (Verifone)", "Tarjeta Cifrada", "Transferencia", "Cheque"];
// Solo "Tarjeta Cifrada" pasa por la pasarela; Verifone/efectivo/transferencia/cheque
// se cobran fuera del sistema y aquí solo se registran.
const METODOS_CON_PASARELA = ["Tarjeta Cifrada"];

class PagoService {
  constructor(pool) {
    this.pool = pool;
    this.repositorio = new RepositorioMySQL(pool, "pagos");
    this.pasarela = new PasarelaPagoStripe();
  }

  async procesarPago(facturaId, monto, metodoPago, referencia = null) {
    facturaId = Number(facturaId);
    monto = Number(monto);

    if (!Number.isInteger(facturaId) || facturaId <= 0) throw new Error("Factura inválida");
    if (!Number.isFinite(monto) || monto <= 0) throw new Error("Monto inválido");
    if (!METODOS_VALIDOS.includes(metodoPago)) throw new Error("Método de pago no válido");

    const conexion = await this.pool.getConnection();
    try {
      await conexion.beginTransaction();

      // Bloquea la fila para que dos pagos simultaneos no paguen la misma factura
      const [filas] = await conexion.query("SELECT * FROM facturas WHERE id = ? FOR UPDATE", [facturaId]);
      const factura = aObjetoCamel(filas[0]);

      if (!factura) throw new Error("Factura no encontrada");
      if (factura.estado !== "pendiente") {
        throw new Error(`La factura no está pendiente de pago (estado: ${factura.estado})`);
      }
      if (Math.abs(monto - Number(factura.total)) > 0.005) {
        throw new Error("El monto debe coincidir con el total de la factura");
      }

      let resultado = null;
      if (METODOS_CON_PASARELA.includes(metodoPago)) {
        resultado = await this.pasarela.procesarPago(monto, metodoPago);
        if (!resultado.exitoso) throw new Error("El pago no pudo procesarse: " + resultado.mensaje);
      }

      // pagos.referencia es VARCHAR(100)
      const referenciaFinal =
        [resultado?.referencia, referencia].filter(Boolean).join(" | ").slice(0, 100) || null;

      const pago = new Pago({ facturaId, monto, metodo: metodoPago, referencia: referenciaFinal });
      const id = await new RepositorioMySQL(conexion, "pagos").guardar(pago);
      await new RepositorioMySQL(conexion, "facturas").actualizar(facturaId, { estado: "pagada" });

      await conexion.commit();
      return { ...pago, id };
    } catch (error) {
      await conexion.rollback();
      throw error;
    } finally {
      conexion.release();
    }
  }

  async listarPagos(limite = 50) {
    const [rows] = await this.pool.query("SELECT * FROM pagos ORDER BY id DESC LIMIT ?", [limite]);
    return rows.map((fila) => aObjetoCamel(fila));
  }

  async listarPagosPorFactura(facturaId) {
    return this.repositorio.buscarPor("facturaId", Number(facturaId));
  }
}

module.exports = PagoService;