class IPasarelaPago {
  async procesarPago(monto, metodoPago) {
    throw new Error("Método procesarPago() no implementado");
  }
}

module.exports = IPasarelaPago;