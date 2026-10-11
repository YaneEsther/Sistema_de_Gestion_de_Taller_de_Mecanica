const express = require("express");
const router = express.Router();
const clienteController = require("../controllers/clienteController");

router.post("/", clienteController.crear);
router.get("/", clienteController.listar);
router.get("/:id", clienteController.obtener);
router.put("/:id", clienteController.actualizar);
router.delete("/:id", clienteController.eliminar);

module.exports = router;
