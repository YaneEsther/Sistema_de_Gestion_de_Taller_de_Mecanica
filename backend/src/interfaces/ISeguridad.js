class ISeguridad {
  async iniciarSesion(usuario, contraseña) {
    throw new Error("Método iniciarSesion() no implementado");
  }

  verificarToken(token) {
    throw new Error("Método verificarToken() no implementado");
  }
}

module.exports = ISeguridad;