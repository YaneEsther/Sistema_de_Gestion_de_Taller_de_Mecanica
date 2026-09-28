const IPasarelaPago = require("../interfaces/IPasarelaPago");

class PasarelaPagoStripe extends IPasarelaPago {
  async procesarPago(monto, metodoPago) {
    return {
      exitoso: true,
      mensaje: "Pago procesado correctamente",
      monto,
      metodo: metodoPago,
      referencia: "STRIPE-SIM-001"
    };
  }
}

module.exports = PasarelaPagoStripe;