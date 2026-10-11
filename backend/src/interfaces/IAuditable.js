class IAuditable {
  registrarCambio(usuario, accion, entidad) {
    throw new Error("Método registrarCambio() no implementado");
  }
}

module.exports = IAuditable;