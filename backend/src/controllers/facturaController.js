const pool = require("../config/db");
const FacturaService = require("../services/FacturaService");

const facturaService = new FacturaService(pool);

async function crear(req, res) {
  try {
    const factura = await facturaService.crearFactura(req.body);
    res.status(201).json(factura);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}

async function listar(req, res) {
  try {
    const facturas = await facturaService.listarFacturas();
    res.json(facturas);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

async function obtener(req, res) {
  try {
    const factura = await facturaService.obtenerFactura(req.params.id);
    if (!factura) return res.status(404).json({ error: "Factura no encontrada" });
    res.json(factura);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

async function generarPDF(req, res) {
  try {
    const archivo = await facturaService.generarPDF(req.params.id);
    res.download(archivo);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}

module.exports = { crear, listar, obtener, generarPDF, facturaService };