const pool = require("../config/db");
const FacturaService = require("../services/FacturaService");

const facturaService = new FacturaService(pool);

// Solo se usa ordenId: el cliente y el total los calcula el servidor
async function crear(req, res) {
  try {
    const factura = await facturaService.crearFactura(req.body ?? {});
    res.status(201).json(factura);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}

// GET /api/facturas                  -> todas
// GET /api/facturas?estado=pendiente -> solo las pendientes
async function listar(req, res) {
  try {
    res.json(await facturaService.listarFacturas(req.query.estado));
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}

// GET /api/facturas/ordenes-facturables
async function ordenesFacturables(req, res) {
  try {
    res.json(await facturaService.listarOrdenesFacturables());
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

// GET /api/facturas/orden-detalle/:ordenId
async function detalleOrden(req, res) {
  try {
    const detalle = await facturaService.obtenerDetalleOrden(req.params.ordenId);
    if (!detalle) return res.status(404).json({ error: "Orden de trabajo no encontrada" });
    res.json(detalle);
  } catch (error) {
    res.status(400).json({ error: error.message });
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

module.exports = { crear, listar, ordenesFacturables, detalleOrden, obtener, generarPDF };