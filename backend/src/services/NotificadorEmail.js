const INotificador = require("../interfaces/INotificador");

class NotificadorEmail extends INotificador {
  async enviar(destinatario, asunto, mensaje) {
    console.log("=== NOTIFICACIÓN ===");
    console.log("Para:", destinatario);
    console.log("Asunto:", asunto);
    console.log("Mensaje:", mensaje);
    console.log("====================");

    return {
      enviado: true,
      destinatario,
      asunto
    };
  }
}

module.exports = NotificadorEmail;