const pool = require("../config/db");
const PagoService = require("../services/PagoService");

const pagoService = new PagoService(pool);

async function procesar(req, res) {
  try {
    const { facturaId, monto, metodoPago, referencia } = req.body ?? {};
    const pago = await pagoService.procesarPago(
      facturaId,
      monto,
      metodoPago,
      typeof referencia === "string" ? referencia.trim() : null
    );
    res.status(201).json(pago);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}

// GET /api/pagos -> historial reciente
async function listar(req, res) {
  try {
    res.json(await pagoService.listarPagos());
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

async function listarPorFactura(req, res) {
  try {
    res.json(await pagoService.listarPagosPorFactura(req.params.facturaId));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

module.exports = { procesar, listar, listarPorFactura };