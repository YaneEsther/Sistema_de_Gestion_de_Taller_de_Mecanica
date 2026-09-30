const express = require("express");
const router = express.Router();
const pagoController = require("../controllers/pagoController");

router.post("/", pagoController.procesar);
router.get("/factura/:facturaId", pagoController.listarPorFactura);

module.exports = router;