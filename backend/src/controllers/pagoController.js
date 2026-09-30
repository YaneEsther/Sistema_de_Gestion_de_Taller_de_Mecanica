const pool = require("../config/db");
const PagoService = require("../services/PagoService");
const { facturaService } = require("./facturaController");

const pagoService = new PagoService(pool, facturaService);

async function procesar(req, res) {
  try {
    const { facturaId, monto, metodoPago } = req.body;
    const pago = await pagoService.procesarPago(facturaId, monto, metodoPago);
    res.status(201).json(pago);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}

async function listarPorFactura(req, res) {
  try {
    const pagos = await pagoService.listarPagosPorFactura(req.params.facturaId);
    res.json(pagos);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

module.exports = { procesar, listarPorFactura };