const EntidadBase = require("../core/EntidadBase");

class Pago extends EntidadBase {
  constructor({ id = null, facturaId, monto, metodo, referencia = null, fecha = new Date() }) {
    super(id);
    this.facturaId = facturaId;
    this.monto = monto;
    this.metodo = metodo;
    this.referencia = referencia;
    this.fecha = fecha;
  }
}

module.exports = Pago;