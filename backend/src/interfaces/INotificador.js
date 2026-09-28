class INotificador {
  async enviar(destinatario, asunto, mensaje) {
    throw new Error("Método enviar() no implementado");
  }
}

module.exports = INotificador;