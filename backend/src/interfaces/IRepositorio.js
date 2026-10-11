class IRepositorio {
  async guardar(entidad) {
    throw new Error("Método guardar() no implementado");
  }

  async buscarPorId(id) {
    throw new Error("Método buscarPorId() no implementado");
  }

  async listar() {
    throw new Error("Método listar() no implementado");
  }

  async actualizar(id, entidad) {
    throw new Error("Método actualizar() no implementado");
  }

  async eliminar(id) {
    throw new Error("Método eliminar() no implementado");
  }
}

module.exports = IRepositorio;