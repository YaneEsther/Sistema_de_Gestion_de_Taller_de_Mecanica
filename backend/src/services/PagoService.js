const RepositorioMySQL = require("../core/RepositorioMySQL");
const PasarelaPagoStripe = require("./PasarelaPagoStripe");
const Pago = require("../models/Pago");

class PagoService {
  constructor(pool, facturaService) {
    this.repositorio = new RepositorioMySQL(pool, "pagos");
    this.pasarela = new PasarelaPagoStripe();
    this.facturaService = facturaService; // para actualizar el estado de la factura al pagar
  }

  async procesarPago(facturaId, monto, metodoPago) {
    const factura = await this.facturaService.obtenerFactura(facturaId);
    if (!factura) throw new Error("Factura no encontrada");

    const resultado = await this.pasarela.procesarPago(monto, metodoPago);

    if (!resultado.exitoso) {
      throw new Error("El pago no pudo procesarse: " + resultado.mensaje);
    }

    const pago = new Pago({
      facturaId,
      monto,
      metodo: metodoPago,
      referencia: resultado.referencia,
    });

    const id = await this.repositorio.guardar(pago);
    await this.facturaService.actualizarEstado(facturaId, "pagada");

    return { id, ...pago, resultado };
  }

  async listarPagosPorFactura(facturaId) {
    const pagos = await this.repositorio.listar();
    return pagos.filter((p) => p.facturaId === facturaId);
  }
}

module.exports = PagoService;