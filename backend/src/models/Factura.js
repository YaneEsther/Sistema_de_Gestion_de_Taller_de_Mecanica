const EntidadBase = require("../core/EntidadBase");

class Factura extends EntidadBase {
  constructor({ id = null, ordenId, clienteId, total, estado = "pendiente", fecha = new Date() }) {
    super(id);
    this.ordenId = ordenId;
    this.clienteId = clienteId;
    this.total = total;
    this.estado = estado; // pendiente | pagada | anulada
    this.fecha = fecha;
  }
}

module.exports = Factura;