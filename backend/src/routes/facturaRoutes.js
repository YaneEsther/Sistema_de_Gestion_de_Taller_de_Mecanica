const express = require("express");
const router = express.Router();
const facturaController = require("../controllers/facturaController");

router.post("/", facturaController.crear);
router.get("/", facturaController.listar);
router.get("/:id", facturaController.obtener);
router.get("/:id/pdf", facturaController.generarPDF);

module.exports = router;