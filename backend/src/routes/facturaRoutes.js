const express = require("express");
const router = express.Router();
const facturaController = require("../controllers/facturaController");

router.get("/ordenes-facturables", facturaController.ordenesFacturables);
router.get("/orden-detalle/:ordenId", facturaController.detalleOrden);

router.post("/", facturaController.crear);
router.get("/", facturaController.listar);
router.get("/:id/pdf", facturaController.generarPDF);
router.get("/:id", facturaController.obtener);

module.exports = router;