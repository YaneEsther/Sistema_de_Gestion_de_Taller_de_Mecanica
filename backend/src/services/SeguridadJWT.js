const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const ISeguridad = require("../interfaces/ISeguridad");

class SeguridadJWT extends ISeguridad {
  constructor() {
    super();
    this.claveSecreta = "taller_mecanica_2026";
  }

  async iniciarSesion(usuario, contraseña) {
    // Usuario de prueba
    const usuarioBD = {
      id: 1,
      usuario: "admin",
      contraseñaHash: await bcrypt.hash("123456", 10),
    };

    const coincide = await bcrypt.compare(
      contraseña,
      usuarioBD.contraseñaHash
    );

    if (!coincide || usuario !== usuarioBD.usuario) {
      throw new Error("Credenciales incorrectas");
    }

    const token = jwt.sign(
      { id: usuarioBD.id, usuario: usuarioBD.usuario },
      this.claveSecreta,
      { expiresIn: "1h" }
    );

    return token;
  }

  verificarToken(token) {
    return jwt.verify(token, this.claveSecreta);
  }
}

module.exports = SeguridadJWT;