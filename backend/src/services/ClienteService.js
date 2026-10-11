const IRepositorio = require("../interfaces/IRepositorio");
const RepositorioMySQL = require("../core/RepositorioMySQL");
const Cliente = require("../models/Cliente");

/**
 * Servicio del modulo Clientes.
 * Implementa IRepositorio<Cliente> y reutiliza la persistencia generica del nucleo.
 */
class ClienteService extends IRepositorio {
  constructor(pool) {
    super();
    this.repositorio = new RepositorioMySQL(pool, "clientes");
  }

  async guardar(datos) {
    const cliente = datos instanceof Cliente ? datos : new Cliente(datos);
    cliente.id = await this.repositorio.guardar(cliente);
    return cliente;
  }

  async buscarPorId(id) {
    const cliente = await this.repositorio.buscarPorId(id);
    return cliente || null;
  }

  async listar() {
    return this.repositorio.listar();
  }

  // Devuelve null si el cliente no existe
  async actualizar(id, datos) {
    const encontrado = await this.buscarPorId(id);
    if (!encontrado) return null;

    const cliente = new Cliente(encontrado);
    cliente.actualizarDatos(datos);

    await this.repositorio.actualizar(id, {
      nombre: cliente.nombre,
      telefono: cliente.telefono,
      correo: cliente.correo,
      direccion: cliente.direccion,
    });

    return this.buscarPorId(id);
  }

  // Devuelve false si el cliente no existe
  async eliminar(id) {
    const encontrado = await this.buscarPorId(id);
    if (!encontrado) return false;

    try {
      await this.repositorio.eliminar(id);
    } catch (error) {
      if (error.code === "ER_ROW_IS_REFERENCED_2") {
        throw new Error("No se puede eliminar: el cliente tiene vehiculos registrados");
      }
      throw error;
    }

    return true;
  }
}

module.exports = ClienteService;
