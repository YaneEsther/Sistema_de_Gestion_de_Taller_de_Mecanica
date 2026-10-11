const pool = require("../config/db");
const ClienteService = require("../services/ClienteService");

const clienteService = new ClienteService(pool);

async function crear(req, res) {
  try {
    const cliente = await clienteService.guardar(req.body);
    res.status(201).json(cliente);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}

async function listar(req, res) {
  try {
    const clientes = await clienteService.listar();
    res.json(clientes);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

async function obtener(req, res) {
  try {
    const cliente = await clienteService.buscarPorId(req.params.id);
    if (!cliente) return res.status(404).json({ error: "Cliente no encontrado" });
    res.json(cliente);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

async function actualizar(req, res) {
  try {
    const cliente = await clienteService.actualizar(req.params.id, req.body);
    if (!cliente) return res.status(404).json({ error: "Cliente no encontrado" });
    res.json(cliente);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}

async function eliminar(req, res) {
  try {
    const eliminado = await clienteService.eliminar(req.params.id);
    if (!eliminado) return res.status(404).json({ error: "Cliente no encontrado" });
    res.json({ mensaje: "Cliente eliminado" });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}

module.exports = { crear, listar, obtener, actualizar, eliminar, clienteService };
