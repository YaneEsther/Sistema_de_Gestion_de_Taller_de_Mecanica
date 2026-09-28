const IAuditable = require("../interfaces/IAuditable");

class LogAuditoria extends IAuditable {
  registrarCambio(usuario, accion, entidad) {
    const registro = {
      usuario,
      accion,
      entidad,
      fecha: new Date()
    };

    console.log("=== AUDITORÍA ===");
    console.log(registro);
    console.log("=================");

    return registro;
  }
}

module.exports = LogAuditoria;